import { useRoute } from "wouter";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useCart } from "@/store/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@shared/schema";

const fruitBgMap: Record<string, string> = {
  mango: "/images/ProductDetails/Mango_Fruits1_1772994682996.png",
  cocktail: "/images/ProductDetails/fruits_1772994682995.png",
  guava: "/images/ProductDetails/fruits3_1772994682996.png",
  orange: "/images/ProductDetails/Orange_fruits_1773165244565.png",
};

const PRODUCT_DESCRIPTION_FALLBACKS = {
  "cocktail-premium-drink": {
    en: "Water, Fruit Juice (Apple / Guava Pulp / Pineapple / Passion Fruit / Banana / Peach) not less than 10%, Sugar, Citric Acid (E330), Food Colors (Caramel) (E150D), Food Flavors, Total Soluble Solid 8% (min.)",
    ar: "ماء، عصير فواكه (تفاح / لب جوافة / أناناس / باشن فروت / موز / خوخ) بنسبة لا تقل عن 10%، سكر، حمض الستريك (E330)، ألوان غذائية (كراميل) (E150D)، نكهات غذائية، مواد صلبة ذائبة كلية 8% كحد أدنى.",
  },
  "guava-premium-drink": {
    en: "Water, Guava Pulp not less than 10%, Sugar, Citric Acid (E330), Food Stabilizer (E466), Ascorbic Acid (E300), Total Soluble Solid 8% (min.)",
    ar: "ماء، لب جوافة بنسبة لا تقل عن 10%، سكر، حمض الستريك (E330)، مُثبت غذائي (E466)، حمض الأسكوربيك (E300)، مواد صلبة ذائبة كلية 8% كحد أدنى.",
  },
  "mango-premium-drink": {
    en: "Water, Mango Pulp not less than 10%, Sugar, Citric Acid (E330), Food Stabilizer (E466) (E415), Ascorbic Acid (E300), Food Color (Beta Carotene) (E160A), Total Soluble Solid 8% (min.)",
    ar: "ماء، لب مانجو بنسبة لا تقل عن 10%، سكر، حمض الستريك (E330)، مُثبت غذائي (E466) و(E415)، حمض الأسكوربيك (E300)، لون غذائي (بيتا كاروتين) (E160A)، مواد صلبة ذائبة كلية 8% كحد أدنى.",
  },
  "orange-premium-drink": {
    en: "Water, Orange Concentrate not less than 10%, Sugar, Citric Acid (E330), Vitamin C (E300), Food Colors (Beta Carotene) (E160A), Food Flavors, Total Soluble Solid 8% (min.)",
    ar: "ماء، مركز برتقال بنسبة لا تقل عن 10%، سكر، حمض الستريك (E330)، فيتامين C (E300)، ألوان غذائية (بيتا كاروتين) (E160A)، نكهات غذائية، مواد صلبة ذائبة كلية 8% كحد أدنى.",
  },
} as const;

function sanitizeProductCopy(value?: string | null) {
  if (!value) return "";

  const cleaned = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<\/li>\s*<li>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");

  return cleaned.trim();
}

function isMeaningfulProductCopy(value: string, product: Product) {
  if (!value) return false;

  const normalizedValue = value.toLowerCase().replace(/\s+/g, " ").trim();
  const invalidValues = new Set(["n/a", "na", "none", "null", "undefined", "-"]);
  const productNames = [product.name, product.nameAr]
    .filter(Boolean)
    .map((name) => String(name).toLowerCase().replace(/\s+/g, " ").trim());

  if (invalidValues.has(normalizedValue)) return false;
  if (productNames.includes(normalizedValue)) return false;
  if (/^\d+\s*(ml|l)$/i.test(normalizedValue)) return false;

  return true;
}

function getProductDescriptionFallback(product: Product, locale: "en" | "ar") {
  return PRODUCT_DESCRIPTION_FALLBACKS[product.slug as keyof typeof PRODUCT_DESCRIPTION_FALLBACKS]?.[locale] ?? null;
}

