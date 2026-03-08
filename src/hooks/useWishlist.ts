import { useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useWishlistStore } from '@/store/wishlistStore';

interface WishlistItemData {
  productId: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
}

export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const localStore = useWishlistStore();

  // Fetch DB wishlist for logged-in users
  const { data: dbItems = [] } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return data.map((row) => row.product_id);
    },
    enabled: !!user,
  });

  // Merge local wishlist to DB on login
  useEffect(() => {
    if (!user) return;
    const localItems = localStore.items;
    if (localItems.length === 0) return;

    const mergeWishlist = async () => {
      const localProductIds = localItems.map((i) => i.productId);
      const toInsert = localProductIds
        .filter((pid) => !dbItems.includes(pid))
        .map((pid) => ({ user_id: user.id, product_id: pid }));

      if (toInsert.length > 0) {
        await supabase.from('wishlist_items').insert(toInsert);
        queryClient.invalidateQueries({ queryKey: ['wishlist', user.id] });
      }
      // Clear local store after merge
      localStore.clearWishlist();
    };

    mergeWishlist();
  }, [user?.id, dbItems.length > 0]); // run once DB data arrives

  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('wishlist_items')
        .insert({ user_id: user.id, product_id: productId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] }),
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] }),
  });

  const isInWishlist = useCallback(
    (productId: string) => {
      if (user) return dbItems.includes(productId);
      return localStore.isInWishlist(productId);
    },
    [user, dbItems, localStore]
  );

  const toggleItem = useCallback(
    (item: WishlistItemData) => {
      if (user) {
        if (dbItems.includes(item.productId)) {
          removeMutation.mutate(item.productId);
        } else {
          addMutation.mutate(item.productId);
        }
      } else {
        localStore.toggleItem(item);
      }
    },
    [user, dbItems, addMutation, removeMutation, localStore]
  );

  const removeItem = useCallback(
    (productId: string) => {
      if (user) {
        removeMutation.mutate(productId);
      } else {
        localStore.removeItem(productId);
      }
    },
    [user, removeMutation, localStore]
  );

  const clearWishlist = useCallback(() => {
    if (user) {
      clearMutation.mutate();
    } else {
      localStore.clearWishlist();
    }
  }, [user, clearMutation, localStore]);

  const itemCount = useMemo(() => {
    if (user) return dbItems.length;
    return localStore.items.length;
  }, [user, dbItems, localStore.items]);

  return {
    isInWishlist,
    toggleItem,
    removeItem,
    clearWishlist,
    itemCount,
    /** DB product IDs for logged-in users, local items for guests */
    dbProductIds: user ? dbItems : localStore.items.map((i) => i.productId),
    /** Local items (for guest wishlist page rendering) */
    localItems: localStore.items,
    isLoggedIn: !!user,
  };
}
