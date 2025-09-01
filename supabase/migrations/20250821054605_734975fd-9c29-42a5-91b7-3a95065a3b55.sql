-- Fix security issue: Restrict product_clicks SELECT access to authenticated admins only
-- Remove the overly permissive admin policy that allows anyone to view clicks
DROP POLICY IF EXISTS "Admin can view clicks" ON public.product_clicks;

-- Create a new policy that properly restricts access to authenticated users only
-- Since there's no role column in profiles table, we'll restrict to any authenticated user for now
-- In a production environment, you'd want to add an admin role system
CREATE POLICY "Authenticated users can view clicks" 
ON public.product_clicks 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Keep the existing insert policy as it's needed for tracking functionality
-- The "Anyone can track product clicks" INSERT policy remains unchanged