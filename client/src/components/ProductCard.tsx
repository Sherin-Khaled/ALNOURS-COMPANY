import { Link } from "wouter";
import { Plus } from "lucide-react";
import type { Product } from "@shared/schema";
import { useCart } from "@/store/use-cart";
import { useToast } from "@/hooks/use-toast";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "Standard";
    addItem(product, size, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart.`,
    });
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <div className="bg-white rounded-lg p-5 border border-neutral-200 card-hover-shadow transition-all duration-300 h-full flex flex-col">
        <div className="aspect-[4/3] bg-neutral-50 rounded-md mb-5 relative overflow-hidden flex items-center justify-center p-4">
          <img
            src={product.images?.packshot}
            alt={product.name}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="text-body font-semibold text-neutral-950 line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="text-small font-medium text-neutral-500 mb-4">
            Premium Drink &bull; {product.sizes.join(" & ")}
          </p>
          
          <div className="mt-auto flex items-center justify-between">
            <div className="text-neutral-950 font-bold text-h4">
              <span className="text-small mr-1">{product.currency}</span>
              <span>{product.price}</span>
            </div>
            
            <button 
              onClick={handleAdd}
              className="h-11 px-4 bg-primary text-white rounded-md font-semibold hover:bg-primary-hover transition-colors active:scale-95 flex items-center gap-2"
              data-testid={`add-to-cart-${product.id}`}
            >
              <Plus className="w-5 h-5" />
              <span className="text-small">Add</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
