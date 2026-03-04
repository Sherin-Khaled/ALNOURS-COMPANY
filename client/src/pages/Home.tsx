import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRef, useEffect, useCallback } from "react";

function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-neutral-50" style={{ paddingTop: 96, paddingBottom: 96 }}>
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <span className="text-[18px] font-bold text-[#248399] uppercase tracking-wider mb-4 block">
                {t.home.hero.eyebrow}
              </span>
              <h1 className="text-h1 text-neutral-950 mb-4">
                {t.home.hero.title}
              </h1>
              <h2 className="text-h3 text-neutral-700 mb-6 font-normal">
                {t.home.hero.subtitle}
              </h2>
              <p className="text-body text-neutral-500 mb-10 max-w-xl">
                {t.home.hero.body}
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Button asChild className="h-[48px] px-8 rounded-pill bg-primary hover:bg-primary-hover text-white font-semibold btn-styled">
                  <Link href="/products">{t.cta.shopProducts}</Link>
                </Button>
                <Button asChild variant="outline" className="h-[48px] px-8 rounded-pill border-neutral-200 text-neutral-700 hover:bg-neutral-50 btn-styled">
                  <Link href="/contact">{t.cta.contactUs}</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-[1px] h-[22px] bg-[#248399]" />
                  <span className="text-[18px] font-bold text-neutral-700">{t.home.hero.badges.vatIncluded}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[1px] h-[22px] bg-[#248399]" />
                  <span className="text-[18px] font-bold text-neutral-700">{t.home.hero.badges.fastDelivery}</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="relative hidden lg:flex items-center justify-center" style={{ minHeight: 501 }}>
              <img
                src="https://images.unsplash.com/photo-1546173159-315724a31696?w=531&h=501&fit=crop&q=80"
                alt="Fresh fruits"
                className="absolute rounded-section object-cover"
                style={{ width: 531, height: 501, right: 0, bottom: 0 }}
              />
              <img
                src="https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=203&h=467&fit=crop&q=80"
                alt="Premium drink"
                className="relative z-10 object-cover rounded-lg shadow-2xl"
                style={{ width: 203, height: 467 }}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FeaturedSection() {
  const { data: products, isLoading } = useProducts();
  const featured = products?.slice(0, 4) || [];
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const manualTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const pauseAuto = useCallback(() => { isPausedRef.current = true; }, []);
  const resumeAuto = useCallback(() => { isPausedRef.current = false; }, []);

  const pauseForManualScroll = useCallback(() => {
    isPausedRef.current = true;
    clearTimeout(manualTimerRef.current);
    manualTimerRef.current = setTimeout(() => { isPausedRef.current = false; }, 2000);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || featured.length === 0) return;

    let animFrame: number;
    const cardW = 251 + 24;
    const setWidth = cardW * featured.length;

    function step() {
      if (!isPausedRef.current && container) {
        container.scrollLeft += 0.5;
        if (container.scrollLeft >= setWidth) {
          container.scrollLeft -= setWidth;
        }
      }
      animFrame = requestAnimationFrame(step);
    }
    animFrame = requestAnimationFrame(step);

    const handleWheel = () => pauseForManualScroll();
    container.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      cancelAnimationFrame(animFrame);
      container.removeEventListener("wheel", handleWheel);
      clearTimeout(manualTimerRef.current);
    };
  }, [featured.length, pauseForManualScroll]);

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="featured-gradient-bg" />

      <div className="container-custom relative z-10">
        <Reveal>
          <div className="mb-12">
            <span className="text-label text-primary uppercase tracking-wider mb-2 block">{t.home.featured.eyebrow}</span>
            <h2 className="text-h2 text-neutral-950">{t.home.featured.title}</h2>
            <p className="text-body text-neutral-500 mt-2">{t.home.featured.subtitle}</p>
          </div>
        </Reveal>

        <Reveal delay={150}>
          {isLoading ? (
            <div className="flex gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="shrink-0" style={{ width: 251, height: 216 }}>
                  <div className="w-full h-full bg-neutral-100 animate-pulse rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
              onMouseEnter={pauseAuto}
              onMouseLeave={resumeAuto}
              onTouchStart={pauseAuto}
              onTouchEnd={resumeAuto}
              onPointerDown={pauseForManualScroll}
              style={{ scrollBehavior: "auto" }}
            >
              {[...featured, ...featured, ...featured].map((product, idx) => (
                <div key={`${product.id}-${idx}`} className="shrink-0" style={{ width: 251 }}>
                  <ProductCard variant="featured" product={product} />
                </div>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-12 text-center">
            <Button asChild variant="link" className="text-primary font-bold text-lg group">
              <Link href="/products">
                {t.cta.viewAll} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <SEO title={t.seo.home.title} description={t.seo.home.description} />
      <HeroSection />
      <FeaturedSection />

      <section className="section-spacing bg-neutral-50">
        <div className="container-custom">
          <Reveal>
            <div className="text-center mb-12">
              <span className="text-label text-primary uppercase tracking-wider mb-2 block">{t.home.flavors.eyebrow}</span>
              <h2 className="text-h2 text-neutral-950">{t.home.flavors.title}</h2>
              <p className="text-body text-neutral-500 mt-2">{t.home.flavors.subtitle}</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { tile: t.home.flavors.tiles.cocktail, color: "bg-[#FFEFD5]", key: "cocktail" },
              { tile: t.home.flavors.tiles.mango, color: "bg-[#FFFACD]", key: "mango" },
              { tile: t.home.flavors.tiles.guava, color: "bg-[#F0FFF0]", key: "guava" },
              { tile: t.home.flavors.tiles.orange, color: "bg-[#FFF5EE]", key: "orange" }
            ].map((flavor, i) => {
              const [name, desc] = flavor.tile.split(" — ");
              return (
                <Reveal key={flavor.key} delay={i * 100}>
                  <Link href={`/products?flavor=${flavor.key}`}>
                    <div className={`p-8 rounded-section ${flavor.color} h-full card-hover-shadow cursor-pointer border border-white/50 transition-all active:scale-95`}>
                      <h3 className="text-h3 text-neutral-950 mb-3">{name}</h3>
                      <p className="text-neutral-700">{desc}</p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-spacing bg-white">
        <div className="container-custom">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-h2 text-neutral-950">{t.home.howItWorks.title}</h2>
              <p className="text-body text-neutral-500 mt-2">{t.home.howItWorks.subtitle}</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              { step: "1", title: t.home.howItWorks.steps.s1_title, body: t.home.howItWorks.steps.s1_body },
              { step: "2", title: t.home.howItWorks.steps.s2_title, body: t.home.howItWorks.steps.s2_body },
              { step: "3", title: t.home.howItWorks.steps.s3_title, body: t.home.howItWorks.steps.s3_body }
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 150}>
                <div className="relative">
                  <div className="text-[120px] font-bold text-neutral-50 absolute -top-16 -left-4 z-0">
                    {item.step}
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-h4 text-neutral-950 mb-4">{item.title}</h3>
                    <p className="text-body text-neutral-700">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
