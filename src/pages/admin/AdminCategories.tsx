import { useState, useEffect } from 'react';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
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
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export default function AdminCategories() {
  const { data: categories, isLoading } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [form, setForm] = useState<CategoryFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const isEdit = !!editingCategory;

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
    } else if (formOpen) {
      setForm({ ...EMPTY_FORM, display_order: (categories?.length || 0) });
    }
  }, [formOpen, editingCategory, categories]);

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
        <h1 className="heading-section">Categories ({categories?.length || 0})</h1>
        <Button onClick={() => { setEditingCategory(null); setFormOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">{c.slug}</TableCell>
                  <TableCell>{c.display_order}</TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? 'default' : 'secondary'}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingCategory(c); setFormOpen(true); }}>
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
                            <AlertDialogTitle>Delete "{c.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>Products in this category will become uncategorized.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(c.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!categories || categories.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No categories yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
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
              <Label>Image URL</Label>
              <Input value={form.image_url} onChange={e => updateField('image_url', e.target.value)} placeholder="https://..." />
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
