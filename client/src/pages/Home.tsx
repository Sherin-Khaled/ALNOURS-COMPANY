import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { SEO } from "@/components/SEO";
import { GradientMesh } from "@/components/GradientMesh";
import { useLanguage } from "@/contexts/LanguageContext";
import { SubtleAccent } from "@/components/SubtleAccent";
import { useRef, useEffect, useCallback, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
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

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const idx = Math.min(Math.floor(latest * steps.length), lastIdx);
    setCurrentStepIndex((prev) => (prev === idx ? prev : idx));
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
                  <span className="font-semibold text-[16px] leading-[20px] text-white">
                    {i + 1}
                  </span>
                </div>

                <p className="text-[12px] leading-[16px] uppercase tracking-[0.14em] text-primary">
                  {step.eyebrow}
                </p>
              </div>

              <h3 className="mt-4 font-bold text-[22px] leading-[30px] text-neutral-950">
                {step.title}
              </h3>

              <p className="mt-2 text-[16px] leading-[26px] text-neutral-700">
                {step.description}
              </p>

              {step.imageSrc ? (
                <div className="mt-4 relative w-full overflow-hidden rounded-section shadow-xl aspect-[4/3] bg-white flex items-center justify-center">
                  <img
                    src={step.imageSrc}
                    alt={step.title}
                    loading="lazy"
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
    <div ref={containerRef} className="hidden md:block h-[220vh] lg:h-[240vh] relative">
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
                    const numberColor =
                      isActive || isVisited ? "text-white" : "text-neutral-500";

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => scrollToStep(i)}
                        className="relative h-[48px] w-[48px] flex items-center justify-center cursor-pointer"
                        aria-current={isActive ? "step" : undefined}
                        aria-label={`Go to step ${i + 1}`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 rounded-full border-2 border-primary" />
                        )}
                        <div
                          className={clsx(
                            "h-[40px] w-[40px] rounded-full flex items-center justify-center transition-colors duration-300",
                            innerBg
                          )}
                        >
                          <span
                            className={clsx(
                              "font-semibold text-[16px] leading-[20px]",
                              numberColor
                            )}
                          >
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
                          loading="lazy"
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
                    currentStepIndex === lastIdx ? "opacity-0" : "opacity-100"
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

  return <div className="relative">{Mobile}{Desktop}</div>;
}

