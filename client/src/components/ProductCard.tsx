import { Link } from "wouter";
import type { Product } from "@shared/schema";
import { AddButton } from "@/components/AddButton";

interface ProductCardProps {
  product: Product;
  variant?: "featured" | "grid" | "related";
}

const variantStyles = {
  featured: {
    width: 251,
    height: 216,
    imgHeight: 180,
    imgRight: -16,
    imgTop: 8,
    fruitSize: 120,
    fruitRight: -8,
    fruitBottom: -10,
    textMaxW: "65%",
    titleClass: "text-[14px] leading-[18px] font-semibold line-clamp-2",
    buttonVariant: "compact" as const,
    padding: "p-4",
  },
  grid: {
    width: undefined,
    height: 270,
    imgHeight: 230,
    imgRight: -20,
    imgTop: 10,
    fruitSize: 160,
    fruitRight: -10,
    fruitBottom: -20,
    textMaxW: "60%",
    titleClass: "text-[18px] leading-[24px] font-semibold line-clamp-2",
    buttonVariant: "full" as const,
    padding: "p-6",
  },
  related: {
    width: 280,
    height: 230,
    imgHeight: 190,
    imgRight: -16,
    imgTop: 8,
    fruitSize: 130,
    fruitRight: -8,
    fruitBottom: -12,
    textMaxW: "58%",
    titleClass: "text-[15px] leading-[20px] font-semibold line-clamp-2",
    buttonVariant: "compact" as const,
    padding: "p-4",
  },
};

export function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const s = variantStyles[variant];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      data-testid={`product-card-${product.id}`}
    >
      <div
        className={`relative rounded-[20px] overflow-visible ${s.padding}`}
        style={{
          height: s.height,
          width: s.width,
          backgroundColor: "rgba(237,242,253,0.5)",
        }}
      >
        <div
          className="flex flex-col h-full relative z-10"
          style={{ maxWidth: s.textMaxW }}
        >
          <h3 className={`${s.titleClass} text-neutral-950`}>
            {product.name}
          </h3>
          <div className="mt-1">
            <p className="text-[12px] leading-[16px] text-neutral-500">
              Premium Drink
            </p>
            <p className="text-[12px] leading-[16px] text-neutral-500">
              {product.sizes.join(" & ")}
            </p>
          </div>
          <div className="mt-auto flex items-end justify-between">
            <div>
              <span className="text-[11px] text-neutral-500">
                {product.currency}
              </span>
              <span className="text-[20px] font-bold text-neutral-950 ml-1">
                {product.price}
              </span>
            </div>
            <AddButton variant={s.buttonVariant} product={product} />
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1546173159-315724a31696?w=200&h=200&fit=crop&q=60"
          alt=""
          className="absolute object-cover rounded-full opacity-30 pointer-events-none"
          style={{
            width: s.fruitSize,
            height: s.fruitSize,
            right: s.fruitRight,
            bottom: s.fruitBottom,
            zIndex: 15,
          }}
        />

        <img
          src={product.images?.packshot}
          alt={product.name}
          className="absolute object-contain group-hover:scale-105 transition-transform duration-500 pointer-events-none"
          style={{
            height: s.imgHeight,
            right: s.imgRight,
            top: s.imgTop,
            zIndex: 20,
            width: "auto",
          }}
        />
      </div>
    </Link>
  );
}
