import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Brands() {
  const { t } = useLanguage();

  const glanceCards = [
    t.brands.glance.cards.flavors,
    t.brands.glance.cards.sizes,
    t.brands.glance.cards.info,
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO title={t.seo.brands.title} description={t.seo.brands.description} />
      <div className="container-custom">
        <Reveal>
        <div className="mb-12">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">{t.brands.header.eyebrow}</span>
          <h1 className="text-h2 text-neutral-950">{t.brands.header.title}</h1>
          <p className="text-body text-neutral-500 mt-2">
            {t.brands.header.body}
          </p>
        </div>
        </Reveal>

        {/* Domty Card */}
        <div className="bg-neutral-50 rounded-section p-8 md:p-12 mb-16 border border-neutral-200">
          <div className="max-w-2xl">
            <h2 className="text-h3 text-neutral-950 mb-4">Domty</h2>
            <p className="text-body text-neutral-700 mb-8">
              {t.brands.domtyCard.body}
            </p>
            <Button asChild className="h-[48px] px-8 bg-primary hover:bg-primary-hover text-white">
              <Link href="/products">{t.brands.domtyCard.cta}</Link>
            </Button>
          </div>
        </div>

        <div className="mb-16 italic text-neutral-500">
          {t.brands.note}
        </div>

        {/* Domty at a glance */}
        <div className="bg-white">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">{t.brands.glance.eyebrow}</span>
          <h2 className="text-h2 text-neutral-950 mb-4">{t.brands.glance.title}</h2>
          <p className="text-body text-neutral-500 mb-12">
            {t.brands.glance.body}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {glanceCards.map((cardText, i) => {
              const parts = cardText.split(" — ");
              const title = parts[0];
              const body = parts.length > 1 ? parts[1] : "";
              return (
                <div key={i} className="p-8 rounded-[20px] bg-[#EDF2FD] card-hover-shadow transition-all">
                  <h3 className="font-bold text-neutral-950 mb-2">{title}</h3>
                  <p className="text-neutral-700">{body}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12">
            <Button asChild className="h-[48px] px-8 bg-primary hover:bg-primary-hover text-white">
              <Link href="/products">{t.brands.glance.cta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
