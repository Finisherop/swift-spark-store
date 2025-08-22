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

-- Fix other security issues by restricting access to sensitive tables
-- Update website_users policies to be more restrictive
DROP POLICY IF EXISTS "Authenticated users can view visitor data" ON public.website_users;
DROP POLICY IF EXISTS "Authenticated users can update visitor data" ON public.website_users;
DROP POLICY IF EXISTS "Authenticated users can delete visitor data" ON public.website_users;

-- System can still insert visitor tracking data (for analytics)
-- But now only allow system/anonymous to insert, not view
CREATE POLICY "System can insert visitor data" 
ON public.website_users 
FOR INSERT 
WITH CHECK (true);

-- Block all authenticated user access to visitor data for privacy
CREATE POLICY "Block authenticated access to visitor data" 
ON public.website_users 
FOR SELECT 
TO authenticated
USING (false);

-- Update product_clicks to protect business analytics
DROP POLICY IF EXISTS "Authenticated users can view clicks" ON public.product_clicks;

-- Block authenticated user access to product analytics
CREATE POLICY "Block authenticated access to product clicks" 
ON public.product_clicks 
FOR SELECT 
TO authenticated
USING (false);

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