import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetProduct, useListProductReviews, useCreateProductReview, getListProductReviewsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, ShoppingCart, ArrowLeft, TrendingUp } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { MainLayout } from "@/components/layout/main-layout";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id);
  const queryClient = useQueryClient();
  const { addToCart } = useCart();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId },
  });
  const { data: reviews, isLoading: reviewsLoading } = useListProductReviews(productId, {
    query: { enabled: !!productId },
  });

  const createReview = useCreateProductReview({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductReviewsQueryKey(productId) });
        setReviewerName("");
        setRating(5);
        setComment("");
      },
    },
  });

  const [qty, setQty] = useState(1);
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) return;
    createReview.mutate({ id: productId, data: { reviewerName, rating, comment } });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container px-4 md:px-8 py-10">
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="h-[500px] rounded-lg" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container px-4 md:px-8 py-24 text-center">
          <p className="text-xl font-bold uppercase tracking-tighter mb-4">Product Not Found</p>
          <Link href="/products" className="text-primary hover:underline font-mono text-sm">
            Back to Catalog
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container px-4 md:px-8 py-10">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 font-mono uppercase tracking-wider">
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="border border-border rounded-lg bg-card p-8 flex items-center justify-center aspect-square relative">
            {product.soldLastMonth > 0 && (
              <Badge className="absolute top-4 left-4 bg-primary/90 font-mono text-xs flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {product.soldLastMonth} sold this month
              </Badge>
            )}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-contain w-full h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=400";
              }}
            />
          </div>

          <div className="flex flex-col">
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-3">
              {product.category}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter mb-4 leading-tight">
              {product.name}
            </h1>

            {product.averageRating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(product.averageRating!) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground font-mono">
                  {product.averageRating} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            <div className="text-4xl font-mono font-bold mb-6">${product.price.toFixed(2)}</div>

            <p className="text-muted-foreground mb-8 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-3 mb-4">
              <span className={`text-sm font-mono ${product.stock > 0 ? "text-green-400" : "text-destructive"}`}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <button
                  className="px-3 py-2 text-muted-foreground hover:bg-secondary transition-colors"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  -
                </button>
                <span className="px-4 py-2 font-mono border-x border-border">{qty}</span>
                <button
                  className="px-3 py-2 text-muted-foreground hover:bg-secondary transition-colors"
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                >
                  +
                </button>
              </div>
              <Button
                className="flex-1 uppercase tracking-wider"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {addedToCart ? "Added!" : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-12">
          <h2 className="text-2xl font-bold uppercase tracking-tighter mb-8">Customer Reviews</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              {reviewsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="mb-6">
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3 mt-1" />
                  </div>
                ))
              ) : reviews?.length === 0 ? (
                <p className="text-muted-foreground font-mono text-sm py-8">
                  No reviews yet. Be the first to review this product.
                </p>
              ) : (
                <div className="space-y-6">
                  {reviews?.map((review) => (
                    <div key={review.id} className="border border-border rounded-lg p-5 bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold">{review.reviewerName}</span>
                        <div className="flex gap-1">
                          {Array(5).fill(0).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-3">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold uppercase tracking-tighter mb-6">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider font-mono mb-2 block">Your Name</Label>
                  <Input
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-card border-border"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider font-mono mb-2 block">Rating</Label>
                  <div className="flex gap-1">
                    {Array(5).fill(0).map((_, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setRating(i + 1)}
                        className="p-1"
                      >
                        <Star
                          className={`h-5 w-5 transition-colors ${i < rating ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider font-mono mb-2 block">Comment</Label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="bg-card border-border resize-none"
                    rows={4}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full uppercase tracking-wider"
                  disabled={createReview.isPending}
                >
                  {createReview.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
