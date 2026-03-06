import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, MessageCircle, Truck, ShoppingCart, Package } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export function About() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO title={t.seo.about.title} description={t.seo.about.description} />
      <section className="section-spacing bg-neutral-50">
        <div className="container-custom">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">{t.about.hero.eyebrow}</span>
          <h1 className="text-h1 text-neutral-950 max-w-3xl">
            {t.about.hero.title}
          </h1>
          <p className="text-body text-neutral-500 mt-6 max-w-2xl">
            {t.about.hero.body}
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Button asChild className="h-12 px-8 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold">
              <Link href="/products">{t.cta.shopProducts}</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-8 rounded-md border-neutral-200 text-neutral-700">
              <Link href="/contact">{t.cta.contactUs}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-spacing bg-white overflow-hidden">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-h3 text-neutral-950 mb-4">{t.about.mission.title}</h2>
              <p className="text-body text-neutral-700">
                {t.about.mission.body}
              </p>
            </div>
            <div className="relative">
              <div className="bg-[#0F3D91] text-white p-8 rounded-tl-[16px] rounded-bl-[16px] rounded-tr-none rounded-br-none" style={{ marginRight: '-9999px', paddingRight: 'calc(9999px + 32px)' }}>
                <h2 className="text-h3 text-white mb-4">{t.about.coverage.title}</h2>
                <p className="text-body text-white/90">
                  {t.about.coverage.body}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing relative overflow-hidden">
        <div className="featured-gradient-bg" />
        <div className="container-custom relative z-10">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">{t.about.whatWeDo.eyebrow}</span>
          <h2 className="text-h2 text-neutral-950 mb-4">{t.about.whatWeDo.title}</h2>
          <p className="text-body text-neutral-500 max-w-2xl mb-12">
            {t.about.whatWeDo.body}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: t.about.whatWeDo.cards.distribution.title, desc: t.about.whatWeDo.cards.distribution.body, icon: Truck },
              { title: t.about.whatWeDo.cards.ordering.title, desc: t.about.whatWeDo.cards.ordering.body, icon: ShoppingCart },
              { title: t.about.whatWeDo.cards.fulfillment.title, desc: t.about.whatWeDo.cards.fulfillment.body, icon: Package }
            ].map((card, i) => (
              <div key={i} className="bg-[#EDF2FD] p-8 rounded-[20px] card-hover-shadow">
                <card.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-h4 text-neutral-950 mb-3">{card.title}</h3>
                <p className="text-body text-neutral-700">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactCTASection />
    </div>
  );
}

export function Contact() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", productInterest: "", message: "" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, boolean> = {};
    if (!form.name.trim()) errs.name = true;
    if (!form.email.trim() || !form.email.includes("@")) errs.email = true;
    if (!form.message.trim()) errs.message = true;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsPending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: t.contact.form.errorTitle, description: data.message, variant: "destructive" });
        return;
      }
      toast({ title: t.contact.form.successTitle, description: data.message });
      setForm({ name: "", email: "", phone: "", productInterest: "", message: "" });
    } catch {
      toast({ title: t.contact.form.errorTitle, variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full h-11 px-4 rounded-md border ${errors[field] ? "border-destructive" : "border-neutral-200"} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body`;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO title={t.seo.contact.title} description={t.seo.contact.description} />
      <section className="section-spacing bg-neutral-50">
        <div className="container-custom">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">{t.contact.top.eyebrow}</span>
          <h1 className="text-h2 text-neutral-950 mb-4">{t.contact.top.title}</h1>
          <p className="text-body text-neutral-500 max-w-2xl mb-10">
            {t.contact.top.body}
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Button asChild className="h-12 px-8 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold">
              <a href="#wholesale">{t.cta.sendYourRequirements}</a>
            </Button>
            <Button asChild variant="outline" className="h-12 px-8 rounded-md border-neutral-200 text-neutral-700">
              <a href="tel:+966501234567">{t.cta.callUsDirectly}</a>
            </Button>
          </div>

          <ContactInfo />
        </div>
      </section>

      <section id="wholesale" className="section-spacing bg-white">
        <div className="container-custom max-w-3xl">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">{t.contact.form.eyebrow}</span>
          <h2 className="text-h3 text-neutral-950 mb-4">{t.contact.form.title}</h2>
          <p className="text-body text-neutral-500 mb-10">
            {t.contact.form.body}
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-label text-neutral-700 mb-2 block">{t.contact.form.fields.fullName} *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  className={inputCls("name")} data-testid="input-contact-name" />
              </div>
              <div>
                <label className="text-label text-neutral-700 mb-2 block">{t.contact.form.fields.email} *</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  className={inputCls("email")} data-testid="input-contact-email" />
              </div>
              <div>
                <label className="text-label text-neutral-700 mb-2 block">{t.contact.form.fields.phone}</label>
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                  className={inputCls("phone")} data-testid="input-contact-phone" />
              </div>
              <div>
                <label className="text-label text-neutral-700 mb-2 block">{t.contact.form.fields.productInterest}</label>
                <input type="text" value={form.productInterest} onChange={e => setForm(p => ({...p, productInterest: e.target.value}))}
                  className={inputCls("productInterest")} data-testid="input-contact-product" />
              </div>
            </div>
            <div>
              <label className="text-label text-neutral-700 mb-2 block">{t.contact.form.fields.message} *</label>
              <textarea rows={5} value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))}
                className={`w-full px-4 py-3 rounded-md border ${errors.message ? "border-destructive" : "border-neutral-200"} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-body`}
                data-testid="input-contact-message"></textarea>
            </div>
            <Button type="submit" disabled={isPending}
              className="h-12 px-10 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold"
              data-testid="button-contact-submit">
              {isPending ? t.cta.processing : t.cta.send}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

function ContactInfo() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="flex items-center gap-3 text-neutral-700">
        <Mail className="w-5 h-5 text-secondary" />
        <div>
          <span className="text-label text-neutral-500 block">{t.about.contactCta.labels.mail}</span>
          <span className="text-small">hello@alnours.sa</span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-neutral-700">
        <Phone className="w-5 h-5 text-secondary" />
        <div>
          <span className="text-label text-neutral-500 block">{t.about.contactCta.labels.call}</span>
          <span className="text-small">+966 50 123 4567</span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-neutral-700">
        <MapPin className="w-5 h-5 text-secondary" />
        <div>
          <span className="text-label text-neutral-500 block">{t.about.contactCta.labels.address}</span>
          <span className="text-small">Al Olaya, Riyadh</span>
        </div>
      </div>
    </div>
  );
}

function ContactCTASection() {
  const { t } = useLanguage();
  return (
    <section className="section-spacing bg-white">
      <div className="container-custom">
        <span className="text-label text-primary uppercase tracking-wider mb-2 block">{t.about.contactCta.eyebrow}</span>
        <h2 className="text-h2 text-neutral-950 mb-4">{t.about.contactCta.title}</h2>
        <p className="text-body text-neutral-500 max-w-2xl mb-10">
          {t.about.contactCta.body}
        </p>

        <div className="flex flex-wrap gap-4 mb-12">
          <Button asChild className="h-12 px-8 rounded-md bg-secondary hover:bg-secondary/90 text-white font-semibold">
            <a href="https://wa.me/966501234567" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 mr-2" /> {t.cta.whatsappUs}
            </a>
          </Button>
          <Button asChild variant="outline" className="h-12 px-8 rounded-md border-neutral-200 text-neutral-700">
            <Link href="/contact">{t.cta.contactUs}</Link>
          </Button>
        </div>

        <ContactInfo />
      </div>
    </section>
  );
}
