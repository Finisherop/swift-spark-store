-- Fix the critical profiles table security issue
-- Drop existing SELECT policy and create more restrictive ones
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create explicit policies that block public access and restrict authenticated access
CREATE POLICY "Authenticated users can only view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Explicitly block public access to profiles
CREATE POLICY "Block public access to profiles" 
ON public.profiles 
FOR SELECT 
TO anon
USING (false);

-- Fix other security issues by restricting admin-only access to sensitive tables
-- Update website_users policies to admin-only
DROP POLICY IF EXISTS "Authenticated users can view visitor data" ON public.website_users;
DROP POLICY IF EXISTS "Authenticated users can update visitor data" ON public.website_users;
DROP POLICY IF EXISTS "Authenticated users can delete visitor data" ON public.website_users;

-- Only admin and system can view/manage visitor tracking data
CREATE POLICY "System can insert visitor data" 
ON public.website_users 
FOR INSERT 
USING (true);

CREATE POLICY "Admin can view visitor data" 
ON public.website_users 
FOR SELECT 
TO authenticated
USING (false); -- For now, block all access until proper admin role system is implemented

-- Update product_clicks to be admin-only for SELECT
DROP POLICY IF EXISTS "Authenticated users can view clicks" ON public.product_clicks;

CREATE POLICY "Admin can view product clicks" 
ON public.product_clicks 
FOR SELECT 
TO authenticated
USING (false); -- For now, block all access until proper admin role system is implemented

-- Fix the remaining function search path issue for update_updated_at_column
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Fixed: Set immutable search_path
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Recreate any triggers that depend on this function
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();