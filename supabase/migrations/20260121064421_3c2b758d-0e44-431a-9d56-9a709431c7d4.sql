
-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.products
    SET 
      average_rating = COALESCE((
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM public.reviews
        WHERE product_id = OLD.product_id AND is_approved = true
      ), 0),
      review_count = (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE product_id = OLD.product_id AND is_approved = true
      )
    WHERE id = OLD.product_id;
    RETURN OLD;
  ELSE
    UPDATE public.products
    SET 
      average_rating = COALESCE((
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM public.reviews
        WHERE product_id = NEW.product_id AND is_approved = true
      ), 0),
      review_count = (
        SELECT COUNT(*)
        FROM public.reviews
        WHERE product_id = NEW.product_id AND is_approved = true
      )
    WHERE id = NEW.product_id;
    RETURN NEW;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.order_number = 'VB' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_product_popularity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
    UPDATE public.products
    SET popularity_count = popularity_count + order_items.quantity
    FROM public.order_items
    WHERE order_items.order_id = NEW.id
    AND products.id = order_items.product_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code TEXT,
  p_subtotal INTEGER
)
RETURNS TABLE (
  valid BOOLEAN,
  discount INTEGER,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
  v_discount INTEGER;
BEGIN
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE code = UPPER(p_code)
  AND is_active = true
  AND starts_at <= now()
  AND (ends_at IS NULL OR ends_at > now());
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Invalid or expired coupon code'::TEXT;
    RETURN;
  END IF;
  
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
    RETURN QUERY SELECT false, 0, 'Coupon usage limit reached'::TEXT;
    RETURN;
  END IF;
  
  IF p_subtotal < v_coupon.min_subtotal THEN
    RETURN QUERY SELECT false, 0, ('Minimum order value of ₹' || (v_coupon.min_subtotal / 100)::TEXT || ' required')::TEXT;
    RETURN;
  END IF;
  
  IF v_coupon.percent_off IS NOT NULL THEN
    v_discount := (p_subtotal * v_coupon.percent_off) / 100;
  ELSE
    v_discount := COALESCE(v_coupon.amount_off, 0);
  END IF;
  
  IF v_coupon.max_discount IS NOT NULL AND v_discount > v_coupon.max_discount THEN
    v_discount := v_coupon.max_discount;
  END IF;
  
  RETURN QUERY SELECT true, v_discount, ('Coupon applied! You save ₹' || (v_discount / 100)::TEXT)::TEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_stock INTEGER;
BEGIN
  SELECT stock_qty INTO v_current_stock
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;
  
  IF v_current_stock IS NULL OR v_current_stock < p_quantity THEN
    RETURN false;
  END IF;
  
  UPDATE public.products
  SET stock_qty = stock_qty - p_quantity
  WHERE id = p_product_id;
  
  RETURN true;
END;
$$;

-- Drop the permissive policy and replace with proper one
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;

CREATE POLICY "Anyone can subscribe with valid email"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
