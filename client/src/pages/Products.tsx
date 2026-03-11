import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { SEO } from "@/components/SEO";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import clsx from "clsx";

type Step = {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  imageSrc?: string;
};

function ProcessTimeline({ steps }: { steps: Step[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const lastIdx = steps.length - 1;

  const railScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const bottomScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const [showBottomProgress, setShowBottomProgress] = useState(true);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const idx = Math.min(Math.floor(latest * steps.length), lastIdx);
    setCurrentStepIndex((prev) => (prev === idx ? prev : idx));

    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (idx === lastIdx) {
      hideTimerRef.current = window.setTimeout(() => setShowBottomProgress(false), 450);
    } else {
      setShowBottomProgress(true);
    }
  });

  const scrollToStep = (idx: number) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const totalScrollable = el.offsetHeight - window.innerHeight;

    const progress = steps.length <= 1 ? 0 : idx / (steps.length - 1);
    const targetY = top + totalScrollable * progress;

    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  const Mobile = (
    <div className="md:hidden">
      <div className="container-custom">
        <div className="space-y-6 mt-10">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={clsx(
                "rounded-section p-6",
                "bg-neutral-50 border border-neutral-100",
                "transition hover:shadow-lg"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-[40px] w-[40px] rounded-full bg-primary flex items-center justify-center">
                  <span className="font-semibold text-[16px] leading-[20px] text-white">{i + 1}</span>
                </div>

                <p className="text-[12px] leading-[16px] uppercase tracking-[0.14em] text-primary">
                  {step.eyebrow}
                </p>
              </div>

              <h3 className="mt-4 font-bold text-[22px] leading-[30px] text-neutral-950">{step.title}</h3>

              <p className="mt-2 text-[16px] leading-[26px] text-neutral-700">{step.description}</p>

              {step.imageSrc ? (
                <div className="mt-4 relative w-full overflow-hidden rounded-section shadow-xl aspect-[4/3] bg-white flex items-center justify-center">
                  <img
                    src={step.imageSrc}
                    alt={step.title}
                    className={clsx(
                      "max-w-full max-h-full",
                      step.id === 1 ? "object-contain" : "object-cover"
                    )}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Desktop = (
    <div ref={containerRef} className="hidden md:block h-[320vh] relative">
      <div className="sticky top-0 h-screen">
        <div className="container-custom h-full flex flex-col justify-center">
          <div className="grid items-start gap-10 md:grid-cols-2">
            <div className="grid grid-cols-[64px_1fr] items-start gap-4">
              <div className="relative flex flex-col items-center" aria-label="Process steps">
                <div className="absolute top-[24px] bottom-[24px] w-[2px] bg-primary/30" />

                <motion.div
                  className="absolute top-[24px] bottom-[24px] w-[2px] bg-primary origin-top"
                  style={{ scaleY: railScaleY }}
                />

                <div className="flex flex-col items-center gap-[56px]">
                  {steps.map((step, i) => {
                    const isActive = i === currentStepIndex;
                    const isVisited = i < currentStepIndex;

                    const innerBg = isActive || isVisited ? "bg-primary" : "bg-neutral-200";
                    const numberColor = isActive || isVisited ? "text-white" : "text-neutral-500";

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => scrollToStep(i)}
                        className="relative h-[48px] w-[48px] flex items-center justify-center cursor-pointer"
                        aria-current={isActive ? "step" : undefined}
                        aria-label={`Go to step ${i + 1}`}
                      >
                        {isActive && <div className="absolute inset-0 rounded-full border-2 border-primary" />}
                        <div
                          className={clsx(
                            "h-[40px] w-[40px] rounded-full flex items-center justify-center transition-colors duration-300",
                            innerBg
                          )}
                        >
                          <span className={clsx("font-semibold text-[16px] leading-[20px]", numberColor)}>
                            {i + 1}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative max-w-xl h-[240px] flex items-start">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={steps[currentStepIndex]?.id ?? currentStepIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <p className="text-[12px] leading-[16px] uppercase tracking-[0.14em] text-primary">
                      {steps[currentStepIndex].eyebrow}
                    </p>
                    <h3 className="mt-3 font-bold text-[28px] leading-[36px] text-neutral-950">
                      {steps[currentStepIndex].title}
                    </h3>
                    <p className="mt-3 text-[16px] leading-[28px] text-neutral-700">
                      {steps[currentStepIndex].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-full max-w-[420px] flex justify-end">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={steps[currentStepIndex]?.id ?? currentStepIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.45 }}
                    className="relative overflow-hidden rounded-section shadow-xl bg-white border border-neutral-100"
                    style={{ width: 340 }}
                  >
                    <div className="relative w-full aspect-[4/3] bg-white flex items-center justify-center">
                      {steps[currentStepIndex].imageSrc ? (
                        <img
                          src={steps[currentStepIndex].imageSrc}
                          alt={steps[currentStepIndex].title}
                          className={clsx(
                            "max-w-full max-h-full",
                            steps[currentStepIndex].id === 1 ? "object-contain" : "object-cover"
                          )}
                          style={{ width: "100%", height: "100%" }}
                        />
                      ) : null}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute left-0 right-0 bottom-0 z-30">
            <div className="mx-auto w-full">
              <div className="relative h-[3px] w-full">
                <motion.div
                  className={clsx(
                    "absolute left-0 bottom-0 h-[2px] w-full bg-primary rounded-full origin-left",
                    "transition-[opacity] duration-700",
                    showBottomProgress ? "opacity-100" : "opacity-0"
                  )}
                  style={{ scaleX: bottomScaleX }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {Mobile}
      {Desktop}
    </div>
  );
}

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { key: "all", label: t.products.filters.all },
    { key: "cocktail", label: t.products.filters.cocktail },
    { key: "mango", label: t.products.filters.mango },
    { key: "orange", label: t.products.filters.orange },
    { key: "guava", label: t.products.filters.guava },
  ];

  const filteredProducts = activeCategory === "all"
    ? products
    : products?.filter(p =>
        p.flavor?.toLowerCase().includes(activeCategory.toLowerCase()) ||
        p.category?.toLowerCase().includes(activeCategory.toLowerCase()) ||
        p.name?.toLowerCase().includes(activeCategory.toLowerCase())
      );

  const whySteps: Step[] = t.products.whyAlnoursTimeline.steps.map((step, idx) => ({
    id: idx + 1,
    eyebrow: step.eyebrow,
    title: step.title,
    description: step.description,
    imageSrc: [
      "/images/Products%20page/Alnours_1772924564974.png",
      "/images/Products%20page/Orange_Fresh_Orange_Juice_Advertisement_Square_(11)_-_Made_wit_1772924535286.jpg",
      "/images/Products%20page/delivery2_1772924564974.png",
    ][idx],
  }));

  return (
    <div className="min-h-screen pt-32 pb-16 bg-white">
      <SEO title={t.seo.products.title} description={t.seo.products.description} />
      <div className="container-custom ">
        <div className="relative mb-12">
          <Reveal>
            <div className="relative z-10 text-center">
              <span className="text-label text-primary uppercase tracking-wider mb-2 block">
                {t.products.header.eyebrow}
              </span>
              <h1 className="text-h2 text-neutral-950">{t.products.header.title}</h1>
              <p className="text-body text-neutral-500 mt-2">{t.products.header.subtitle}</p>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              data-testid={`button-filter-${cat.key}`}
              className={`h-[40px] px-6 rounded-pill font-medium transition-all ${
                activeCategory === cat.key
                  ? "bg-primary text-white"
                  : "bg-neutral-50 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[300px] bg-neutral-50 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} variant="grid" />
            ))}
            {filteredProducts?.length === 0 && (
              <div className="col-span-full text-center py-16 text-neutral-500 text-body">
                {t.products.noResults || "No products found for this filter."}
              </div>
            )}
          </div>
        )}

        <section className="mt-24 border-t  pt-16">
          <Reveal>
            <div className="text-center">
              <span className="text-label text-primary uppercase tracking-wider mb-2 block">{t.products.whyAlnoursTimeline.eyebrow}</span>
              <h2 className="text-h2 text-neutral-950">{t.products.whyAlnoursTimeline.title}</h2>
            </div>
          </Reveal>

          <ProcessTimeline steps={whySteps} />
        </section>
      </div>
    </div>
  );
}