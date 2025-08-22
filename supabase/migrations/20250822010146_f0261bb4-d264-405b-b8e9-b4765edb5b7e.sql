-- Remove the overly permissive policy that allows anyone to access visitor data
DROP POLICY IF EXISTS "Anyone can track website users" ON public.website_users;

-- Create a secure policy that allows visitor tracking but restricts data access
CREATE POLICY "Allow visitor tracking inserts" 
ON public.website_users 
FOR INSERT 
WITH CHECK (true);

-- Restrict SELECT access to authenticated users only (for admin functionality)
CREATE POLICY "Authenticated users can view visitor data" 
ON public.website_users 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Prevent UPDATE and DELETE operations except for authenticated users
CREATE POLICY "Authenticated users can update visitor data" 
ON public.website_users 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete visitor data" 
ON public.website_users 
FOR DELETE 
USING (auth.uid() IS NOT NULL);