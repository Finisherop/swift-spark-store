-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now we can drop and recreate the function with proper security settings
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the function with fixed search_path security issue
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'  -- Fixed: Set immutable search_path for security
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Add missing DELETE policy for profiles table
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Ensure the profiles table user_id column is NOT NULL for security
-- (This prevents insertion of profiles without proper user association)
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;

-- Add index on user_id for better performance with RLS
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Recreate the trigger to ensure profiles are created for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();