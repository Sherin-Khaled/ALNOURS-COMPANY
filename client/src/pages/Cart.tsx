import { useCart } from "@/store/use-cart";
import { Link, useLocation } from "wouter";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApplyPromo, usePromoQuote } from "@/hooks/use-promo";

export default function Cart() {
  const { items, promoCode, updateQuantity, removeItem, getTotals, setPromoCode, clearPromoCode } = useCart();
  const { data: user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: products } = useProducts();

  const [coupon, setCoupon] = useState("");
  const { mutateAsync: applyPromo, isPending: isApplyingPromo } = useApplyPromo();
  const baseTotals = getTotals();
  const promoQuote = usePromoQuote(
    promoCode
      ? {
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            size: item.size,
          })),
          promoCode,
        }
      : null,
  );

  const subtotal = promoQuote.data?.subtotal ?? baseTotals.subtotal;
  const shipping = promoQuote.data?.shipping ?? baseTotals.shipping;
  const discount = promoQuote.data?.discount ?? 0;
  const total = promoQuote.data?.total ?? baseTotals.total;

  const { t } = useLanguage();
  const upsellProducts = products?.filter(p => !items.some(i => i.product.id === p.id))?.slice(0, 3) || [];
  const discountLabel = t.cart.rows.discount || "Discount";

  useEffect(() => {
    setCoupon(promoCode || "");
  }, [promoCode]);

  const handleCheckout = () => {
    if (!user) {
      toast({ title: t.cart.loginRequired, description: t.cart.loginRequiredDesc });
      setLocation("/login");
      return;
    }
    setLocation("/checkout");
  };

  const handleApplyCoupon = async () => {
    const trimmedCoupon = coupon.trim();

    if (!trimmedCoupon) {
      clearPromoCode();
      return;
    }

    try {
      const result = await applyPromo({
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          size: item.size,
        })),
        promoCode: trimmedCoupon,
      });

      setPromoCode(result.promoCode);
      setCoupon(result.promoCode);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid promo code";
      toast({
        title: "Promo code",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center">
        <div className="container-custom text-center">
          <h1 className="text-h2 text-neutral-950 mb-4">{t.cart.empty.title}</h1>
          <p className="text-body text-neutral-500 mb-8">{t.cart.empty.body}</p>
          <Button asChild className="h-12 px-8 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold">
            <Link href="/products">{t.cta.startShopping}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white">
      <SEO title={t.seo.cart.title} description={t.seo.cart.description} />
      <div className="container-custom">
        <h1 className="text-h3 text-neutral-950 mb-3 mt-5">{t.cart.title}</h1>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1 lg:max-w-[760px] space-y-0 divide-y divide-neutral-200">
            {items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 items-center">
                <div className="w-14 h-14 bg-neutral-50 rounded-md p-1 shrink-0">
                  <img src={item.product.images?.packshot} alt={item.product.name} className="w-full h-full object-contain" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-950 text-body truncate">{item.product.name}</h3>
                  <p className="text-small text-neutral-500">{item.size}</p>
                </div>

                <div className="flex items-center gap-1 border border-neutral-200 rounded-md">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                    data-testid={`qty-minus-${item.id}`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-semibold text-small">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                    data-testid={`qty-plus-${item.id}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <span className="font-bold text-neutral-950 text-body w-20 text-right">
                  {item.product.currency} {item.product.price * item.quantity}
                </span>

                <button
                  onClick={() => removeItem(item.id)}
                  className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  data-testid={`remove-${item.id}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            <div className="pt-6">
              <p className="text-small text-neutral-500 mb-2">{t.cart.couponLine}</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder={t.cart.couponPlaceholder}
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  className="flex-1 h-11 px-4 rounded-md border border-neutral-200 focus:border-primary outline-none transition-all text-body"
                />
                <Button
                  variant="outline"
                  className="h-11 px-6 rounded-md border-neutral-200 text-neutral-70 font-semibold"
                  disabled={isApplyingPromo}
                  onClick={handleApplyCoupon}
                >
                  {t.cart.apply}
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:w-[360px] shrink-0">
            <div className="bg-neutral-50 p-8 rounded-lg border border-neutral-200 sticky top-24">
              <h3 className="text-h4 font-bold text-neutral-950 mb-6">{t.cart.summaryTitle}</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-neutral-700 text-body">
                  <span>{t.cart.rows.shipping}</span>
                  <span className="font-semibold">{shipping} SAR</span>
                </div>
                <div className="flex justify-between text-neutral-700 text-body">
                  <span>{t.cart.rows.subtotal}</span>
                  <span className="font-semibold">{subtotal} SAR</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-neutral-700 text-body">
                    <span>{discountLabel}</span>
                    <span className="font-semibold">- {discount} SAR</span>
                  </div>
                )}
                <div className="border-t border-neutral-200 pt-4 flex justify-between font-bold text-h4 text-neutral-950">
                  <span>{t.cart.rows.totalLabel}</span>
                  <span>{total} SAR</span>
                </div>
              </div>

              {/* ✅ Proceed button text color forced to white */}
              <Button
                onClick={handleCheckout}
                className="w-full h-12 rounded-md bg-primary hover:bg-primary-hover !text-white font-bold text-body mb-4"
                data-testid="button-checkout"
              >
                {t.cta.proceedToCheckout}
              </Button>

              <Link href="/products" className="block text-center text-primary font-semibold text-small hover:underline">
                {t.cta.continueShopping}
              </Link>
            </div>
          </div>
        </div>

        {upsellProducts.length > 0 && (
          <section className="mt-24 border-t border-neutral-200 pt-16">
            <span className="text-label text-primary uppercase tracking-wider mb-2 block">{t.cart.upsell.eyebrow}</span>
            <h2 className="text-h3 text-neutral-950 mb-2">{t.cart.upsell.title}</h2>
            <p className="text-body text-neutral-500 mb-8">{t.cart.upsell.subtitle}</p>
            {/* ✅ Fruit splash size for the 2nd section is controlled inside ProductCard:
                set grid.fruitSize smaller (e.g. 140 or 160) in ProductCard.tsx (no position change needed). */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upsellProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
