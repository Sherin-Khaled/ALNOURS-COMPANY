import { useRoute } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/store/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const { data: product, isLoading } = useProduct(params?.slug || "");
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

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white">
      <SEO
        title={t.seo.productDetail.title.replace("{name}", product.name)}
        description={t.seo.productDetail.description.replace("{name}", product.name)}
      />
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Images */}
          <div className="bg-neutral-50 rounded-lg aspect-square flex items-center justify-center p-12">
            <img 
              src={product.images?.packshot} 
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="text-label text-neutral-500 uppercase tracking-wider mb-2 block">Domty</span>
            <h1 className="text-[32px] md:text-[28px] lg:text-[32px] font-bold text-neutral-950 mb-2">{product.name}</h1>
            <p className="text-body text-neutral-500 mb-6">Premium Drink • VAT included</p>
            
            <div className="text-[24px] font-bold text-neutral-950 mb-8">
              <span className="text-[18px] mr-1">{product.currency}</span>{product.price}
            </div>

            <div className="space-y-8">
              {/* Size Selector */}
              <div>
                <h3 className="text-label text-neutral-950 mb-3">Available Sizes</h3>
                <div className="flex gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
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

              {/* Action */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleAdd}
                  className="h-[48px] px-10 bg-primary hover:bg-primary-hover text-white rounded-md font-bold text-lg flex-1"
                >
                  Add To Cart
                </Button>
              </div>

              {/* Nutrition */}
              <div className="pt-8 border-t border-neutral-200">
                <h3 className="text-label text-neutral-950 mb-4 uppercase">Amount Per Serving</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(product.nutrition || {}).map(([key, value]) => (
                    <div key={key} className="text-left">
                      <div className="text-body font-bold text-neutral-950">{String(value)}</div>
                      <div className="text-small text-neutral-500 capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div className="pt-8 border-t border-neutral-200">
                <h3 className="text-label text-neutral-950 mb-2 uppercase">Ingredients:</h3>
                <p className="text-body text-neutral-700 line-clamp-2">
                  {product.ingredients}
                </p>
                <button className="text-primary font-semibold mt-2 hover:underline">
                  View full ingredients
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
