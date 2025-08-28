-- FINAL SQL CODE TO RUN IN SUPABASE
-- Delete old policies and create new ones for akk116636@gmail.com
-- Copy-paste this entire code in Supabase SQL Editor and RUN

-- ============================================================================
-- 1. DELETE OLD POLICIES (if any exist)
-- ============================================================================

-- Drop existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access" ON storage.objects;

-- Drop old function if exists
DROP FUNCTION IF EXISTS public.is_admin_user(UUID);

-- ============================================================================
-- 2. ENABLE RLS (Row Level Security)
-- ============================================================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. CREATE NEW POLICIES FOR YOUR ADMIN EMAIL
-- ============================================================================

-- Policy 1: Allow PUBLIC READ access (everyone can view images)
CREATE POLICY "Public read access for product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Policy 2: Allow ONLY akk116636@gmail.com to UPLOAD images
CREATE POLICY "Admin users can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (
    -- Your specific admin email
    auth.jwt() ->> 'email' = 'akk116636@gmail.com'
    OR
    -- OR check admin role in metadata (backup method)
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  )
);

-- Policy 3: Allow ONLY akk116636@gmail.com to UPDATE images
CREATE POLICY "Admin users can update product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (
    -- Your specific admin email
    auth.jwt() ->> 'email' = 'akk116636@gmail.com'
    OR
    -- OR check admin role in metadata (backup method)
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  )
);

-- Policy 4: Allow ONLY akk116636@gmail.com to DELETE images
CREATE POLICY "Admin users can delete product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (
    -- Your specific admin email
    auth.jwt() ->> 'email' = 'akk116636@gmail.com'
    OR
    -- OR check admin role in metadata (backup method)
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  )
);

-- ============================================================================
-- 4. CREATE ADMIN HELPER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  user_role TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = user_id;
  
  -- Get user role from metadata
  SELECT 
    COALESCE(
      raw_user_meta_data ->> 'role',
      raw_app_meta_data ->> 'role'
    ) INTO user_role
  FROM auth.users 
  WHERE id = user_id;
  
  -- Return true if user is admin
  RETURN (
    user_email = 'akk116636@gmail.com' OR 
    user_role = 'admin'
  );
END;
$$;

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.is_admin_user TO authenticated;

-- ============================================================================
-- 6. SET ADMIN ROLE FOR YOUR EMAIL
-- ============================================================================

-- Set admin role for akk116636@gmail.com
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'akk116636@gmail.com';

-- ============================================================================
-- 7. VERIFY SETUP (Optional - you can run these to check)
-- ============================================================================

-- Check if your user has admin role
-- SELECT email, raw_user_meta_data FROM auth.users WHERE email = 'akk116636@gmail.com';

-- Check if policies are created
-- SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Make sure 'product-images' bucket exists and is PUBLIC
-- 2. Only akk116636@gmail.com can upload/edit/delete images
-- 3. Everyone can view images (public access for website)
-- 4. If policies already exist, they will be replaced with new ones
-- 5. Your admin role is set automatically in this script
-- ============================================================================