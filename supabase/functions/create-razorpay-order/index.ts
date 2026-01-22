import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CartItem {
  productId: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

interface CreateOrderRequest {
  items: CartItem[];
  addressId: string;
  deliveryType: 'standard' | 'express';
  couponCode?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')!;
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { items, addressId, deliveryType, couponCode }: CreateOrderRequest = await req.json();

    // Validate items
    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch address
    const { data: address, error: addressError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', user.id)
      .single();

    if (addressError || !address) {
      console.error('Address error:', addressError);
      return new Response(
        JSON.stringify({ error: 'Invalid address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate totals (prices are in paise)
    let subtotal = 0;
    const orderItems: Array<{
      product_id: string;
      product_snapshot: { name: string; image: string; price: number };
      quantity: number;
      size: string | null;
      color: string | null;
      unit_price: number;
    }> = [];

    for (const item of items) {
      // Fetch current product to verify price and stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, price, discount_price, stock_qty, is_active')
        .eq('id', item.productId)
        .single();

      if (productError || !product) {
        console.error('Product not found:', item.productId);
        return new Response(
          JSON.stringify({ error: `Product not found: ${item.name}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!product.is_active) {
        return new Response(
          JSON.stringify({ error: `Product no longer available: ${product.name}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (product.stock_qty < item.quantity) {
        return new Response(
          JSON.stringify({ error: `Insufficient stock for ${product.name}. Available: ${product.stock_qty}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const unitPrice = product.discount_price ?? product.price;
      subtotal += unitPrice * item.quantity;

      orderItems.push({
        product_id: product.id,
        product_snapshot: {
          name: product.name,
          image: item.image,
          price: unitPrice,
        },
        quantity: item.quantity,
        size: item.size ?? null,
        color: item.color ?? null,
        unit_price: unitPrice,
      });
    }

    // Calculate shipping (free above ₹2999)
    const shippingCost = subtotal >= 299900 ? 0 : (deliveryType === 'express' ? 29900 : 19900);

    // Validate and apply coupon
    let discountAmount = 0;
    if (couponCode) {
      const { data: couponResult, error: couponError } = await supabase
        .rpc('validate_coupon', { p_code: couponCode, p_subtotal: subtotal });

      if (couponError) {
        console.error('Coupon validation error:', couponError);
      } else if (couponResult && couponResult.length > 0 && couponResult[0].valid) {
        discountAmount = couponResult[0].discount;
      }
    }

    const total = subtotal - discountAmount + shippingCost;

    // Create address snapshot
    const addressSnapshot = {
      full_name: address.full_name,
      phone: address.phone,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    };

    // Create Razorpay order
    const razorpayAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: total, // in paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          user_id: user.id,
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const razorpayError = await razorpayResponse.text();
      console.error('Razorpay error:', razorpayError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log('Razorpay order created:', razorpayOrder.id);

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        address_snapshot: addressSnapshot,
        delivery_type: deliveryType,
        subtotal,
        shipping_cost: shippingCost,
        discount_amount: discountAmount,
        coupon_code: couponCode ?? null,
        total,
        status: 'pending',
        razorpay_order_id: razorpayOrder.id,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      console.error('Order items error:', itemsError);
      // Cleanup: delete the order
      await supabase.from('orders').delete().eq('id', order.id);
      return new Response(
        JSON.stringify({ error: 'Failed to create order items' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order created successfully:', order.id);

    return new Response(
      JSON.stringify({
        orderId: order.id,
        orderNumber: order.order_number,
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId,
        amount: total,
        currency: 'INR',
        prefill: {
          name: address.full_name,
          contact: address.phone,
          email: user.email,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