function resolveIngredientsCopy(product: Product, locale: "en" | "ar", fallback: string) {
  const cleanedDescription = sanitizeProductCopy(product.description);
  if (isMeaningfulProductCopy(cleanedDescription, product)) {
    return cleanedDescription;
  }

  const mappedFallback = getProductDescriptionFallback(product, locale);
  if (mappedFallback) {
    return mappedFallback;
  }

  return fallback;
}

function shouldShowIngredientsToggle(value: string) {
  return value.length > 160 || value.includes("\n");
}

export default function ProductDetail() {
  const [, params] = useRoute("/products/:slug");
  const { t, locale } = useLanguage();
  const { data: product, isLoading } = useProduct(params?.slug || "", locale);
  const { data: allProducts } = useProducts();
  const { addItem } = useCart();
  const { toast } = useToast();
  const isRtl = locale === "ar";
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [ingredientsExpanded, setIngredientsExpanded] = useState(false);

  useEffect(() => {
    if (product && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  useEffect(() => {
    setIngredientsExpanded(false);
  }, [product?.id]);

  useEffect(() => {
    setQuantity(1);
  }, [params?.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 text-center text-2xl font-bold">
        Product not found.
      </div>
    );
  }

  const handleAdd = () => {
    addItem(product, selectedSize || "Standard", quantity);
    toast({
      title: t.product.addedToCart,
      description: t.product.addedDesc.replace("{name}", product.name),
    });
  };

  const relatedProducts = (allProducts || [])
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const flavor = (product.flavor || "").toLowerCase();
  const isOrangeFlavor = flavor === "orange";
  const flavorClass =
    flavor === "mango"
      ? "flavor-mango"
      : flavor === "orange"
      ? "flavor-orange"
      : flavor === "guava"
      ? "flavor-guava"
      : "flavor-cocktail";
  const ingredientsText = resolveIngredientsCopy(product, locale, t.pdp.ingredients.empty);
  const hasIngredientsData = ingredientsText !== t.pdp.ingredients.empty;
  const canExpandIngredients = hasIngredientsData && shouldShowIngredientsToggle(ingredientsText);

  return (
    <div className="relative overflow-hidden pt-24 pb-20 min-h-screen bg-white">
      <SEO
        title={t.seo.productDetail.title.replace("{name}", product.name)}
        description={t.seo.productDetail.description.replace("{name}", product.name)}
      />

      <div
        className={`featured-gradient-bg product-detail-gradient-bg ${flavorClass}${isRtl ? " product-detail-gradient-bg-rtl" : ""}`}
        aria-hidden="true"
      >
        <span className="mesh-aurora mesh-aurora-1" />
        <span className="mesh-aurora mesh-aurora-2" />
        <span className="mesh-aurora mesh-aurora-3" />
        <span className="mesh-aurora mesh-aurora-4" />
      </div>

      <div className="container-custom relative z-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
          <div className="relative flex items-center justify-center min-h-[400px]">
            <img
              src={fruitBgMap[flavor] || "/images/Home/Fruits_splash.png"}
              alt=""
              loading="lazy"
              className={`detail-fruit-image absolute hidden object-contain opacity-100 pointer-events-none select-none md:block ${
                isOrangeFlavor
                  ? "detail-fruit-image-orange w-[360px] h-[440px] md:w-[460px] md:h-[560px]"
                  : "detail-fruit-image-default w-[340px] h-[340px] md:w-[420px] md:h-[420px]"
              }`}
              style={{
                bottom: isOrangeFlavor ? "-6%" : "1%",
                zIndex: 10,
              }}
              data-testid="detail-fruit-image"
            />
            <div className="relative z-20 flex h-[380px] w-full max-w-[320px] items-center justify-center px-4 md:h-[420px] md:max-w-[360px]">
              <img
                src={fruitBgMap[flavor] || "/images/Home/Fruits_splash.png"}
                alt=""
                loading="lazy"
                className={`absolute object-contain opacity-100 pointer-events-none select-none md:hidden ${
                  isOrangeFlavor
                    ? "w-[360px] h-[440px]"
                    : "w-[340px] h-[340px]"
                }`}
                style={{
                  bottom: isOrangeFlavor ? "-6%" : "1%",
                  left: "50%",
                  right: "auto",
                  transform: "translateX(-50%)",
                  zIndex: 10,
                }}
              />
              <img
                src={product.images?.packshot}
                alt={product.name}
                loading="eager"
                className="relative z-20 max-h-full max-w-full object-contain drop-shadow-lg"
                data-testid="detail-packshot-image"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-label text-neutral-500 uppercase tracking-wider mb-2 block">
              {t.pdp.brand}
            </span>
            <h1
              className="text-[32px] md:text-[28px] lg:text-[32px] font-bold text-neutral-950 mb-2"
              data-testid="text-product-name"
            >
              {(locale === "ar" && (product as any).nameAr)
                ? (product as any).nameAr
                : product.name}
            </h1>
            <p className="text-body text-neutral-500 mb-6">{t.pdp.meta}</p>

            <div
              className="text-[24px] font-bold text-neutral-950 mb-8"
              data-testid="text-product-price"
            >
              <span className="text-[18px] mr-1">{product.currency}</span>
              {product.price}
            </div>

            <div className="space-y-8">
              {/* <div>
                <h3 className="text-label text-neutral-950 mb-3">{t.pdp.availableSizes}</h3>
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
              </div> */}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full border-2 border-neutral-200 flex items-center justify-center hover:border-primary hover:text-primary transition-all text-neutral-600 bg-white"
                    data-testid="button-qty-minus"
                  >
                    <span className="text-lg font-bold leading-none">−</span>
                  </button>
                  <span
                    className="w-8 text-center font-bold text-xl text-neutral-950 tabular-nums"
                    data-testid="text-quantity"
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full border-2 border-neutral-200 flex items-center justify-center hover:border-primary hover:text-primary transition-all text-neutral-600 bg-white"
                    data-testid="button-qty-plus"
                  >
                    <span className="text-lg font-bold leading-none">+</span>
                  </button>
                </div>
                <Button
                  onClick={handleAdd}
                  data-testid="button-add-to-cart"
                  className="h-[48px] px-10 bg-primary hover:bg-primary-hover text-white rounded-pill font-bold text-lg flex-1 btn-styled"
                >
                  {t.cta.addToCart}
                </Button>
              </div>

              <div className="pt-8 border-t border-neutral-200">
                <h3 className="text-label text-neutral-950 mb-4 uppercase">
                  {t.pdp.nutrition.label}
                </h3>
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
                <h3 className="text-label text-neutral-950 mb-2 uppercase">
                  {t.pdp.ingredients.label}
                </h3>
                <p
                  className={`text-body text-neutral-700 ${
                    ingredientsExpanded ? "whitespace-pre-line" : "line-clamp-2 whitespace-pre-line"
                  }`}
                  data-testid="text-ingredients"
                >
                  {ingredientsText}
                </p>
                {canExpandIngredients ? (
                  <button
                    className="text-primary font-semibold mt-2 hover:underline"
                    data-testid="button-view-ingredients"
                    onClick={() => setIngredientsExpanded(!ingredientsExpanded)}
                  >
                    {ingredientsExpanded
                      ? t.pdp.ingredients.viewLess
                      : t.pdp.ingredients.viewFull}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="container-custom relative z-10 mt-16">
          <h2 className="text-h3 text-neutral-950 mb-8" data-testid="text-related-title">
            {t.pdp.related.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center md:justify-items-stretch">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} variant="related" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
