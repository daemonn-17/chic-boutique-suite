import { DbProduct, DbProductImage, DbCategory } from '@/hooks/useProducts';
import { Product, ProductImage, Category } from '@/types/product';

// Transform database product to UI product type
export function transformDbProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description || '',
    price: dbProduct.price,
    discountPrice: dbProduct.discount_price || undefined,
    stockQuantity: dbProduct.stock_qty,
    sku: dbProduct.sku,
    categoryId: dbProduct.category_id || '',
    categoryName: dbProduct.categories?.name || '',
    colors: dbProduct.colors || [],
    sizes: dbProduct.sizes || [],
    images: transformDbImages(dbProduct.product_images || []),
    material: dbProduct.material || undefined,
    pattern: dbProduct.pattern || undefined,
    brand: dbProduct.brand || undefined,
    tags: dbProduct.tags || [],
    isFeatured: dbProduct.is_featured,
    isNewArrival: dbProduct.is_new_arrival,
    averageRating: dbProduct.average_rating || undefined,
    reviewCount: dbProduct.review_count || undefined,
    createdAt: new Date(dbProduct.created_at),
    updatedAt: new Date(dbProduct.updated_at),
  };
}

// Transform database images to UI image type
export function transformDbImages(dbImages: DbProductImage[]): ProductImage[] {
  return dbImages
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => ({
      id: img.id,
      url: img.url,
      alt: `Product image ${img.display_order}`,
      isPrimary: img.is_primary,
    }));
}

// Transform database category to UI category type
export function transformDbCategory(dbCategory: DbCategory): Category {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    slug: dbCategory.slug,
    description: dbCategory.description || undefined,
    image: dbCategory.image_url || undefined,
  };
}

// Color name to hex mapping utility
export function getColorHex(colorName: string): string {
  const colors: Record<string, string> = {
    'maroon': '#800000',
    'royal blue': '#4169E1',
    'emerald green': '#50C878',
    'dusty pink': '#D4A5A5',
    'sage green': '#9DC183',
    'powder blue': '#B0E0E6',
    'deep red': '#8B0000',
    'royal magenta': '#8B008B',
    'midnight black': '#191970',
    'champagne gold': '#F7E7CE',
    'wine': '#722F37',
    'off white': '#FAF9F6',
    'peach': '#FFDAB9',
    'sky blue': '#87CEEB',
    'white': '#FFFFFF',
    'light pink': '#FFB6C1',
    'mint green': '#98FF98',
    'black': '#000000',
    'navy blue': '#000080',
    'burgundy': '#800020',
    'gold with green': '#DAA520',
    'gold with red': '#DAA520',
    'gold with blue': '#DAA520',
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#008000',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'grey': '#808080',
    'gray': '#808080',
    'gold': '#FFD700',
    'silver': '#C0C0C0',
    'cream': '#FFFDD0',
    'beige': '#F5F5DC',
    'coral': '#FF7F50',
    'teal': '#008080',
    'turquoise': '#40E0D0',
    'lavender': '#E6E6FA',
    'magenta': '#FF00FF',
    'indigo': '#4B0082',
  };
  return colors[colorName.toLowerCase()] || '#888888';
}
