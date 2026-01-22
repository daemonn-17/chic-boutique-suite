import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCartStore, CartItem } from '@/store/cartStore';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
  prefill: {
    name: string;
    contact: string;
    email: string;
  };
}

interface CheckoutParams {
  items: CartItem[];
  addressId: string;
  deliveryType: 'standard' | 'express';
  couponCode?: string;
}

export function useCheckout() {
  const { session } = useAuth();
  const { clearCart } = useCartStore();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createOrder = useMutation({
    mutationFn: async (params: CheckoutParams): Promise<CreateOrderResponse> => {
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: params,
      });

      if (error) {
        throw new Error(error.message || 'Failed to create order');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    },
  });

  const verifyPayment = useMutation({
    mutationFn: async (params: {
      orderId: string;
      razorpayPaymentId: string;
      razorpayOrderId: string;
      razorpaySignature: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: params,
      });

      if (error) {
        throw new Error(error.message || 'Failed to verify payment');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    },
  });

  const initiateCheckout = async (
    params: CheckoutParams,
    onSuccess: (orderNumber: string) => void,
    onError: (error: string) => void
  ) => {
    if (!session) {
      onError('Please login to continue');
      return;
    }

    setIsProcessing(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Create order
      const orderData = await createOrder.mutateAsync(params);

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Vastra Boutique',
        description: `Order #${orderData.orderNumber}`,
        order_id: orderData.razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const result = await verifyPayment.mutateAsync({
              orderId: orderData.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            // Clear cart and refresh orders
            clearCart();
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            
            toast.success('Payment successful!');
            onSuccess(result.orderNumber);
          } catch (error) {
            console.error('Payment verification failed:', error);
            onError(error instanceof Error ? error.message : 'Payment verification failed');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: orderData.prefill.name,
          email: orderData.prefill.email,
          contact: orderData.prefill.contact,
        },
        theme: {
          color: '#8B4513',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
      setIsProcessing(false);
      onError(error instanceof Error ? error.message : 'Checkout failed');
    }
  };

  return {
    initiateCheckout,
    isProcessing,
    isCreatingOrder: createOrder.isPending,
    isVerifyingPayment: verifyPayment.isPending,
  };
}
