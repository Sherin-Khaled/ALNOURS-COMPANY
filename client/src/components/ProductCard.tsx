import { Link } from "wouter";
import { Plus } from "lucide-react";
import type { Product } from "@shared/schema";
import { useCart } from "@/store/use-cart";
import { useToast } from "@/hooks/use-toast";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    // Default to first size
    const size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "Standard";
    addItem(product, size, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart.`,
    });
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-border/50 hover-lift relative overflow-hidden h-full flex flex-col">
        {/* Image Container */}
        <div className="aspect-square bg-accent/20 rounded-3xl mb-6 relative overflow-hidden flex items-center justify-center p-6">
          <img
            src={product.images?.packshot || "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80"}
            alt={product.name}
            className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-foreground">
              {product.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between px-2">
          <div>
            <h3 className="font-display font-bold text-lg text-foreground line-clamp-1">
              {product.name}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">{product.flavor}</p>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-baseline gap-1 text-primary font-bold text-xl">
              <span className="text-sm">{product.currency}</span>
              <span>{product.price}</span>
            </div>
            
            <button 
              onClick={handleAdd}
              className="w-10 h-10 bg-foreground text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors hover:shadow-lg active:scale-95"
              data-testid={`add-to-cart-${product.id}`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
