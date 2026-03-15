import { useCart } from "@/store/use-cart";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCreateOrder } from "@/hooks/use-orders";
import { useAddresses } from "@/hooks/use-addresses";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, CreditCard, Banknote, Check, Lock } from "lucide-react";

type Step = "shipping" | "payment" | "review";

const COUNTRIES = [
  "Saudi Arabia", "United Arab Emirates", "Bahrain", "Kuwait",
  "Oman", "Qatar", "Egypt", "Jordan", "Lebanon", "Iraq"
];

export default function Checkout() {
  const { items, getTotals, clearCart } = useCart();
  const { data: user } = useAuth();
  const { data: savedAddresses } = useAddresses();
  const { mutateAsync: createOrder, isPending } = useCreateOrder();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>("shipping");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("cod");

  const [address, setAddress] = useState({
    fullName: user ? `${user.firstName} ${user.lastName || ""}`.trim() : "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: "",
    city: "",
    country: "Saudi Arabia",
    postalCode: "",
  });

  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { subtotal, shipping, total } = getTotals();

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const validateShipping = () => {
    const errs: Record<string, string> = {};
    if (!address.fullName.trim()) errs.fullName = t.checkout.errors.required;
    if (!address.email.trim() || !address.email.includes("@")) errs.email = t.checkout.errors.invalidEmail;
    if (!address.phone.trim()) errs.phone = t.checkout.errors.required;
    if (!address.street.trim()) errs.street = t.checkout.errors.required;
    if (!address.city.trim()) errs.city = t.checkout.errors.required;
    if (!address.country.trim()) errs.country = t.checkout.errors.required;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    if (paymentMethod === "cod") return true;
    const errs: Record<string, string> = {};
    const num = cardDetails.number.replace(/\s/g, "");
    if (num.length < 13 || num.length > 19) errs.cardNumber = t.checkout.errors.invalidCard;
    if (!cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) errs.cardExpiry = t.checkout.errors.invalidExpiry;
    if (cardDetails.cvv.length < 3) errs.cardCvv = t.checkout.errors.invalidCvv;
    if (!cardDetails.name.trim()) errs.cardName = t.checkout.errors.required;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (step === "shipping" && validateShipping()) {
      setStep("payment");
    } else if (step === "payment" && validatePayment()) {
      setStep("review");
    }
  };

  const handlePlaceOrder = async () => {
    try {
      await createOrder({
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity, size: i.size })),
        shippingAddress: address,
        paymentMethod,
      });
      clearCart();
      toast({ title: t.checkout.orderSuccess, description: t.checkout.orderSuccessDesc });
      setLocation("/account/orders");
    } catch (e: any) {
      toast({ title: t.checkout.orderFailed, description: e.message, variant: "destructive" });
    }
  };

  const fillFromSaved = (addrId: number) => {
    const saved = savedAddresses?.find(a => a.id === addrId);
    if (saved) {
      setAddress(prev => ({
        ...prev,
        fullName: saved.fullName,
        phone: saved.phone,
        street: saved.addressLine,
        city: saved.city,
        country: saved.country || "Saudi Arabia",
        postalCode: saved.postalCode || "",
      }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 16);
    return v.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) return v.slice(0, 2) + "/" + v.slice(2);
    return v;
  };

  const inputCls = (field: string) =>
    `w-full h-11 px-4 rounded-md border ${errors[field] ? "border-destructive" : "border-neutral-200"} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body`;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white">
      <SEO title={t.checkout.seoTitle} description={t.checkout.seoDesc} />
      <div className="container-custom max-w-4xl">
        <button onClick={() => step === "shipping" ? setLocation("/cart") : setStep(step === "review" ? "payment" : "shipping")}
          className="flex items-center gap-1 text-primary font-semibold mb-6 hover:underline" data-testid="button-back">
          <ChevronLeft className="w-4 h-4" /> {t.checkout.back}
        </button>

        <h1 className="text-h2 text-neutral-950 mb-8" data-testid="text-checkout-title">{t.checkout.title}</h1>

        <div className="flex gap-2 mb-10">
          {(["shipping", "payment", "review"] as Step[]).map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full ${
                s === step ? "bg-primary" : (["shipping", "payment", "review"].indexOf(step) > i ? "bg-primary/40" : "bg-neutral-200")
              }`} />
              <span className={`text-small mt-1 block ${s === step ? "text-primary font-semibold" : "text-neutral-500"}`}>
                {t.checkout.steps[s]}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            {step === "shipping" && (
              <div className="space-y-6" data-testid="section-shipping">
                <h2 className="text-h4 text-neutral-950 mb-4">{t.checkout.shippingTitle}</h2>

                {savedAddresses && savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <label className="text-label text-neutral-700 mb-2 block">{t.checkout.savedAddresses}</label>
                    <div className="flex flex-wrap gap-2">
                      {savedAddresses.map(a => (
                        <button key={a.id} onClick={() => fillFromSaved(a.id)}
                          className="px-4 py-2 rounded-pill border border-neutral-200 text-small hover:border-primary hover:text-primary transition-all"
                          data-testid={`button-saved-addr-${a.id}`}>
                          {a.title} — {a.city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-label text-neutral-700 mb-2 block">{t.checkout.fields.fullName} *</label>
                    <input value={address.fullName} onChange={e => setAddress(p => ({...p, fullName: e.target.value}))}
                      className={inputCls("fullName")} data-testid="input-fullname" />
                    {errors.fullName && <p className="text-small text-destructive mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="text-label text-neutral-700 mb-2 block">{t.checkout.fields.email} *</label>
                    <input type="email" value={address.email} onChange={e => setAddress(p => ({...p, email: e.target.value}))}
                      className={inputCls("email")} data-testid="input-email" />
                    {errors.email && <p className="text-small text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="text-label text-neutral-700 mb-2 block">{t.checkout.fields.phone} *</label>
                    <input type="tel" value={address.phone} onChange={e => setAddress(p => ({...p, phone: e.target.value}))}
                      className={inputCls("phone")} data-testid="input-phone" />
                    {errors.phone && <p className="text-small text-destructive mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-label text-neutral-700 mb-2 block">{t.checkout.fields.country} *</label>
                    <select value={address.country} onChange={e => setAddress(p => ({...p, country: e.target.value}))}
                      className={inputCls("country")} data-testid="select-country">
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.country && <p className="text-small text-destructive mt-1">{errors.country}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-label text-neutral-700 mb-2 block">{t.checkout.fields.street} *</label>
                  <input value={address.street} onChange={e => setAddress(p => ({...p, street: e.target.value}))}
                    className={inputCls("street")} data-testid="input-street" />
                  {errors.street && <p className="text-small text-destructive mt-1">{errors.street}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-label text-neutral-700 mb-2 block">{t.checkout.fields.city} *</label>
                    <input value={address.city} onChange={e => setAddress(p => ({...p, city: e.target.value}))}
                      className={inputCls("city")} data-testid="input-city" />
                    {errors.city && <p className="text-small text-destructive mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="text-label text-neutral-700 mb-2 block">{t.checkout.fields.postalCode}</label>
                    <input value={address.postalCode} onChange={e => setAddress(p => ({...p, postalCode: e.target.value}))}
                      className={inputCls("postalCode")} data-testid="input-postal" />
                  </div>
                </div>

                <Button onClick={handleNextStep} className="w-full h-12 rounded-md bg-primary hover:bg-primary-hover !text-white font-bold text-body" data-testid="button-continue-payment">
                  {t.checkout.continueToPayment}
                </Button>
              </div>
            )}

            {step === "payment" && (
              <div className="space-y-6" data-testid="section-payment">
                <h2 className="text-h4 text-neutral-950 mb-4">{t.checkout.paymentTitle}</h2>

                <div className="flex flex-col gap-3">
                  <button onClick={() => setPaymentMethod("card")}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-neutral-200"}`}
                    data-testid="button-payment-card">
                    <CreditCard className={`w-6 h-6 ${paymentMethod === "card" ? "text-primary" : "text-neutral-400"}`} />
                    <div className="text-left flex-1">
                      <span className="font-semibold text-neutral-950">{t.checkout.paymentCard}</span>
                      <span className="text-small text-neutral-500 block">{t.checkout.paymentCardDesc}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "card" ? "border-primary" : "border-neutral-300"}`}>
                      {paymentMethod === "card" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </button>

                  <button onClick={() => setPaymentMethod("cod")}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-neutral-200"}`}
                    data-testid="button-payment-cod">
                    <Banknote className={`w-6 h-6 ${paymentMethod === "cod" ? "text-primary" : "text-neutral-400"}`} />
                    <div className="text-left flex-1">
                      <span className="font-semibold text-neutral-950">{t.checkout.paymentCod}</span>
                      <span className="text-small text-neutral-500 block">{t.checkout.paymentCodDesc}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-primary" : "border-neutral-300"}`}>
                      {paymentMethod === "cod" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                  </button>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-4 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-neutral-500" />
                      <span className="text-small text-neutral-500">{t.checkout.testMode}</span>
                    </div>
                    <div>
                      <label className="text-label text-neutral-700 mb-2 block">{t.checkout.cardFields.name}</label>
                      <input value={cardDetails.name} onChange={e => setCardDetails(p => ({...p, name: e.target.value}))}
                        className={inputCls("cardName")} placeholder="John Doe" data-testid="input-card-name" />
                      {errors.cardName && <p className="text-small text-destructive mt-1">{errors.cardName}</p>}
                    </div>
                    <div>
                      <label className="text-label text-neutral-700 mb-2 block">{t.checkout.cardFields.number}</label>
                      <input value={cardDetails.number} onChange={e => setCardDetails(p => ({...p, number: formatCardNumber(e.target.value)}))}
                        className={inputCls("cardNumber")} placeholder="4242 4242 4242 4242" data-testid="input-card-number" />
                      {errors.cardNumber && <p className="text-small text-destructive mt-1">{errors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-label text-neutral-700 mb-2 block">{t.checkout.cardFields.expiry}</label>
                        <input value={cardDetails.expiry} onChange={e => setCardDetails(p => ({...p, expiry: formatExpiry(e.target.value)}))}
                          className={inputCls("cardExpiry")} placeholder="12/26" data-testid="input-card-expiry" />
                        {errors.cardExpiry && <p className="text-small text-destructive mt-1">{errors.cardExpiry}</p>}
                      </div>
                      <div>
                        <label className="text-label text-neutral-700 mb-2 block">{t.checkout.cardFields.cvv}</label>
                        <input value={cardDetails.cvv} onChange={e => setCardDetails(p => ({...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4)}))}
                          className={inputCls("cardCvv")} placeholder="123" type="password" data-testid="input-card-cvv" />
                        {errors.cardCvv && <p className="text-small text-destructive mt-1">{errors.cardCvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={handleNextStep} className="w-full h-12 rounded-md bg-primary hover:bg-primary-hover !text-white font-bold text-body" data-testid="button-continue-review">
                  {t.checkout.reviewOrder}
                </Button>
              </div>
            )}

            {step === "review" && (
              <div className="space-y-6" data-testid="section-review">
                <h2 className="text-h4 text-neutral-950 mb-4">{t.checkout.reviewTitle}</h2>

                <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
                  <h3 className="text-label text-neutral-950 mb-3 uppercase">{t.checkout.shippingTitle}</h3>
                  <p className="text-body text-neutral-700">{address.fullName}</p>
                  <p className="text-small text-neutral-500">{address.street}, {address.city}</p>
                  <p className="text-small text-neutral-500">{address.country} {address.postalCode && `— ${address.postalCode}`}</p>
                  <p className="text-small text-neutral-500">{address.phone} · {address.email}</p>
                </div>

                <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
                  <h3 className="text-label text-neutral-950 mb-3 uppercase">{t.checkout.paymentTitle}</h3>
                  <div className="flex items-center gap-2">
                    {paymentMethod === "card" ? <CreditCard className="w-5 h-5 text-primary" /> : <Banknote className="w-5 h-5 text-primary" />}
                    <span className="text-body text-neutral-700">
                      {paymentMethod === "card" ? `${t.checkout.paymentCard} •••• ${cardDetails.number.slice(-4)}` : t.checkout.paymentCod}
                    </span>
                  </div>
                </div>

                <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
                  <h3 className="text-label text-neutral-950 mb-3 uppercase">{t.checkout.itemsTitle}</h3>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <span className="text-body text-neutral-700">{item.product.name}</span>
                          <span className="text-small text-neutral-500 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="font-semibold text-neutral-950">{item.product.currency} {item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handlePlaceOrder} disabled={isPending}
                  className="w-full h-14 rounded-md bg-primary hover:bg-primary-hover text-white font-bold text-lg" data-testid="button-place-order">
                  {isPending ? t.cta.processing : (
                    <span className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      {paymentMethod === "card" ? t.checkout.payNow : t.checkout.placeOrder} — {total} SAR
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="lg:w-[320px] shrink-0">
            <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200 sticky top-24">
              <h3 className="text-h4 font-bold text-neutral-950 mb-4">{t.checkout.orderSummary}</h3>
              <div className="space-y-2 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-small">
                    <span className="text-neutral-600 truncate max-w-[180px]">{item.product.name} x{item.quantity}</span>
                    <span className="text-neutral-950 font-medium">{item.product.price * item.quantity} SAR</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-200 pt-3 space-y-2">
                <div className="flex justify-between text-small text-neutral-600">
                  <span>{t.checkout.subtotal}</span><span>{subtotal} SAR</span>
                </div>
                <div className="flex justify-between text-small text-neutral-600">
                  <span>{t.checkout.shipping}</span><span>{shipping} SAR</span>
                </div>
                <div className="flex justify-between font-bold text-body text-neutral-950 pt-2 border-t border-neutral-200">
                  <span>{t.checkout.total}</span><span>{total} SAR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
