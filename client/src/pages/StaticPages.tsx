import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Building2, Truck, ShoppingCart, Package } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { GradientMesh } from "@/components/GradientMesh";

type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type LegalPageProps = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
};

function LegalPage({
  seoTitle,
  seoDescription,
  eyebrow,
  title,
  intro,
  lastUpdated,
  sections,
}: LegalPageProps) {
  const { dir } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-white">
      <SEO title={seoTitle} description={seoDescription} />

      <section className="section-spacing">
        <div className="container-custom max-w-4xl">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">{eyebrow}</span>
          <h1 className="text-h2 text-neutral-950 max-w-3xl">{title}</h1>
          <p className="text-body text-neutral-500 mt-6 max-w-3xl">{intro}</p>
          <p className="text-small text-neutral-400 mt-4">{lastUpdated}</p>
        </div>
      </section>

      <section className="section-spacing pt-0 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="space-y-10">
            {sections.map((section, idx) => (
              <Reveal key={section.title} delay={idx * 60}>
                <div className={idx === 0 ? "" : "border-t border-neutral-200 pt-10"}>
                  <h2 className="text-h4 text-neutral-950 mb-4">{section.title}</h2>
                  <div className="space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-body text-neutral-700">
                        {paragraph}
                      </p>
                    ))}

                    {section.bullets?.length ? (
                      <ul
                        className="list-disc space-y-2 text-body text-neutral-700"
                        style={dir === "rtl" ? { paddingRight: "1.25rem" } : { paddingLeft: "1.25rem" }}
                      >
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
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

export function About() {
  const { t, dir } = useLanguage();
  return (
    <div className="min-h-screen pt-24 pb-16 bg-white">
      <SEO title={t.seo.about.title} description={t.seo.about.description} />
      <section className="section-spacing ">
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
            <Button asChild variant="outline" className="h-12 px-8 rounded-md border-neutral-200 text-neutral-700 hover:text-white hover:bg-[#0F3D91]">
              <Link href="/contact">{t.cta.contactUs}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-spacing bg-white overflow-hidden my-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-h3 text-neutral-950 mb-4">{t.about.mission.title}</h2>
              <p className="text-body text-neutral-700">
                {t.about.mission.body}
              </p>
            </div>
            <div className="relative">
              <div
                className={`bg-[#0F3D91] text-white p-8 ${dir === "rtl" ? "rounded-tr-[16px] rounded-br-[16px] rounded-tl-none rounded-bl-none" : "rounded-tl-[16px] rounded-bl-[16px] rounded-tr-none rounded-br-none"}`}
                style={dir === "rtl" ? { marginLeft: '-9999px', paddingLeft: 'calc(9999px + 32px)' } : { marginRight: '-9999px', paddingRight: 'calc(9999px + 32px)' }}
              >
                <h2 className="text-h3 text-white mb-4">{t.about.coverage.title}</h2>
                <p className="text-body !text-white" style={{ opacity: 0.9 }}>
                  {t.about.coverage.body}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden my-16" style={{ paddingTop: "4rem", paddingBottom: "5rem" }}>
        {/* <div className="featured-gradient-bg" style={{ top: "-2rem", bottom: "-2rem" }}><span className="fluid-blob-c" /></div> */}
        <GradientMesh className="z-0" />
        <div className="container-custom relative z-10 text-center">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">{t.about.whatWeDo.eyebrow}</span>
          <h2 className="text-h2 text-neutral-950 mb-4">{t.about.whatWeDo.title}</h2>
          <p className="text-body text-neutral-500 max-w-2xl mb-12 mx-auto">
            {t.about.whatWeDo.body}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { title: t.about.whatWeDo.cards.distribution.title, desc: t.about.whatWeDo.cards.distribution.body, icon: Truck },
              { title: t.about.whatWeDo.cards.ordering.title, desc: t.about.whatWeDo.cards.ordering.body, icon: ShoppingCart },
              { title: t.about.whatWeDo.cards.fulfillment.title, desc: t.about.whatWeDo.cards.fulfillment.body, icon: Package }
            ].map((card, i) => (
              <div key={i} className="bg-[#EDF2FD] p-8 rounded-[20px] card-hover-shadow flex flex-col items-center">
                <card.icon className="w-8 h-8 text-[#0F3D91] mb-4" />
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
  const company = t.company;
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
      <section className="section-spacing bg-white">
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
              <a href={company.phoneHref}>{t.about.contactCta.labels.call}</a>
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

export function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <LegalPage
      seoTitle={t.seo.privacyPolicy.title}
      seoDescription={t.seo.privacyPolicy.description}
      eyebrow={t.legal.eyebrow}
      title={t.legal.privacy.title}
      intro={t.legal.privacy.intro}
      lastUpdated={t.legal.lastUpdated}
      sections={t.legal.privacy.sections}
    />
  );
}

export function TermsConditions() {
  const { t } = useLanguage();

  return (
    <LegalPage
      seoTitle={t.seo.termsConditions.title}
      seoDescription={t.seo.termsConditions.description}
      eyebrow={t.legal.eyebrow}
      title={t.legal.terms.title}
      intro={t.legal.terms.intro}
      lastUpdated={t.legal.lastUpdated}
      sections={t.legal.terms.sections}
    />
  );
}

export function RefundReturnPolicy() {
  const { t } = useLanguage();

  return (
    <LegalPage
      seoTitle={t.seo.refundReturnPolicy.title}
      seoDescription={t.seo.refundReturnPolicy.description}
      eyebrow={t.legal.eyebrow}
      title={t.legal.refund.title}
      intro={t.legal.refund.intro}
      lastUpdated={t.legal.lastUpdated}
      sections={t.legal.refund.sections}
    />
  );
}

export function ShippingDeliveryPolicy() {
  const { t } = useLanguage();

  return (
    <LegalPage
      seoTitle={t.seo.shippingDeliveryPolicy.title}
      seoDescription={t.seo.shippingDeliveryPolicy.description}
      eyebrow={t.legal.eyebrow}
      title={t.legal.shipping.title}
      intro={t.legal.shipping.intro}
      lastUpdated={t.legal.lastUpdated}
      sections={t.legal.shipping.sections}
    />
  );
}

function ContactInfo() {
  const { t } = useLanguage();
  const company = t.company;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[
        { icon: Mail, label: company.labels.email, value: company.email },
        { icon: Building2, label: company.labels.company, value: company.name },
        { icon: MapPin, label: company.labels.address, value: company.address },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 text-neutral-700 p-4 rounded-[16px] transition-all duration-300 hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          <item.icon className="w-5 h-5 text-[#0F3D91] shrink-0" />
          <div>
            <span className="text-label text-neutral-500 block">{item.label}</span>
            <span className="text-small whitespace-pre-line">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactCTASection() {
  const { t } = useLanguage();
  const company = t.company;
  return (
    <section className="section-spacing bg-white">
      <div className="container-custom">
        <span className="text-label text-primary uppercase tracking-wider mb-2 block">{t.about.contactCta.eyebrow}</span>
        <h2 className="text-h2 text-neutral-950 mb-4">{t.about.contactCta.title}</h2>
        <p className="text-body text-neutral-500 max-w-2xl mb-10">
          {t.about.contactCta.body}
        </p>

        <div className="flex flex-wrap gap-4 mb-12">
          <Button asChild className="h-12 px-8 rounded-md bg-[#0F3D91] hover:bg-[#0A285E] text-white font-semibold">
            <a href="/contact#wholesale">{t.cta.sendYourRequirements}</a>
          </Button>
          <Button asChild variant="outline" className="h-12 px-8 rounded-md border-neutral-200 text-neutral-700">
            <a href={company.phoneHref}>{t.about.contactCta.labels.call}</a>
          </Button>
        </div>

        <ContactInfo />
      </div>
    </section>
  );
}
