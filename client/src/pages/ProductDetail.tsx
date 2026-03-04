import { useRoute } from "wouter";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useCart } from "@/store/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductCard } from "@/components/ProductCard";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const { data: product, isLoading } = useProduct(params?.slug || "");
  const { data: allProducts } = useProducts();
  const { addItem } = useCart();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  if (isLoading) {
    return <div className="min-h-screen pt-32 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  if (!product) {
    return <div className="min-h-screen pt-32 text-center text-2xl font-bold">Product not found.</div>;
  }

  const handleAdd = () => {
    addItem(product, selectedSize || "Standard", quantity);
    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} added.`,
    });
  };

  const relatedProducts = (allProducts || []).filter(p => p.id !== product.id).slice(0, 3);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white">
      <SEO
        title={t.seo.productDetail.title.replace("{name}", product.name)}
        description={t.seo.productDetail.description.replace("{name}", product.name)}
      />

      <div className="relative">
        <div className="featured-gradient-bg" />
        <div className="container-custom relative z-10 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">

            <div className="relative flex items-center justify-center min-h-[400px]">
              <img
                src="https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=400&fit=crop&q=60"
                alt=""
                className="absolute w-[280px] h-[280px] md:w-[320px] md:h-[320px] object-cover rounded-full opacity-25 pointer-events-none"
                style={{ right: "5%", bottom: "5%", zIndex: 10 }}
                data-testid="detail-fruit-image"
              />
              <img 
                src={product.images?.packshot} 
                alt={product.name}
                className="relative z-20 max-h-[380px] w-auto object-contain drop-shadow-lg"
                data-testid="detail-packshot-image"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-label text-neutral-500 uppercase tracking-wider mb-2 block">Domty</span>
              <h1 className="text-[32px] md:text-[28px] lg:text-[32px] font-bold text-neutral-950 mb-2" data-testid="text-product-name">{product.name}</h1>
              <p className="text-body text-neutral-500 mb-6">Premium Drink &bull; VAT included</p>
              
              <div className="text-[24px] font-bold text-neutral-950 mb-8" data-testid="text-product-price">
                <span className="text-[18px] mr-1">{product.currency}</span>{product.price}
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-label text-neutral-950 mb-3">Available Sizes</h3>
                  <div className="flex gap-3 flex-wrap">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        data-testid={`button-size-${size}`}
                        className={`h-[40px] px-6 rounded-pill font-semibold border transition-all ${
                          selectedSize === size 
                            ? "bg-primary border-primary text-white" 
                            : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleAdd}
                    data-testid="button-add-to-cart"
                    className="h-[48px] px-10 bg-primary hover:bg-primary-hover text-white rounded-md font-bold text-lg flex-1"
                  >
                    Add To Cart
                  </Button>
                </div>

                <div className="pt-8 border-t border-neutral-200">
                  <h3 className="text-label text-neutral-950 mb-4 uppercase">Amount Per Serving</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(product.nutrition || {}).map(([key, value]) => (
                      <div key={key} className="text-left" data-testid={`text-nutrition-${key}`}>
                        <div className="text-body font-bold text-neutral-950">{String(value)}</div>
                        <div className="text-small text-neutral-500 capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-neutral-200">
                  <h3 className="text-label text-neutral-950 mb-2 uppercase">Ingredients:</h3>
                  <p className="text-body text-neutral-700 line-clamp-2" data-testid="text-ingredients">
                    {product.ingredients}
                  </p>
                  <button className="text-primary font-semibold mt-2 hover:underline" data-testid="button-view-ingredients">
                    View full ingredients
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="container-custom mt-16">
          <h2 className="text-h3 text-neutral-950 mb-8" data-testid="text-related-title">You might like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} variant="related" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
