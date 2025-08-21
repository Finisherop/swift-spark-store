-- Add currency column to products table
ALTER TABLE public.products 
ADD COLUMN currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'));

-- Update existing products to have USD currency (since they were entered in USD format)
UPDATE public.products 
SET currency = 'USD' 
WHERE currency IS NULL;

-- Make currency NOT NULL after setting default values
ALTER TABLE public.products 
ALTER COLUMN currency SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.products.currency IS 'Currency code for the product price (USD, INR, EUR, etc.)';