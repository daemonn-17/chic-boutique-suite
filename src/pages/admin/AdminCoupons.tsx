import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Ticket, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { formatPrice } from '@/hooks/useProducts';

interface CouponForm {
  code: string;
  discount_type: 'percent' | 'amount';
  percent_off: string;
  amount_off: string;
  min_subtotal: string;
  max_discount: string;
  usage_limit: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

const emptyCoupon: CouponForm = {
  code: '',
  discount_type: 'percent',
  percent_off: '',
  amount_off: '',
  min_subtotal: '',
  max_discount: '',
  usage_limit: '',
  starts_at: new Date().toISOString().slice(0, 16),
  ends_at: '',
  is_active: true,
};

function useAdminCoupons() {
  return useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export default function AdminCoupons() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: coupons, isLoading } = useAdminCoupons();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyCoupon);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyCoupon);
    setOpen(true);
  };

  const openEdit = (coupon: NonNullable<typeof coupons>[number]) => {
    setEditId(coupon.id);
    setForm({
      code: coupon.code,
      discount_type: coupon.percent_off ? 'percent' : 'amount',
      percent_off: coupon.percent_off?.toString() || '',
      amount_off: coupon.amount_off ? (coupon.amount_off / 100).toString() : '',
      min_subtotal: coupon.min_subtotal ? (coupon.min_subtotal / 100).toString() : '',
      max_discount: coupon.max_discount ? (coupon.max_discount / 100).toString() : '',
      usage_limit: coupon.usage_limit?.toString() || '',
      starts_at: coupon.starts_at ? new Date(coupon.starts_at).toISOString().slice(0, 16) : '',
      ends_at: coupon.ends_at ? new Date(coupon.ends_at).toISOString().slice(0, 16) : '',
      is_active: coupon.is_active,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast({ title: 'Code required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        percent_off: form.discount_type === 'percent' && form.percent_off ? parseInt(form.percent_off) : null,
        amount_off: form.discount_type === 'amount' && form.amount_off ? Math.round(parseFloat(form.amount_off) * 100) : null,
        min_subtotal: form.min_subtotal ? Math.round(parseFloat(form.min_subtotal) * 100) : null,
        max_discount: form.max_discount ? Math.round(parseFloat(form.max_discount) * 100) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        starts_at: form.starts_at || new Date().toISOString(),
        ends_at: form.ends_at || null,
        is_active: form.is_active,
      };

      if (editId) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editId);
        if (error) throw error;
        toast({ title: 'Coupon updated' });
      } else {
        const { error } = await supabase.from('coupons').insert(payload);
        if (error) throw error;
        toast({ title: 'Coupon created' });
      }
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setOpen(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast({ title: 'Coupon deleted' });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('coupons').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  const isExpired = (endsAt: string | null) => endsAt && new Date(endsAt) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold">Coupons</h1>
          <p className="text-muted-foreground">Create and manage discount codes.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> New Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">{editId ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER20"
                  maxLength={20}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Discount Type</Label>
                  <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v as 'percent' | 'amount' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (%)</SelectItem>
                      <SelectItem value="amount">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{form.discount_type === 'percent' ? 'Percent Off' : 'Amount Off (₹)'}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.discount_type === 'percent' ? form.percent_off : form.amount_off}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [form.discount_type === 'percent' ? 'percent_off' : 'amount_off']: e.target.value,
                      })
                    }
                    placeholder={form.discount_type === 'percent' ? 'e.g. 20' : 'e.g. 500'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Min Order (₹)</Label>
                  <Input type="number" min="0" value={form.min_subtotal} onChange={(e) => setForm({ ...form, min_subtotal: e.target.value })} placeholder="Optional" />
                </div>
                <div className="grid gap-2">
                  <Label>Max Discount (₹)</Label>
                  <Input type="number" min="0" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} placeholder="Optional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Starts At</Label>
                  <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Ends At</Label>
                  <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Usage Limit</Label>
                  <Input type="number" min="0" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="Unlimited" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{coupons?.length ?? '–'}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{coupons?.filter((c) => c.is_active && !isExpired(c.ends_at)).length ?? '–'}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{coupons?.reduce((s, c) => s + c.used_count, 0) ?? '–'}</div></CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : !coupons?.length ? (
        <p className="text-center py-12 text-muted-foreground">No coupons yet. Create your first one!</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Order</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.percent_off
                      ? `${coupon.percent_off}%`
                      : coupon.amount_off
                        ? formatPrice(coupon.amount_off)
                        : '–'}
                    {coupon.max_discount && coupon.percent_off ? (
                      <span className="text-xs text-muted-foreground block">max {formatPrice(coupon.max_discount)}</span>
                    ) : null}
                  </TableCell>
                  <TableCell>{coupon.min_subtotal ? formatPrice(coupon.min_subtotal) : '–'}</TableCell>
                  <TableCell>
                    {coupon.used_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                  </TableCell>
                  <TableCell>
                    {isExpired(coupon.ends_at) ? (
                      <Badge variant="secondary">Expired</Badge>
                    ) : coupon.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {coupon.ends_at ? format(new Date(coupon.ends_at), 'MMM d, yyyy') : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive.mutate({ id: coupon.id, is_active: !coupon.is_active })}>
                        <Switch checked={coupon.is_active} className="pointer-events-none scale-75" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(coupon)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteCoupon.mutate(coupon.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
