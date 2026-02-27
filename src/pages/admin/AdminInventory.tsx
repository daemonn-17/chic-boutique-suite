import { useInventory, useUpdateStock } from '@/hooks/useAdmin';
import { formatPrice } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Package, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const MAX_STOCK = 100; // for progress bar reference

export default function AdminInventory() {
  const { data: products, isLoading } = useInventory();
  const updateStock = useUpdateStock();
  const { toast } = useToast();
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});

  const lowStock = products?.filter(p => p.stock_qty < 10) || [];
  const inStock = products?.filter(p => p.stock_qty >= 10) || [];
  const outOfStock = products?.filter(p => p.stock_qty === 0) || [];

  const handleSave = (id: string) => {
    const qty = editingStock[id];
    if (qty === undefined) return;
    updateStock.mutate({ productId: id, stockQty: qty }, {
      onSuccess: () => {
        toast({ title: 'Stock updated successfully' });
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
        <h1 className="heading-section">Inventory</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="heading-section">Inventory Monitor</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{outOfStock.length}</p>
              <p className="text-xs text-muted-foreground">Out of Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{lowStock.length}</p>
              <p className="text-xs text-muted-foreground">Low Stock (&lt;10)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{inStock.length}</p>
              <p className="text-xs text-muted-foreground">In Stock</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts ({lowStock.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <img src={getImage(p)} alt={p.name} className="h-12 w-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                  </div>
                  <div className="w-32">
                    <Progress value={(p.stock_qty / MAX_STOCK) * 100} className="h-2" />
                    <p className="text-xs text-center mt-1 text-muted-foreground">{p.stock_qty} left</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      className="w-20 h-8 text-sm"
                      value={editingStock[p.id] ?? p.stock_qty}
                      onChange={e => setEditingStock(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                    />
                    {editingStock[p.id] !== undefined && editingStock[p.id] !== p.stock_qty && (
                      <Button size="sm" className="h-8 text-xs" onClick={() => handleSave(p.id)}>Update</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Products Stock */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Inventory ({products?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {products?.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <img src={getImage(p)} alt={p.name} className="h-10 w-10 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                </div>
                <div className="w-24">
                  <Progress value={Math.min((p.stock_qty / MAX_STOCK) * 100, 100)} className="h-2" />
                </div>
                <Badge variant={p.stock_qty === 0 ? 'destructive' : p.stock_qty < 10 ? 'outline' : 'secondary'} className="text-xs w-16 justify-center">
                  {p.stock_qty}
                </Badge>
                <span className="text-sm text-muted-foreground w-20 text-right">{formatPrice(p.price)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
