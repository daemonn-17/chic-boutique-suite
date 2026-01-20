import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { products, categories, formatPrice } from '@/data/mockProducts';
import { SortOption } from '@/types/product';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const materials = ['Pure Silk', 'Georgette', 'Cotton', 'Velvet', 'Chanderi Silk', 'Silk Blend'];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || ''
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some((t) => t.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(
        (p) => p.categoryName.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Price filter
    result = result.filter((p) => {
      const price = p.discountPrice || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s))
      );
    }

    // Material filter
    if (selectedMaterials.length > 0) {
      result = result.filter(
        (p) => p.material && selectedMaterials.includes(p.material)
      );
    }

    // Discount filter
    if (onlyDiscounted) {
      result = result.filter((p) => p.discountPrice);
    }

    // URL filter param
    const filterParam = searchParams.get('filter');
    if (filterParam === 'new') {
      result = result.filter((p) => p.isNewArrival);
    }

    // Sort
    switch (sortBy) {
      case 'price-low-high':
        result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-high-low':
        result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'popular':
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [search, selectedCategory, priceRange, selectedSizes, selectedMaterials, onlyDiscounted, sortBy, searchParams]);

  const activeFiltersCount = [
    selectedCategory,
    selectedSizes.length > 0,
    selectedMaterials.length > 0,
    onlyDiscounted,
    priceRange[0] > 0 || priceRange[1] < 100000,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 100000]);
    setSelectedSizes([]);
    setSelectedMaterials([]);
    setOnlyDiscounted(false);
    setSearchParams({});
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-serif font-semibold mb-4">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={selectedCategory.toLowerCase() === category.slug}
                onCheckedChange={(checked) =>
                  setSelectedCategory(checked ? category.slug : '')
                }
              />
              <span className="text-sm group-hover:text-primary transition-colors">
                {category.name}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                ({category.productCount})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-serif font-semibold mb-4">Price Range</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            min={0}
            max={100000}
            step={1000}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h4 className="font-serif font-semibold mb-4">Size</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() =>
                setSelectedSizes((prev) =>
                  prev.includes(size)
                    ? prev.filter((s) => s !== size)
                    : [...prev, size]
                )
              }
              className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                selectedSizes.includes(size)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:border-primary'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div>
        <h4 className="font-serif font-semibold mb-4">Fabric / Material</h4>
        <div className="space-y-2">
          {materials.map((material) => (
            <label
              key={material}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={selectedMaterials.includes(material)}
                onCheckedChange={(checked) =>
                  setSelectedMaterials((prev) =>
                    checked
                      ? [...prev, material]
                      : prev.filter((m) => m !== material)
                  )
                }
              />
              <span className="text-sm group-hover:text-primary transition-colors">
                {material}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Discount */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={onlyDiscounted}
            onCheckedChange={(checked) => setOnlyDiscounted(!!checked)}
          />
          <span className="text-sm">On Sale Only</span>
        </label>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      <main className="section-padding">
        <div className="container-boutique">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="heading-display mb-4">
              {selectedCategory
                ? categories.find((c) => c.slug === selectedCategory)?.name || 'Collection'
                : 'Our Collection'}
            </h1>
            <p className="text-body max-w-2xl mx-auto">
              Explore our curated collection of handcrafted ethnic wear, each piece telling a story of tradition and artistry.
            </p>
          </motion.div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Mobile Filter Button */}
              <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden relative">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="font-serif">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-4 pr-10"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} products
              </span>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {categories.find((c) => c.slug === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedSizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                >
                  {size}
                  <button
                    onClick={() =>
                      setSelectedSizes((prev) => prev.filter((s) => s !== size))
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {onlyDiscounted && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  On Sale
                  <button onClick={() => setOnlyDiscounted(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <FilterContent />
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="font-serif text-xl mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
