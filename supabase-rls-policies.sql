-- Supabase RLS Policies for Image Storage
-- Run this SQL code in your Supabase SQL Editor

-- ============================================================================
-- 1. Create the storage bucket for product images (if not exists)
-- ============================================================================

-- Create the bucket (run this in Supabase Dashboard > Storage, or via SQL)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'product-images',
--   'product-images',
--   true,
--   10485760, -- 10MB limit
--   ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml']
-- );

-- ============================================================================
-- 2. RLS Policies for Storage Objects
-- ============================================================================

-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public READ access to all files in product-images bucket
-- This allows anyone to view/download images without authentication
CREATE POLICY "Public read access for product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Policy: Allow authenticated admin users to INSERT/UPLOAD files
-- Only users with admin role can upload new images
CREATE POLICY "Admin users can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (
    -- Check if user email contains 'admin' (simple approach)
    auth.jwt() ->> 'email' LIKE '%admin%'
    OR
    -- Check if user has admin role in metadata
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    OR
    -- Check if user has admin role in app_metadata
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  )
);

-- Policy: Allow authenticated admin users to UPDATE files
-- Admins can modify existing images
CREATE POLICY "Admin users can update product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (
    auth.jwt() ->> 'email' LIKE '%admin%'
    OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  )
);

-- Policy: Allow authenticated admin users to DELETE files
-- Admins can delete images
CREATE POLICY "Admin users can delete product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (
    auth.jwt() ->> 'email' LIKE '%admin%'
    OR
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  )
);

-- ============================================================================
-- 3. Optional: Create admin role function for easier management
-- ============================================================================

-- Create a function to check if a user is admin
-- This can be used in other policies or application logic
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_role TEXT;
BEGIN
  -- Get user email and role
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = user_id;
  
  -- Check various sources for admin role
  SELECT 
    COALESCE(
      raw_user_meta_data ->> 'role',
      raw_app_meta_data ->> 'role'
    ) INTO user_role
  FROM auth.users 
  WHERE id = user_id;
  
  -- Return true if user is admin
  RETURN (
    user_email LIKE '%admin%' OR 
    user_role = 'admin'
  );
END;
$$;

-- ============================================================================
-- 4. Alternative simplified policies using the admin function
-- ============================================================================

-- You can replace the above policies with these simpler ones:

-- DROP POLICY IF EXISTS "Admin users can upload product images" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin users can update product images" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin users can delete product images" ON storage.objects;

-- CREATE POLICY "Admin upload access"
-- ON storage.objects
-- FOR INSERT
-- WITH CHECK (
--   bucket_id = 'product-images' 
--   AND auth.role() = 'authenticated'
--   AND public.is_admin_user()
-- );

-- CREATE POLICY "Admin update access"
-- ON storage.objects
-- FOR UPDATE
-- USING (
--   bucket_id = 'product-images' 
--   AND auth.role() = 'authenticated'
--   AND public.is_admin_user()
-- );

-- CREATE POLICY "Admin delete access"
-- ON storage.objects
-- FOR DELETE
-- USING (
--   bucket_id = 'product-images' 
--   AND auth.role() = 'authenticated'
--   AND public.is_admin_user()
-- );

-- ============================================================================
-- 5. Grant necessary permissions
-- ============================================================================

-- Grant execute permission on the admin function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_user TO authenticated;

-- ============================================================================
-- 6. How to make a user admin
-- ============================================================================

-- Method 1: Update user metadata (run this for each admin user)
-- UPDATE auth.users 
-- SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'admin@example.com';

-- Method 2: Use Supabase Dashboard
-- Go to Authentication > Users, select a user, and add role: admin to User Metadata

-- Method 3: Set admin role during signup (in your app code)
-- const { data, error } = await supabase.auth.signUp({
--   email: 'admin@example.com',
--   password: 'password',
--   options: {
--     data: {
--       role: 'admin'
--     }
--   }
-- });

-- ============================================================================
-- 7. Testing the policies
-- ============================================================================

-- Test public read access (should work for everyone)
-- SELECT * FROM storage.objects WHERE bucket_id = 'product-images';

-- Test admin upload (should work only for admin users)
-- This would be tested via the application upload functionality

-- ============================================================================
-- Notes:
-- ============================================================================
-- 1. The bucket must be set to PUBLIC for direct CDN access
-- 2. These policies ensure only admin users can upload/modify/delete
-- 3. Everyone can read/view the images (public access)
-- 4. Admin status is determined by email containing 'admin' or role metadata
-- 5. You can customize the admin check logic in the is_admin_user function
-- 6. Make sure to create the 'product-images' bucket in Supabase Storage first
-- ============================================================================