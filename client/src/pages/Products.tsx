import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const { t } = useLanguage();
  
  const categories = [
    { key: "all" as const, label: t.products.filters.all },
    { key: "cocktail" as const, label: t.products.filters.cocktail },
    { key: "mango" as const, label: t.products.filters.mango },
    { key: "orange" as const, label: t.products.filters.orange },
    { key: "guava" as const, label: t.products.filters.guava },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-white">
      <SEO title={t.seo.products.title} description={t.seo.products.description} />
      <div className="container-custom">
        <Reveal>
        <div className="mb-12">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">{t.products.header.eyebrow}</span>
          <h1 className="text-h2 text-neutral-950">{t.products.header.title}</h1>
          <p className="text-body text-neutral-500 mt-2">{t.products.header.subtitle}</p>
        </div>
        </Reveal>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`h-[40px] px-6 rounded-pill font-medium transition-all ${
                cat.key === "all" 
                  ? "bg-primary text-white" 
                  : "bg-neutral-50 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid - 2 columns premium as per specs */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[300px] bg-neutral-50 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products?.map(product => (
              <ProductCard key={product.id} product={product} variant="grid" />
            ))}
          </div>
        )}

        {/* Why ALNOURS */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-neutral-200 pt-16">
          {[
            { title: t.products.whyAlnours.vatIncluded, desc: t.products.whyAlnours.vatDesc },
            { title: t.products.whyAlnours.fastDelivery, desc: t.products.whyAlnours.fastDeliveryDesc },
            { title: t.products.whyAlnours.securePayment, desc: t.products.whyAlnours.securePaymentDesc }
          ].map((item, i) => (
            <div key={i} className="text-center">
              <h3 className="text-[20px] font-semibold text-neutral-950 mb-2">{item.title}</h3>
              <p className="text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
