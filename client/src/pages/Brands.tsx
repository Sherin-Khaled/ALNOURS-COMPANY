import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Brands() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO title={t.seo.brands.title} description={t.seo.brands.description} />
      <div className="container-custom">
        <Reveal>
        <div className="mb-12">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">Brands</span>
          <h1 className="text-h2 text-neutral-950">Our Brands</h1>
          <p className="text-body text-neutral-500 mt-2">
            We distribute trusted FMCG brands across Saudi Arabia.
          </p>
        </div>
        </Reveal>

        {/* Domty Card */}
        <div className="bg-neutral-50 rounded-section p-8 md:p-12 mb-16 border border-neutral-200">
          <div className="max-w-2xl">
            <h2 className="text-h3 text-neutral-950 mb-4">Domty</h2>
            <p className="text-body text-neutral-700 mb-8">
              Domty Premium Drinks are available in 235 ml and 1000 ml—ready to order online.
            </p>
            <Button asChild className="h-[48px] px-8 bg-primary hover:bg-primary-hover text-white">
              <Link href="/products">Browse Domty products</Link>
            </Button>
          </div>
        </div>

        <div className="mb-16 italic text-neutral-500">
          More brands coming soon.
        </div>

        {/* Domty at a glance */}
        <div className="bg-white">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">What’s inside</span>
          <h2 className="text-h2 text-neutral-950 mb-4">Domty at a glance</h2>
          <p className="text-body text-neutral-500 mb-12">
            Premium drinks available in 235 ml and 1000 ml. Explore flavors and shop online.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg border border-neutral-200">
              <h3 className="font-bold text-neutral-950 mb-2">Flavors available</h3>
              <p className="text-neutral-700">Cocktail, Mango, Guava, Orange</p>
            </div>
            <div className="p-8 rounded-lg border border-neutral-200">
              <h3 className="font-bold text-neutral-950 mb-2">Sizes</h3>
              <p className="text-neutral-700">235 ml • 1000 ml</p>
            </div>
            <div className="p-8 rounded-lg border border-neutral-200">
              <h3 className="font-bold text-neutral-950 mb-2">Clear product info</h3>
              <p className="text-neutral-700">Ingredients & nutrition shown per product</p>
            </div>
          </div>

          <div className="mt-12">
            <Button asChild className="h-[48px] px-8 bg-primary hover:bg-primary-hover text-white">
              <Link href="/products">Shop Domty products</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
