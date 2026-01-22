import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Plus, Pencil, Trash2, LogOut } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, Address } from '@/hooks/useAddresses';
import { addressSchema, AddressFormData } from '@/lib/validations';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const navigate = useNavigate();
  
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      pincode: '',
      is_default: false,
    },
  });

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    const { error } = await updateProfile({ full_name: fullName, phone });
    setIsUpdatingProfile(false);
    
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
    }
  };

  const handleAddressSubmit = async (data: AddressFormData) => {
    const addressData = {
      full_name: data.full_name,
      phone: data.phone,
      address_line_1: data.address_line_1,
      address_line_2: data.address_line_2 || null,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      is_default: data.is_default || false,
    };
    
    if (editingAddress) {
      updateAddress.mutate({ id: editingAddress.id, ...addressData }, {
        onSuccess: () => {
          toast.success('Address updated');
          setIsAddressDialogOpen(false);
          setEditingAddress(null);
          addressForm.reset();
        },
        onError: () => toast.error('Failed to update address'),
      });
    } else {
      createAddress.mutate(addressData, {
        onSuccess: () => {
          toast.success('Address added');
          setIsAddressDialogOpen(false);
          addressForm.reset();
        },
        onError: () => toast.error('Failed to add address'),
      });
    }
  };

  const handleDeleteAddress = (id: string) => {
    deleteAddress.mutate(id, {
      onSuccess: () => toast.success('Address deleted'),
      onError: () => toast.error('Failed to delete address'),
    });
  };

  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    addressForm.reset({
      full_name: address.full_name,
      phone: address.phone,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      is_default: address.is_default,
    });
    setIsAddressDialogOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast.success('Signed out successfully');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="section-padding">
        <div className="container-boutique max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="heading-display mb-2">My Account</h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
                      {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Saved Addresses
                    </CardTitle>
                    <Dialog open={isAddressDialogOpen} onOpenChange={(open) => {
                      setIsAddressDialogOpen(open);
                      if (!open) {
                        setEditingAddress(null);
                        addressForm.reset();
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Full Name</Label>
                              <Input {...addressForm.register('full_name')} />
                              {addressForm.formState.errors.full_name && (
                                <p className="text-xs text-destructive">{addressForm.formState.errors.full_name.message}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label>Phone</Label>
                              <Input {...addressForm.register('phone')} />
                              {addressForm.formState.errors.phone && (
                                <p className="text-xs text-destructive">{addressForm.formState.errors.phone.message}</p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Address Line 1</Label>
                            <Input {...addressForm.register('address_line_1')} />
                            {addressForm.formState.errors.address_line_1 && (
                              <p className="text-xs text-destructive">{addressForm.formState.errors.address_line_1.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Address Line 2 (Optional)</Label>
                            <Input {...addressForm.register('address_line_2')} />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                              <Label>City</Label>
                              <Input {...addressForm.register('city')} />
                            </div>
                            <div className="space-y-2">
                              <Label>State</Label>
                              <Input {...addressForm.register('state')} />
                            </div>
                            <div className="space-y-2">
                              <Label>Pincode</Label>
                              <Input {...addressForm.register('pincode')} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="is_default"
                              {...addressForm.register('is_default')}
                              className="rounded border-input"
                            />
                            <Label htmlFor="is_default" className="text-sm font-normal">
                              Set as default address
                            </Label>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setIsAddressDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createAddress.isPending || updateAddress.isPending}>
                              {editingAddress ? 'Update' : 'Add'} Address
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {addressesLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : addresses && addresses.length > 0 ? (
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className="p-4 border rounded-lg flex justify-between items-start"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{address.full_name}</span>
                                {address.is_default && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {address.address_line_1}
                                {address.address_line_2 && `, ${address.address_line_2}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              <p className="text-sm text-muted-foreground">{address.phone}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openEditAddress(address)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDeleteAddress(address.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No addresses saved yet. Add your first address above.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
