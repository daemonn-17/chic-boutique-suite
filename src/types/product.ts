export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  sku: string;
  categoryId: string;
  categoryName: string;
  colors: string[];
  sizes: string[];
  images: ProductImage[];
  material?: string;
  pattern?: string;
  brand?: string;
  tags: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: Date;
}

export type SortOption = 
  | 'newest'
  | 'price-low-high'
  | 'price-high-low'
  | 'popular'
  | 'rating';

export interface ProductFilters {
  category?: string;
  priceRange?: [number, number];
  sizes?: string[];
  colors?: string[];
  materials?: string[];
  hasDiscount?: boolean;
  inStock?: boolean;
}
