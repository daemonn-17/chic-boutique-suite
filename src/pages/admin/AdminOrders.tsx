import { useState } from 'react';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useAdmin';
import { formatPrice } from '@/hooks/useProducts';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const statusOptions = ['pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled'] as const;

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  paid: 'bg-accent/20 text-accent-foreground',
  packed: 'bg-secondary text-secondary-foreground',
  shipped: 'bg-primary/20 text-primary',
  delivered: 'bg-success/20 text-success',
  cancelled: 'bg-destructive/20 text-destructive',
};

export default function AdminOrders() {
  const { data: orders, isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = orders?.filter(o => {
    const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  }) || [];

  const handleStatusChange = (orderId: string, status: string) => {
    updateStatus.mutate({ orderId, status }, {
      onSuccess: () => toast({ title: `Order status updated to ${status}` }),
      onError: () => toast({ title: 'Failed to update status', variant: 'destructive' }),
    });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="heading-section">Orders</h1>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="heading-section">Orders ({filtered.length})</h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by order number..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                  <TableCell>{order.order_items?.length || 0} items</TableCell>
                  <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    {order.razorpay_payment_id ? (
                      <Badge variant="outline" className="text-xs text-success border-success/30">Paid</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">Unpaid</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`capitalize text-xs ${statusColors[order.status] || ''}`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(s => (
                          <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No orders found
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
