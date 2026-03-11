import { Link } from "wouter";
import type { Product } from "@shared/schema";
import { AddButton } from "@/components/AddButton";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductCardProps {
  product: Product;
  variant?: "featured" | "grid" | "related";
}

const variantStyles = {
  featured: {
    width: 251,
    minHeight: 210,
    imgHeight: 180,
    imgRight: -16,
    imgTop: 8,
    fruitSize: 160,
    fruitRight: -8,
    fruitBottom: -10,
    textMaxW: "68%",
    titleClass: "text-[14px] leading-[18px] font-semibold line-clamp-1",
    buttonVariant: "compact" as const,
    padding: "p-4",
  },
  grid: {
    width: undefined,
    minHeight: 230,
    imgHeight: 230,
    imgRight: -20,
    imgTop: 10,
    fruitSize: 180, // ✅ width only - reduced for better proportion
    fruitRight: -10,
    fruitBottom: -18,
    textMaxW: "66%",
    titleClass: "text-[18px] leading-[24px] font-semibold line-clamp-2",
    buttonVariant: "full" as const,
    padding: "p-6",
  },
  related: {
    width: 280,
    minHeight: 220,
    imgHeight: 190,
    imgRight: -16,
    imgTop: 8,
    fruitSize: 170, // ✅ width only - reduced for better proportion
    fruitRight: -8,
    fruitBottom: -12,
    textMaxW: "64%",
    titleClass: "text-[15px] leading-[20px] font-semibold line-clamp-2",
    buttonVariant: "compact" as const,
    padding: "p-4",
  },
};

// Helper function to parse product name and extract size info
function parsProductName(name: string): { title: string; size?: string } {
  const sizeMatch = name.match(/^(.+?)\s+(\d+\s*ml\s*\([^)]+\))$/i);
  if (sizeMatch) {
    return { title: sizeMatch[1], size: sizeMatch[2] };
  }
  return { title: name };
}

export function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const s = variantStyles[variant];
  const { locale, t } = useLanguage();
  const isRtl = locale === "ar";
  const displayName = (isRtl && (product as any).nameAr) ? (product as any).nameAr : product.name;
  const parsed = parsProductName(displayName);
  const title = parsed.title;
  const size = parsed.size || (product.sizes?.length ? product.sizes.join(" & ") : undefined);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      data-testid={`product-card-${product.id}`}
    >
      <div
        className={`relative rounded-[20px] overflow-visible ${s.padding}`}
        style={{
          minHeight: s.minHeight,
          width: s.width,
          backgroundColor: "rgba(237,242,253,0.5)",
        }}
      >
        <div className="relative z-20 flex flex-col gap-3" style={{ maxWidth: s.textMaxW }}>
          <div>
            <h3 className={`${s.titleClass} text-neutral-950`}>{title}</h3>
            {size && (
              <p className="text-[13px] leading-[17px] text-neutral-400 font-normal">{size}</p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-[12px] leading-[16px] text-neutral-500">{t.product.premiumDrink}</p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] text-neutral-500">{product.currency}</span>
              <span className="text-[20px] font-bold text-neutral-950">{product.price}</span>
            </div>

            <div className="w-fit">
              <AddButton variant={s.buttonVariant} product={product} />
            </div>
          </div>
        </div>

        <div
          className="absolute pointer-events-none select-none"
          style={{
            ...(isRtl ? { left: s.imgRight } : { right: s.imgRight }),
            top: s.imgTop,
            zIndex: 30,
            height: s.imgHeight,
          }}
        >
          <div className="relative h-full">
            {/* ✅ Fruit splash: width fixed, height auto, ratio-safe */}
            <img
              src="/images/Home/Fruits_splash.png"
              alt=""
              loading="lazy"
              className="fruit-splash absolute pointer-events-none select-none"
              style={{
                width: s.fruitSize,      // ✅ 262
                height: "auto",          // ✅ keeps aspect ratio
                maxWidth: "none",        // ✅ prevents global max-width squeezing
                maxHeight: "none",       // ✅ prevents global max-height squeezing
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10,
                opacity: 0.9,
                display: "block",
              }}
            />

            {/* Packshot */}
            <img
              src={product.images?.packshot}
              alt={product.name}
              loading="lazy"
              className="relative object-contain pointer-events-none select-none group-hover:scale-105 transition-transform duration-500"
              style={{
                height: s.imgHeight,
                width: "auto",
                zIndex: 30,
                display: "block",
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}