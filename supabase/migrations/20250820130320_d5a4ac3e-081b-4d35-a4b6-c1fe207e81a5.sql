-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  discount_percentage INTEGER DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('Fashion', 'Health & Fitness', 'Digital Products', 'Beauty')),
  badge TEXT CHECK (badge IN ('New', 'Best Seller', 'Trending', 'Limited Stock')),
  affiliate_link TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product clicks tracking table
CREATE TABLE public.product_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  click_type TEXT NOT NULL CHECK (click_type IN ('view_details', 'buy_now')),
  user_ip TEXT,
  user_agent TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users tracking table for admin analytics
CREATE TABLE public.website_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_ip TEXT,
  user_agent TEXT,
  first_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_visit TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to products
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (is_active = true);

-- Create policies for click tracking (anyone can insert)
CREATE POLICY "Anyone can track product clicks" 
ON public.product_clicks 
FOR INSERT 
WITH CHECK (true);

-- Create policies for user tracking (anyone can insert/update)
CREATE POLICY "Anyone can track website users" 
ON public.website_users 
FOR ALL 
USING (true);

-- Admin can manage everything (we'll implement admin auth in the app)
CREATE POLICY "Admin can manage products" 
ON public.products 
FOR ALL 
USING (true);

CREATE POLICY "Admin can view clicks" 
ON public.product_clicks 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can view users" 
ON public.website_users 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products
INSERT INTO public.products (name, description, short_description, price, original_price, discount_percentage, category, badge, affiliate_link, images) VALUES
('Premium Wireless Headphones', 'High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.', 'Premium noise-cancelling headphones', 2999.00, 3999.00, 25, 'Digital Products', 'Best Seller', 'https://example.com/headphones', ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500']),
('Stylish Summer Dress', 'Beautiful floral summer dress made from premium cotton. Perfect for casual outings and beach vacations.', 'Elegant floral summer dress', 1299.00, 1999.00, 35, 'Fashion', 'New', 'https://example.com/dress', ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500']),
('Organic Face Serum', 'Vitamin C enriched organic face serum for glowing skin. Suitable for all skin types.', 'Vitamin C organic face serum', 899.00, 1299.00, 31, 'Beauty', 'Trending', 'https://example.com/serum', ARRAY['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500']),
('Protein Powder', 'Whey protein powder for muscle building and recovery. Chocolate flavor, 2kg pack.', '2kg chocolate whey protein', 2499.00, 2999.00, 17, 'Health & Fitness', 'Limited Stock', 'https://example.com/protein', ARRAY['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500']),
('Designer Jeans', 'Premium denim jeans with perfect fit and comfort. Available in multiple sizes.', 'Premium fit designer jeans', 1899.00, 2499.00, 24, 'Fashion', 'Best Seller', 'https://example.com/jeans', ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500']);