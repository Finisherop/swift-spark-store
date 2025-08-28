# Supabase Image Upload System Setup Guide

This guide explains how to set up and use the new Supabase-based image handling system that replaces the old static image approach.

## 🚀 Quick Setup

### 1. Create Supabase Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** section
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `product-images`
   - **Public bucket**: ✅ **ENABLED** (very important for CDN URLs)
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp, image/avif, image/svg+xml`

### 2. Set up RLS Policies

1. Go to **SQL Editor** in your Supabase Dashboard
2. Copy and paste the content from `supabase-rls-policies.sql`
3. Execute the SQL to create the necessary policies

### 3. Create Admin Users

Choose one of these methods to make users admin:

#### Method A: Via SQL Editor
```sql
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-admin@email.com';
```

#### Method B: Via Supabase Dashboard
1. Go to **Authentication > Users**
2. Click on a user
3. Add to **User Metadata**: `{"role": "admin"}`

#### Method C: During Signup (in app code)
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'admin@example.com',
  password: 'password',
  options: {
    data: {
      role: 'admin'
    }
  }
});
```

## 📸 How to Use the New Image System

### For Admin Users

1. **Log in** with an admin account
2. Go to **Admin Dashboard** (add `/admin` to your URL or access via admin panel)
3. When adding/editing products:
   - Use the **new drag & drop upload area**
   - Drag images directly onto the upload zone
   - Images are automatically uploaded to Supabase
   - Public CDN URLs are generated and saved to database
   - **No more manual URL entry needed!**

### For Developers

#### Upload Images Programmatically
```tsx
import { useSupabaseImageUpload } from '@/hooks/useSupabaseImageUpload';

function MyComponent() {
  const { uploadImages, uploading, uploadProgress } = useSupabaseImageUpload();
  
  const handleFileUpload = async (files: File[]) => {
    try {
      const publicUrls = await uploadImages(files);
      console.log('Uploaded URLs:', publicUrls);
      // URLs are automatically saved to database if productId provided
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
}
```

#### Display Images with Optimization
```tsx
import { OptimizedImage } from '@/components/ui/optimized-image';

function ProductCard({ product }) {
  return (
    <OptimizedImage
      src={product.images[0]} // Supabase public URL
      alt={product.name}
      className="w-full h-full object-cover"
      lazy={true} // Automatic lazy loading
    />
  );
}
```

## 🔒 Security Features

### Admin-Only Upload
- Only users with `role: "admin"` can upload images
- Upload attempts by non-admin users are blocked
- Admin status checked via JWT tokens and user metadata

### Public Read Access
- All uploaded images have public CDN URLs
- Anyone can view images without authentication
- Perfect for e-commerce product images

### RLS (Row Level Security)
- Database-level security policies enforce access control
- Even if frontend is bypassed, backend policies protect data
- Admin checks at multiple levels (email, metadata, JWT)

## 🚀 Performance Features

### Optimized Image Loading
- **Lazy loading** by default
- **WebP/AVIF format** preference with fallback
- **CDN delivery** via Supabase's global network
- **Responsive images** with proper sizing

### Modern Format Support
- Automatically tries WebP format first
- Falls back to original format if WebP fails
- Supports AVIF for even better compression
- Handles all common image formats

## 🛠️ Components Overview

### New Components Created

1. **`SupabaseImageUpload`** - Main upload component
   - Drag & drop interface
   - Progress tracking
   - Admin-only access
   - Automatic URL generation

2. **`OptimizedImage`** - Smart image display
   - Lazy loading
   - Format optimization
   - Error handling
   - CDN-optimized URLs

3. **`useSupabaseImageUpload`** - Upload hook
   - File upload logic
   - Progress tracking
   - Database integration
   - Admin verification

4. **`useAdminAuth`** - Admin verification hook
   - Role checking
   - Permission management
   - Security validation

### Updated Components

- **`ProductForm`** - Now uses Supabase upload
- **`ProductCard`** - Uses OptimizedImage
- **`ImageCarousel`** - Uses OptimizedImage
- **`ProductDetails`** - Uses OptimizedImage
- **`AdminDashboard`** - Uses OptimizedImage

## 📋 What Was Removed

### Old Components
- ❌ `file-upload.tsx` - Replaced by SupabaseImageUpload
- ❌ Manual URL input fields - Replaced by drag & drop
- ❌ Static image references in hero section

### Old Processes
- ❌ Manual image URL entry
- ❌ Static images in `/public/lovable-uploads/`
- ❌ Hardcoded image paths
- ❌ No lazy loading or optimization

## 🔧 Configuration

### Environment Variables
No additional environment variables needed - the system uses your existing Supabase configuration from `src/integrations/supabase/client.ts`.

### Bucket Configuration
```javascript
// Bucket settings in Supabase Dashboard:
{
  name: 'product-images',
  public: true,              // ✅ Required for CDN URLs
  fileSizeLimit: 10485760,   // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/avif',
    'image/svg+xml'
  ]
}
```

## 🧪 Testing

### Test Admin Upload
1. Log in with admin account
2. Go to admin dashboard
3. Try uploading an image
4. Verify it appears with Supabase URL

### Test Public Access
1. Open any product page
2. Verify images load correctly
3. Check browser network tab for Supabase CDN URLs

### Test Non-Admin Restrictions
1. Log in with regular user
2. Admin upload component should show "Access denied"
3. Upload attempts should fail with permission error

## 🐛 Troubleshooting

### Images Not Uploading
- ✅ Check if user has admin role
- ✅ Verify bucket is created and public
- ✅ Check RLS policies are applied
- ✅ Ensure file size under 10MB

### Images Not Displaying
- ✅ Verify bucket is set to public
- ✅ Check image URLs in database
- ✅ Test direct URL access in browser
- ✅ Check browser console for errors

### Permission Denied Errors
- ✅ Confirm user has admin metadata
- ✅ Check JWT token contains role
- ✅ Verify RLS policies are active
- ✅ Test with different admin users

## 📈 Benefits

### For Users
- ✅ Faster image loading (CDN)
- ✅ Better mobile performance (lazy loading)
- ✅ Modern image formats (WebP/AVIF)
- ✅ Responsive images

### For Admins
- ✅ Simple drag & drop uploads
- ✅ Automatic URL generation
- ✅ Progress tracking
- ✅ No manual URL entry

### For Developers
- ✅ Scalable storage solution
- ✅ Built-in CDN
- ✅ Security by default
- ✅ Easy to maintain

## 🔗 Related Files

- `src/hooks/useSupabaseImageUpload.tsx` - Upload logic
- `src/hooks/useAdminAuth.tsx` - Admin verification
- `src/components/ui/supabase-image-upload.tsx` - Upload UI
- `src/components/ui/optimized-image.tsx` - Display component
- `supabase-rls-policies.sql` - Database policies
- This guide: `SUPABASE_IMAGE_SETUP_GUIDE.md`