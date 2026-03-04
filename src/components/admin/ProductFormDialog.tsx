import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, Trash2, Star } from 'lucide-react';
import {
  useCreateProduct,
  useUpdateProduct,
  useUploadProductImage,
  useDeleteProductImage,
  useAdminCategories,
  type ProductFormData,
} from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any; // existing product for editing, null for create
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  slug: '',
  sku: '',
  description: '',
  price: 0,
  discount_price: null,
  stock_qty: 0,
  category_id: null,
  colors: [],
  sizes: [],
  material: '',
  pattern: '',
  brand: '',
  tags: [],
  is_featured: false,
  is_new_arrival: false,
  is_active: true,
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const { toast } = useToast();
  const { data: categories } = useAdminCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const uploadImage = useUploadProductImage();
  const deleteImage = useDeleteProductImage();
  const fileRef = useRef<HTMLInputElement>(null);

  const isEdit = !!product;
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && product) {
      setForm({
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description || '',
        price: product.price,
        discount_price: product.discount_price,
        stock_qty: product.stock_qty,
        category_id: product.category_id,
        colors: product.colors || [],
        sizes: product.sizes || [],
        material: product.material || '',
        pattern: product.pattern || '',
        brand: product.brand || '',
        tags: product.tags || [],
        is_featured: product.is_featured,
        is_new_arrival: product.is_new_arrival,
        is_active: product.is_active,
      });
      setExistingImages(product.product_images || []);
    } else if (open) {
      setForm(EMPTY_FORM);
      setExistingImages([]);
    }
    setPendingFiles([]);
    setColorInput('');
    setSizeInput('');
    setTagInput('');
  }, [open, product]);

  const updateField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key === 'name' && !isEdit) {
      setForm(prev => ({ ...prev, slug: slugify(value as string) }));
    }
  };

  const addToArray = (key: 'colors' | 'sizes' | 'tags', value: string, setter: (v: string) => void) => {
    const trimmed = value.trim();
    if (!trimmed || form[key].includes(trimmed)) return;
    updateField(key, [...form[key], trimmed]);
    setter('');
  };

  const removeFromArray = (key: 'colors' | 'sizes' | 'tags', value: string) => {
    updateField(key, form[key].filter(v => v !== value));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPendingFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const handleDeleteExistingImage = (img: any) => {
    deleteImage.mutate({ imageId: img.id, publicId: img.public_id }, {
      onSuccess: () => {
        setExistingImages(prev => prev.filter(i => i.id !== img.id));
        toast({ title: 'Image deleted' });
      },
    });
  };

  const handleSetPrimary = async (imgId: string) => {
    // Unset all, then set the chosen one
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', product.id);
    await supabase.from('product_images').update({ is_primary: true }).eq('id', imgId);
    setExistingImages(prev => prev.map(i => ({ ...i, is_primary: i.id === imgId })));
    toast({ title: 'Primary image set' });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.sku || !form.price) {
      toast({ title: 'Name, SKU, and Price are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      let productId = product?.id;
      if (isEdit) {
        await updateProduct.mutateAsync({ id: productId, data: form });
      } else {
        const created = await createProduct.mutateAsync(form);
        productId = created.id;
      }
      // Upload pending images
      for (let i = 0; i < pendingFiles.length; i++) {
        await uploadImage.mutateAsync({
          productId,
          file: pendingFiles[i],
          isPrimary: existingImages.length === 0 && i === 0,
          displayOrder: existingImages.length + i,
        });
      }
      toast({ title: isEdit ? 'Product updated' : 'Product created' });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Create Product'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => updateField('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>SKU *</Label>
              <Input value={form.sku} onChange={e => updateField('sku', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={e => updateField('slug', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category_id || ''} onValueChange={v => updateField('category_id', v || null)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories?.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows={3} />
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Price (paise) *</Label>
              <Input type="number" min={0} value={form.price} onChange={e => updateField('price', parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Discount Price</Label>
              <Input type="number" min={0} value={form.discount_price ?? ''} onChange={e => updateField('discount_price', e.target.value ? parseInt(e.target.value) : null)} />
            </div>
            <div className="space-y-2">
              <Label>Stock Qty</Label>
              <Input type="number" min={0} value={form.stock_qty} onChange={e => updateField('stock_qty', parseInt(e.target.value) || 0)} />
            </div>
          </div>

          {/* Attributes */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Material</Label>
              <Input value={form.material} onChange={e => updateField('material', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Pattern</Label>
              <Input value={form.pattern} onChange={e => updateField('pattern', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input value={form.brand} onChange={e => updateField('brand', e.target.value)} />
            </div>
          </div>

          {/* Array fields: Colors */}
          <div className="space-y-2">
            <Label>Colors</Label>
            <div className="flex gap-2">
              <Input value={colorInput} onChange={e => setColorInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToArray('colors', colorInput, setColorInput))}
                placeholder="Type and press Enter" />
              <Button type="button" variant="outline" size="sm" onClick={() => addToArray('colors', colorInput, setColorInput)}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {form.colors.map(c => (
                <Badge key={c} variant="secondary" className="cursor-pointer" onClick={() => removeFromArray('colors', c)}>
                  {c} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Array fields: Sizes */}
          <div className="space-y-2">
            <Label>Sizes</Label>
            <div className="flex gap-2">
              <Input value={sizeInput} onChange={e => setSizeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToArray('sizes', sizeInput, setSizeInput))}
                placeholder="Type and press Enter" />
              <Button type="button" variant="outline" size="sm" onClick={() => addToArray('sizes', sizeInput, setSizeInput)}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {form.sizes.map(s => (
                <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => removeFromArray('sizes', s)}>
                  {s} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Array fields: Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToArray('tags', tagInput, setTagInput))}
                placeholder="Type and press Enter" />
              <Button type="button" variant="outline" size="sm" onClick={() => addToArray('tags', tagInput, setTagInput)}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {form.tags.map(t => (
                <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => removeFromArray('tags', t)}>
                  {t} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => updateField('is_active', v)} />
              <Label>Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_featured} onCheckedChange={v => updateField('is_featured', v)} />
              <Label>Featured</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_new_arrival} onCheckedChange={v => updateField('is_new_arrival', v)} />
              <Label>New Arrival</Label>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Images</Label>
            <div className="grid grid-cols-4 gap-3">
              {existingImages.map(img => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border aspect-square">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {img.is_primary && (
                    <Badge className="absolute top-1 left-1 text-[10px] px-1 py-0">Primary</Badge>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!img.is_primary && (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:text-primary" onClick={() => handleSetPrimary(img.id)}>
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:text-destructive" onClick={() => handleDeleteExistingImage(img)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {pendingFiles.map((f, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden border border-dashed border-border aspect-square flex items-center justify-center bg-muted">
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                  <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs">Upload</span>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
