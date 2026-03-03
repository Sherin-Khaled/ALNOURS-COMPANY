import { useRoute } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { useCart } from "@/store/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const { data: product, isLoading } = useProduct(params?.slug || "");
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  // Initialize size once product loads
  if (product && !selectedSize && product.sizes.length > 0) {
    setSelectedSize(product.sizes[0]);
  }

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
    <div className="pt-32 pb-20 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="bg-white rounded-[3rem] p-6 md:p-12 shadow-sm border border-border/50 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Images */}
          <div className="bg-accent/10 rounded-[2rem] p-12 aspect-square flex items-center justify-center">
            <img 
              src={product.images?.packshot || "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80"} 
              alt={product.name}
              className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Details */}
          <div>
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm mb-4">
              {product.category}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">{product.name}</h1>
            <p className="text-xl text-muted-foreground mb-8">{product.flavor}</p>
            
            <div className="text-4xl font-display font-bold text-primary mb-8">
              <span className="text-2xl mr-1">{product.currency}</span>{product.price}
            </div>

            <div className="space-y-8">
              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3 text-lg">Select Size</h3>
                  <div className="flex gap-3">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 rounded-xl font-bold border-2 transition-all ${
                          selectedSize === size 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="font-bold mb-3 text-lg">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-muted rounded-2xl p-1 border border-border">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-primary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-primary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button 
                onClick={handleAdd}
                className="w-full md:w-auto px-10 py-5 bg-foreground hover:bg-primary text-white rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-3 premium-shadow"
              >
                <ShoppingBag className="w-6 h-6" /> Add to Cart
              </button>

              {/* Nutrition */}
              <div className="pt-8 border-t border-border mt-8">
                <h3 className="font-bold mb-4 text-lg">Nutrition Facts</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(product.nutrition || {}).map(([key, value]) => (
                    <div key={key} className="bg-accent/30 p-4 rounded-2xl text-center">
                      <div className="text-xl font-bold text-foreground">{String(value)}</div>
                      <div className="text-sm text-muted-foreground capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
