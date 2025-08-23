-- Add Amazon product support fields to products table
ALTER TABLE public.products 
ADD COLUMN is_amazon_product BOOLEAN DEFAULT false,
ADD COLUMN amazon_affiliate_link TEXT,
ADD COLUMN amazon_image_url TEXT,
ADD COLUMN short_description_amazon TEXT,
ADD COLUMN long_description_amazon TEXT;