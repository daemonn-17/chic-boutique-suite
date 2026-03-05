import { useState, useEffect } from 'react';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
  useUploadCategoryImage,
  type CategoryFormData,
} from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, FolderOpen, GripVertical, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import type { Tables } from '@/integrations/supabase/types';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const EMPTY_FORM: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  image_url: '',
  display_order: 0,
  is_active: true,
};

type Category = Tables<'categories'>;

function SortableRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <button className="cursor-grab active:cursor-grabbing touch-none p-1" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell>
        {category.image_url ? (
          <img src={category.image_url} alt={category.name} className="w-12 h-12 rounded object-cover" />
        ) : (
          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell className="text-muted-foreground text-xs font-mono">{category.slug}</TableCell>
      <TableCell>{category.display_order}</TableCell>
      <TableCell>
        <Badge variant={category.is_active ? 'default' : 'secondary'}>
          {category.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(category)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{category.name}"?</AlertDialogTitle>
                <AlertDialogDescription>Products in this category will become uncategorized.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(category.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminCategories() {
  const { data: categories, isLoading } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();
  const uploadCategoryImage = useUploadCategoryImage();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [form, setForm] = useState<CategoryFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);

  const isEdit = !!editingCategory;

  useEffect(() => {
    if (categories) {
      setOrderedCategories(categories);
    }
  }, [categories]);

  useEffect(() => {
    if (formOpen && editingCategory) {
      setForm({
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description || '',
        image_url: editingCategory.image_url || '',
        display_order: editingCategory.display_order,
        is_active: editingCategory.is_active,
      });
      setImagePreview(editingCategory.image_url || null);
    } else if (formOpen) {
      setForm({ ...EMPTY_FORM, display_order: (categories?.length || 0) });
      setImagePreview(null);
    }
  }, [formOpen, editingCategory, categories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedCategories.findIndex(c => c.id === active.id);
    const newIndex = orderedCategories.findIndex(c => c.id === over.id);
    const reordered = arrayMove(orderedCategories, oldIndex, newIndex);
    setOrderedCategories(reordered);

    const updates = reordered.map((c, i) => ({ id: c.id, display_order: i }));
    reorderCategories.mutate(updates, {
      onSuccess: () => toast({ title: 'Order updated' }),
      onError: (err: any) => toast({ title: 'Error reordering', description: err.message, variant: 'destructive' }),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadCategoryImage.mutateAsync(file);
      updateField('image_url', url);
      setImagePreview(url);
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    updateField('image_url', '');
    setImagePreview(null);
  };

  const updateField = <K extends keyof CategoryFormData>(key: K, value: CategoryFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key === 'name' && !isEdit) {
      setForm(prev => ({ ...prev, slug: slugify(value as string) }));
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug) {
      toast({ title: 'Name and slug are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data: form });
        toast({ title: 'Category updated' });
      } else {
        await createCategory.mutateAsync(form);
        toast({ title: 'Category created' });
      }
      setFormOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteCategory.mutate(id, {
      onSuccess: () => toast({ title: 'Category deleted' }),
      onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="heading-section">Categories</h1>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="heading-section">Categories ({orderedCategories.length})</h1>
        <Button onClick={() => { setEditingCategory(null); setFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={orderedCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <TableBody>
                  {orderedCategories.map(c => (
                    <SortableRow
                      key={c.id}
                      category={c}
                      onEdit={(cat) => { setEditingCategory(cat); setFormOpen(true); }}
                      onDelete={handleDelete}
                    />
                  ))}
                  {orderedCategories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        No categories yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </SortableContext>
            </DndContext>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={(v) => { setFormOpen(v); if (!v) setEditingCategory(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Category' : 'Create Category'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => updateField('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={e => updateField('slug', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => updateField('description', e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Category Image</Label>
              {imagePreview ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                  <img src={imagePreview} alt="Category preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors bg-muted/30">
                  {uploading ? (
                    <span className="text-sm text-muted-foreground">Uploading…</span>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <span className="text-sm text-muted-foreground">Click to upload image</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input type="number" min={0} value={form.display_order} onChange={e => updateField('display_order', parseInt(e.target.value) || 0)} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => updateField('is_active', v)} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFormOpen(false); setEditingCategory(null); }} disabled={saving}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