function HeroSection() {
  const { t } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const SLIDE_INTERVAL = 5000;

  const slides = [
    {
      ...(t.home.hero.slides?.s1 ?? {
        eyebrow: t.home.hero.eyebrow,
        title: t.home.hero.title,
        subtitle: t.home.hero.subtitle,
        body: t.home.hero.body,
      }),
      bgImg: "/images/Home/optimized/hero-cocktail-bg.png",
      fgImg: "/images/Home/optimized/hero-cocktail-packshot.png",
      bgAlt: "Fresh fruits",
      fgAlt: "Premium drink",
    },
    {
      ...(t.home.hero.slides?.s2 ?? {
        eyebrow: "Premium Selection",
        title: "Taste the Freshness",
        subtitle: "Domty premium drinks in every flavor you love.",
        body: "Cocktail, Mango, Guava, Orange—available in 200 ml and 1000 ml.",
      }),
      bgImg: "/images/Home/optimized/hero-mango-bg.png",
      fgImg: "/images/Home/optimized/hero-mango-packshot.png",
      bgAlt: "Fruit splash",
      fgAlt: "Premium drink",
    },
    {
      ...(t.home.hero.slides?.s3 ?? {
        eyebrow: "Fast & Reliable",
        title: "Delivered to Your Door",
        subtitle: "Reliable delivery across Saudi Arabia.",
        body: "Order online, pay securely, and get your drinks delivered fast.",
      }),
      bgImg: "/images/Home/optimized/hero-orange-bg.png",
      fgImg: "/images/Home/optimized/hero-orange-packshot.png",
      bgAlt: "Fast delivery",
      fgAlt: "Products",
    },
  ];

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL);
  }, [slides.length]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const goToSlide = (idx: number) => {
    setActiveSlide(idx);
    resetTimer();
  };

  const slide = slides[activeSlide];

  return (
    <section
      className="relative overflow-hidden"
      style={{ paddingTop: 170, paddingBottom: 96 }}
    >
      {/* <GradientMesh /> */}
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <span className="text-[18px] font-bold text-[#248399] uppercase tracking-wider mb-4 block">
                  {slide.eyebrow}
                </span>
                <h1 className="text-h2 text-neutral-950 mb-4">{slide.title}</h1>
                <h2 className="text-h4 text-neutral-700 mb-6 font-normal">{slide.subtitle}</h2>
                <p className="text-body text-neutral-500 mb-10 max-w-xl">{slide.body}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap gap-4 mb-12">
              <Button
                asChild
                className="h-[48px] px-8 rounded-pill bg-primary hover:bg-primary-hover text-white font-semibold btn-styled"
              >
                <Link href="/products">{t.cta.shopProducts}</Link>
              </Button>
              <Button
                asChild
                className="h-[48px] px-8 rounded-pill border-neutral-200 text-black bg-white hover:bg-primary hover:text-white btn-styled"
              >
                <Link href="/contact">{t.cta.contactUs}</Link>
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-8">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  data-testid={`button-hero-slide-${idx}`}
                  className={clsx(
                    "rounded-full transition-all duration-300",
                    idx === activeSlide
                      ? "w-8 h-2 bg-primary"
                      : "w-2 h-2 bg-neutral-300 hover:bg-neutral-400"
                  )}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="w-[1px] h-[40px] bg-[#248399]" />
                <span className="text-[18px] font-medium text-[#248399]">
                  {t.home.hero.badges.vatIncluded}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-[1px] h-[40px] bg-[#248399]" />
                <span className="text-[18px] font-medium text-[#248399]">
                  {t.home.hero.badges.fastDelivery}
                </span>
              </div>
            </div>
          </div>

          <div
            className="relative hidden lg:flex items-center justify-center"
            style={{ minHeight: 501 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full h-full flex items-center justify-center"
                style={{ minHeight: 501 }}
              >
                <img
                  src={slide.bgImg}
                  alt={slide.bgAlt}
                  loading="eager"
                  decoding="async"
                  width={480}
                  height={460}
                  className="absolute rounded-section object-cover"
                  style={{ width: 480, height: 460, left: "50%", transform: "translateX(-50%)", bottom: 0, maxWidth: "100%" }}
                />
                <img
                  src={slide.fgImg}
                  alt={slide.fgAlt}
                  loading="eager"
                  decoding="async"
                  width={185}
                  height={420}
                  className="relative z-10 object-contain rounded-lg"
                  style={{ width: 185, height: 420, maxWidth: "50%" }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
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
  const animationFrameRef = useRef<number>();
  const oneSetWidthRef = useRef(0);

  const pauseAuto = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resumeAuto = useCallback(() => {
    isPausedRef.current = false;
  }, []);

  const pauseForManualScroll = useCallback(() => {
    isPausedRef.current = true;
    clearTimeout(manualTimerRef.current);
    manualTimerRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, 2000);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || featured.length === 0) return;

    const COPIES = 5;

    const measure = () => {
      oneSetWidthRef.current = container.scrollWidth / COPIES;

      // Start in the middle copy, not near either end
      if (oneSetWidthRef.current > 0) {
        container.scrollLeft = oneSetWidthRef.current * 2;
      }
    };

    const normalize = () => {
      const oneSetWidth = oneSetWidthRef.current;
      if (!oneSetWidth) return;

      // Keep scrollLeft safely inside the middle zone
      const minSafe = oneSetWidth;
      const maxSafe = oneSetWidth * 3;

      if (container.scrollLeft < minSafe) {
        container.scrollLeft += oneSetWidth;
      } else if (container.scrollLeft > maxSafe) {
        container.scrollLeft -= oneSetWidth;
      }
    };

    const step = () => {
      if (!container) return;

      if (!isPausedRef.current) {
        container.scrollLeft += 0.5;

        // normalize immediately after moving, before getting near real end
        normalize();
      }

      animationFrameRef.current = requestAnimationFrame(step);
    };

    const handleScroll = () => {
      normalize();
    };

    const handleWheel = () => {
      pauseForManualScroll();
      normalize();
    };

    const handleResize = () => {
      const prevRatio =
        oneSetWidthRef.current > 0 ? container.scrollLeft / oneSetWidthRef.current : 2;

      measure();

      if (oneSetWidthRef.current > 0) {
        container.scrollLeft = oneSetWidthRef.current * Math.max(1, Math.min(3, prevRatio));
      }
    };

    // wait one frame so layout is fully ready before measuring
    const initId = requestAnimationFrame(() => {
      measure();
      animationFrameRef.current = requestAnimationFrame(step);
    });

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(initId);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      clearTimeout(manualTimerRef.current);
    };
  }, [featured.length, pauseForManualScroll]);

  const loopedProducts = [
    ...featured,
    ...featured,
    ...featured,
    ...featured,
    ...featured,
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-white">
      <GradientMesh className="z-0" />

      <div className="container-custom relative z-10">
        <Reveal>
          <div className="mb-12">
            <span className="text-label text-primary uppercase tracking-wider mb-2 block">
              {t.home.featured.eyebrow}
            </span>
            <h2 className="text-h2 text-neutral-950">{t.home.featured.title}</h2>
            <p className="text-body text-neutral-500 mt-2">{t.home.featured.subtitle}</p>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div>
            {isLoading ? (
              <div className="flex gap-8 items-stretch overflow-hidden justify-center">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="shrink-0" style={{ width: 251, height: 320 }}>
                    <div className="w-full h-full bg-neutral-100 animate-pulse rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="flex gap-8 items-stretch overflow-x-auto overflow-y-hidden scrollbar-hide"
                onMouseEnter={pauseAuto}
                onMouseLeave={resumeAuto}
                onTouchStart={pauseAuto}
                onTouchEnd={resumeAuto}
                onPointerDown={pauseForManualScroll}
                style={{ scrollBehavior: "auto" }}
              >
                {loopedProducts.map((product, idx) => (
                  <div
                    key={`${product.id}-${idx}`}
                    className="shrink-0 flex"
                    style={{ width: 251 }}
                  >
                    <div className="w-full">
                      <ProductCard variant="featured" product={product} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-0 text-center">
            <Button asChild variant="link" className="text-primary font-bold text-lg group">
              <Link href="/products">
                {t.cta.viewAll}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

  const howSteps: Step[] = [
    {
      id: 1,
      eyebrow: "STEP 1",
      title: t.home.howItWorks.steps.s1_title,
      description: t.home.howItWorks.steps.s1_body,
      imageSrc: "/images/Home/optimized/timeline-shopping.jpg",
    },
    {
      id: 2,
      eyebrow: "STEP 2",
      title: t.home.howItWorks.steps.s2_title,
      description: t.home.howItWorks.steps.s2_body,
      imageSrc: "/images/Home/optimized/timeline-payment.jpg",
    },
    {
      id: 3,
      eyebrow: "STEP 3",
      title: t.home.howItWorks.steps.s3_title,
      description: t.home.howItWorks.steps.s3_body,
      imageSrc: "/images/Home/optimized/timeline-delivery.jpg",
    },
  ];

  const flavorTiles = [
    {
      key: "cocktail",
      href: "/products?flavor=cocktail",
      alt: "Cocktail",
      img: "/images/Home/Flavors/first_card_1773156175998.png",
    },
    {
      key: "mango",
      href: "/products?flavor=mango",
      alt: "Mango",
      img: "/images/Home/Flavors/mango_1773156175999.png",
    },
    {
      key: "guava",
      href: "/products?flavor=guava",
      alt: "Guava",
      img: "/images/Home/Flavors/guava_1773156175999.png",
    },
    {
      key: "orange",
      href: "/products?flavor=orange",
      alt: "Orange",
      img: "/images/Home/Flavors/orange_1773156175999.png",
    },
  ];

  return (
    <div className="min-h-screen">
      <SEO title={t.seo.home.title} description={t.seo.home.description} />

      <HeroSection />
      <FeaturedSection />

      <section className="relative section-spacing bg-white overflow-hidden">
        <SubtleAccent />
        <div className="container-custom relative z-10">
          <Reveal>
            <div className="text-center mb-12">
              <span className="text-label text-primary uppercase tracking-wider mb-2 block">
                {t.home.flavors.eyebrow}
              </span>
              <h2 className="text-h2 text-neutral-950">{t.home.flavors.title}</h2>
              <p className="text-body text-neutral-500 mt-2 mb-4">{t.home.flavors.subtitle}</p>
            </div>
          </Reveal>

          <div className="flex justify-center">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-0 md:gap-x-0 lg:gap-x-0 gap-y-6 w-fit">
              {flavorTiles.map((item, i) => (
                <Reveal key={item.key} delay={i * 100}>
                  <Link href={item.href}>
                    <div className="w-[220px] sm:w-[240px] lg:w-[380px] cursor-pointer transition-all active:scale-95">
                      <div className="relative overflow-visible">
                        <div className="relative w-full aspect-[3/4] flex items-center justify-center">
                          <img
                            src={item.img}
                            alt={item.alt}
                            className="w-full h-full object-contain"
                            style={{ transform: "scale(1.1)" }}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-custom">
          <section className="mt-24 border-t border-neutral-200 pt-16">
            <Reveal>
              <div className="text-center">
                <h2 className="text-h2 text-neutral-950">{t.home.howItWorks.title}</h2>
                <p className="text-body text-neutral-500 mt-2">{t.home.howItWorks.subtitle}</p>
              </div>
            </Reveal>

            <ProcessTimeline steps={howSteps} />
          </section>
        </div>
      </section>
    </div>
  );
}
