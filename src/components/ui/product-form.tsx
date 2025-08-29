import { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { Checkbox } from "./checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { X, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  original_price?: number;
  discount_percentage: number;
  category: string;
  badge?: string;
  affiliate_link: string;
  images: string[];
  is_active: boolean;
  is_amazon_product?: boolean;
  amazon_affiliate_link?: string;
  amazon_image_url?: string;
  short_description_amazon?: string;
  long_description_amazon?: string;
}

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSave: () => void;
}

const categories = ['Fashion', 'Health & Fitness', 'Digital Products', 'Beauty'];
const badges = ['New', 'Best Seller', 'Trending', 'Limited Stock'];

export function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    original_price: '',
    category: '',
    badge: '',
    affiliate_link: '',
    images: [] as string[],
    is_active: true,
    is_amazon_product: false,
    amazon_affiliate_link: '',
    amazon_image_url: '',
    short_description_amazon: '',
    long_description_amazon: ''
  });
  const [loading, setLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        short_description: product.short_description,
        price: product.price.toString(),
        original_price: product.original_price?.toString() || '',
        category: product.category,
        badge: product.badge || '',
        affiliate_link: product.affiliate_link,
        images: product.images,
        is_active: product.is_active,
        is_amazon_product: product.is_amazon_product || false,
        amazon_affiliate_link: product.amazon_affiliate_link || '',
        amazon_image_url: product.amazon_image_url || '',
        short_description_amazon: product.short_description_amazon || '',
        long_description_amazon: product.long_description_amazon || ''
      });
    }
  }, [product]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const calculateDiscountPercentage = () => {
    const price = parseFloat(formData.price);
    const originalPrice = parseFloat(formData.original_price);
    
    if (originalPrice && price && originalPrice > price) {
      return Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For Amazon products, price is not required
      const price = formData.is_amazon_product ? 0 : parseFloat(formData.price);
      const originalPrice = formData.original_price ? parseFloat(formData.original_price) : null;
      const discountPercentage = formData.is_amazon_product ? 0 : calculateDiscountPercentage();

      const productData = {
        name: formData.name,
        description: formData.description,
        short_description: formData.short_description,
        price,
        original_price: originalPrice,
        discount_percentage: discountPercentage,
        category: formData.category,
        badge: formData.badge === 'none' ? null : formData.badge,
        affiliate_link: formData.affiliate_link,
        images: formData.is_amazon_product 
          ? [formData.amazon_image_url, ...formData.images].filter(Boolean)
          : formData.images,
        is_active: formData.is_active,
        is_amazon_product: formData.is_amazon_product,
        amazon_affiliate_link: formData.is_amazon_product ? formData.amazon_affiliate_link : null,
        amazon_image_url: formData.is_amazon_product ? formData.amazon_image_url : null,
        short_description_amazon: formData.is_amazon_product ? formData.short_description_amazon : null,
        long_description_amazon: formData.is_amazon_product ? formData.long_description_amazon : null
      };

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {product ? 'Edit Product' : 'Add New Product'}
              </CardTitle>
              <CardDescription>
                {product ? 'Update product information' : 'Create a new product listing'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Amazon Product Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_amazon_product"
                checked={formData.is_amazon_product}
                onCheckedChange={(checked) => handleInputChange('is_amazon_product', checked)}
              />
              <Label htmlFor="is_amazon_product">This is an Amazon Product</Label>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Product Name {!formData.is_amazon_product && '*'}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required={!formData.is_amazon_product}
                />
              </div>

              {formData.is_amazon_product ? (
                <>
                  <div>
                    <Label htmlFor="short_description_amazon">Short Description (150-200 characters)</Label>
                    <Input
                      id="short_description_amazon"
                      value={formData.short_description_amazon}
                      onChange={(e) => handleInputChange('short_description_amazon', e.target.value)}
                      placeholder="Brief Amazon product description for listing"
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <Label htmlFor="long_description_amazon">Long Description (500-1000 characters)</Label>
                    <Textarea
                      id="long_description_amazon"
                      value={formData.long_description_amazon}
                      onChange={(e) => handleInputChange('long_description_amazon', e.target.value)}
                      placeholder="Detailed Amazon product description"
                      rows={6}
                      maxLength={1000}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="short_description">Short Description *</Label>
                    <Input
                      id="short_description"
                      value={formData.short_description}
                      onChange={(e) => handleInputChange('short_description', e.target.value)}
                      placeholder="Brief product description (shown on cards)"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Detailed product description"
                      rows={4}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Pricing */}
            {formData.is_amazon_product ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">
                  Price will be shown on Amazon
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Amazon Associates compliance: Static prices cannot be displayed for Amazon products
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Current Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="original_price">Original Price ($)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => handleInputChange('original_price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            {/* Discount Badge */}
            {!formData.is_amazon_product && calculateDiscountPercentage() > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border">
                <p className="text-sm text-green-700">
                  <strong>Discount:</strong> {calculateDiscountPercentage()}% off
                </p>
              </div>
            )}

            {/* Category and Badge */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="badge">Badge</Label>
                <Select value={formData.badge} onValueChange={(value) => handleInputChange('badge', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select badge (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Badge</SelectItem>
                    {badges.map((badge) => (
                      <SelectItem key={badge} value={badge}>
                        {badge}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Affiliate Link */}
            <div>
              <Label htmlFor={formData.is_amazon_product ? "amazon_affiliate_link" : "affiliate_link"}>
                {formData.is_amazon_product ? "Amazon Affiliate Link *" : "Affiliate Link *"}
              </Label>
              <Input
                id={formData.is_amazon_product ? "amazon_affiliate_link" : "affiliate_link"}
                type="url"
                value={formData.is_amazon_product ? formData.amazon_affiliate_link : formData.affiliate_link}
                onChange={(e) => handleInputChange(
                  formData.is_amazon_product ? 'amazon_affiliate_link' : 'affiliate_link', 
                  e.target.value
                )}
                placeholder={formData.is_amazon_product ? "https://amazon.com/dp/..." : "https://example.com/product"}
                required
              />
            </div>

            {/* Images */}
            <div>
              <Label>Product Images {formData.is_amazon_product ? "(Amazon + Additional)" : ""}</Label>
              {formData.is_amazon_product && (
                <div className="space-y-3 mb-4">
                  <Label className="text-sm">Amazon API Image URL *</Label>
                  <Input
                    value={formData.amazon_image_url}
                    onChange={(e) => handleInputChange('amazon_image_url', e.target.value)}
                    placeholder="Enter Amazon API image URL"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use only Amazon API provided image URLs for compliance
                  </p>
                  {formData.amazon_image_url && (
                    <div className="mt-2">
                      <img
                        src={formData.amazon_image_url}
                        alt="Amazon Product"
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-3">
                <Label className="text-sm">{formData.is_amazon_product ? "Additional Images (Optional)" : "Product Images"}</Label>
                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addImage} disabled={!newImageUrl.trim()}>
                    <Upload className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is_active">Product is active and visible to customers</Label>
            </div>
          </CardContent>

          <div className="flex justify-end gap-3 p-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>Save Product</>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}