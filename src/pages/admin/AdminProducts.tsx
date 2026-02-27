import { useState } from 'react';
import { useAdminProducts, useToggleProductActive, useUpdateStock } from '@/hooks/useAdmin';
import { formatPrice } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminProducts() {
  const { data: products, isLoading } = useAdminProducts();
  const toggleActive = useToggleProductActive();
  const updateStock = useUpdateStock();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleToggle = (id: string, current: boolean) => {
    toggleActive.mutate({ productId: id, isActive: !current }, {
      onSuccess: () => toast({ title: `Product ${!current ? 'activated' : 'deactivated'}` }),
    });
  };

  const handleStockSave = (id: string) => {
    const qty = editingStock[id];
    if (qty === undefined) return;
    updateStock.mutate({ productId: id, stockQty: qty }, {
      onSuccess: () => {
        toast({ title: 'Stock updated' });
        setEditingStock(prev => { const n = { ...prev }; delete n[id]; return n; });
      },
    });
  };

  const getImage = (p: any) => {
    const primary = p.product_images?.find((i: any) => i.is_primary);
    return primary?.url || p.product_images?.[0]?.url || '/placeholder.svg';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="heading-section">Products</h1>
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="heading-section">Products ({filtered.length})</h1>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or SKU..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img src={getImage(p)} alt={p.name} className="w-12 h-12 rounded object-cover" />
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">{p.sku}</TableCell>
                  <TableCell>
                    {p.discount_price ? (
                      <div>
                        <span className="text-destructive font-medium">{formatPrice(p.discount_price)}</span>
                        <span className="text-xs text-muted-foreground line-through ml-1">{formatPrice(p.price)}</span>
                      </div>
                    ) : (
                      <span className="font-medium">{formatPrice(p.price)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        className="w-20 h-8 text-sm"
                        value={editingStock[p.id] ?? p.stock_qty}
                        onChange={e => setEditingStock(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                      />
                      {editingStock[p.id] !== undefined && editingStock[p.id] !== p.stock_qty && (
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleStockSave(p.id)}>
                          Save
                        </Button>
                      )}
                    </div>
                    {p.stock_qty < 10 && (
                      <Badge variant="destructive" className="mt-1 text-xs">Low</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {(p.categories as any)?.name || 'Uncategorized'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={p.is_active} onCheckedChange={() => handleToggle(p.id, p.is_active)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {p.is_featured && <Badge className="text-xs bg-accent text-accent-foreground">Featured</Badge>}
                      {p.is_new_arrival && <Badge className="text-xs">New</Badge>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
