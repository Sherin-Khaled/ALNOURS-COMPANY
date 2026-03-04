import { useState, useCallback } from "react";
import { Plus, Check } from "lucide-react";
import type { Product } from "@shared/schema";
import { useCart } from "@/store/use-cart";
import { useToast } from "@/hooks/use-toast";

interface AddButtonProps {
  variant: "compact" | "full";
  product: Product;
  size?: string;
}

export function AddButton({ variant, product, size }: AddButtonProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isSuccess) return;

      const selectedSize =
        size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : "Standard");
      addItem(product, selectedSize, 1);
      toast({
        title: "Added to cart",
        description: `${product.name} added to your cart.`,
      });

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 1200);
    },
    [isSuccess, product, size, addItem, toast],
  );

  const label = variant === "compact" ? "Add" : "Add To Cart";

  return (
    <button
      onClick={handleClick}
      className="h-[36px] px-4 rounded-pill font-semibold text-[13px] flex items-center gap-1.5 whitespace-nowrap transition-all duration-300 btn-styled"
      style={{
        backgroundColor: isSuccess ? "#22C55E" : "#0F3D91",
        color: "#fff",
      }}
      data-testid={`add-button-${product.id}`}
    >
      <span>{isSuccess ? (variant === "compact" ? "Added" : "Added") : label}</span>
      <span
        className="relative w-4 h-4 flex items-center justify-center"
        style={{ transition: "transform 0.3s ease" }}
      >
        <Plus
          className="w-4 h-4 absolute transition-all duration-300"
          style={{
            opacity: isSuccess ? 0 : 1,
            transform: isSuccess ? "rotate(90deg) scale(0)" : "rotate(0) scale(1)",
          }}
        />
        <Check
          className="w-4 h-4 absolute transition-all duration-300"
          style={{
            opacity: isSuccess ? 1 : 0,
            transform: isSuccess ? "rotate(0) scale(1)" : "rotate(-90deg) scale(0)",
          }}
        />
      </span>
    </button>
  );
}
