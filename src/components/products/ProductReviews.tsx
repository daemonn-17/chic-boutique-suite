import { useState } from 'react';
import { Star, CheckCircle, Trash2, Edit2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  useProductReviews,
  useUserReview,
  useHasPurchased,
  useSubmitReview,
  useUpdateReview,
  useDeleteReview,
} from '@/hooks/useReviews';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Props {
  productId: string;
  productName: string;
}

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="p-0.5"
        >
          <Star
            className={cn(
              'w-6 h-6 transition-colors',
              (hover || value) >= star
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-muted'
            )}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'xs' }) {
  const w = size === 'sm' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            w,
            i <= Math.round(rating)
              ? 'text-yellow-500 fill-yellow-500'
              : 'text-muted fill-muted'
          )}
        />
      ))}
    </div>
  );
}

export function ProductReviews({ productId, productName }: Props) {
  const { user } = useAuth();
  const { data: reviews = [], isLoading } = useProductReviews(productId);
  const { data: existingReview } = useUserReview(productId, user?.id);
  const { data: hasPurchased } = useHasPurchased(productId, user?.id);

  const submitReview = useSubmitReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const showForm = user && !existingReview && !isEditing;
  const showEditForm = user && existingReview && isEditing;

  const handleStartEdit = () => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
      setIsEditing(true);
    }
  };

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error('Please select a rating');
      return;
    }
    if (comment.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }
    try {
      await submitReview.mutateAsync({
        productId,
        userId: user!.id,
        rating,
        comment: comment.trim(),
      });
      setRating(0);
      setComment('');
      toast.success('Review submitted successfully!');
    } catch {
      toast.error('Failed to submit review');
    }
  };

  const handleUpdate = async () => {
    if (!existingReview) return;
    if (rating < 1 || comment.trim().length < 10) {
      toast.error('Please provide a valid rating and comment (min 10 chars)');
      return;
    }
    try {
      await updateReview.mutateAsync({
        reviewId: existingReview.id,
        rating,
        comment: comment.trim(),
        productId,
      });
      setIsEditing(false);
      toast.success('Review updated!');
    } catch {
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    try {
      await deleteReview.mutateAsync({ reviewId: existingReview.id, productId });
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold">
          Customer Reviews
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StarDisplay rating={avgRating} />
            <span>
              {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      {/* Review Form */}
      {(showForm || showEditForm) && (
        <div className="mb-10 p-6 rounded-xl border border-border bg-muted/30">
          <h3 className="font-medium mb-4">
            {showEditForm ? 'Edit Your Review' : `Review ${productName}`}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Rating</label>
              <StarRatingInput value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Your Review</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product (min 10 characters)..."
                className="min-h-[100px]"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">{comment.length}/1000</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={showEditForm ? handleUpdate : handleSubmit}
                disabled={submitReview.isPending || updateReview.isPending}
              >
                {(submitReview.isPending || updateReview.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {showEditForm ? 'Update Review' : 'Submit Review'}
              </Button>
              {showEditForm && (
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Existing review notice */}
      {user && existingReview && !isEditing && (
        <div className="mb-8 p-4 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            You've already reviewed this product.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleStartEdit}>
              <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your review?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Not logged in prompt */}
      {!user && (
        <div className="mb-8 p-4 rounded-lg border border-border bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">
            <a href="/auth" className="text-primary hover:underline font-medium">Sign in</a> to leave a review.
          </p>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No reviews yet. Be the first to review this product!
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="p-5 rounded-lg border border-border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {review.profiles?.full_name || 'Customer'}
                    </span>
                    {review.order_id && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <StarDisplay rating={review.rating} size="xs" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(review.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
