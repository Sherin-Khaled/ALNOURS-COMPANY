import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, MessageCircle, Truck, ShoppingCart, Package } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Reveal } from "@/components/Reveal";
import { useLanguage } from "@/contexts/LanguageContext";

export function About() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO title={t.seo.about.title} description={t.seo.about.description} />
      <section className="section-spacing bg-neutral-50">
        <div className="container-custom">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">About</span>
          <h1 className="text-h1 text-neutral-950 max-w-3xl">
            Built to deliver trusted products across Saudi Arabia.
          </h1>
          <p className="text-body text-neutral-500 mt-6 max-w-2xl">
            ALNOURS is a Saudi-based food distribution company supplying premium FMCG products with reliable availability, clear pricing (VAT included), and smooth online ordering.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Button asChild className="h-12 px-8 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold">
              <Link href="/products">Shop Products</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-8 rounded-md border-neutral-200 text-neutral-700">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-spacing bg-white overflow-hidden">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-h3 text-neutral-950 mb-4">Our mission</h2>
              <p className="text-body text-neutral-700">
                Make everyday shopping simpler by providing trusted brands, accurate availability, and dependable fulfillment—so customers can order with confidence.
              </p>
            </div>
            <div className="relative">
              <div className="bg-[#0F3D91] text-white p-8 rounded-tl-[16px] rounded-bl-[16px] rounded-tr-none rounded-br-none" style={{ marginRight: '-9999px', paddingRight: 'calc(9999px + 32px)' }}>
                <h2 className="text-h3 text-white mb-4">Coverage across Saudi Arabia</h2>
                <p className="text-body text-white/90">
                  Based in Riyadh and serving customers across Saudi Arabia—including major cities like Jeddah.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing relative overflow-hidden">
        <div className="featured-gradient-bg" />
        <div className="container-custom relative z-10">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">What we do</span>
          <h2 className="text-h2 text-neutral-950 mb-4">Distribution built for reliability.</h2>
          <p className="text-body text-neutral-500 max-w-2xl mb-12">
            We bring trusted FMCG products to customers across Saudi Arabia through dependable supply, simple online ordering, and flexible fulfillment options.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Distribution & supply", desc: "Reliable FMCG supply across Saudi Arabia with consistent availability.", icon: Truck },
              { title: "Online ordering", desc: "Browse products, choose size, and place your order in minutes.", icon: ShoppingCart },
              { title: "Delivery or pickup", desc: "Flexible delivery or pickup options—whichever works for you.", icon: Package }
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
  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO title={t.seo.contact.title} description={t.seo.contact.description} />
      <section className="section-spacing bg-neutral-50">
        <div className="container-custom">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">Contact Us</span>
          <h1 className="text-h2 text-neutral-950 mb-4">Let's plan your next order.</h1>
          <p className="text-body text-neutral-500 max-w-2xl mb-10">
            Whether you're ordering for home or wholesale, we'll help you choose products, sizes, and delivery options—quickly and clearly.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Button asChild className="h-12 px-8 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold">
              <a href="#wholesale">Send Your Requirements</a>
            </Button>
            <Button asChild variant="outline" className="h-12 px-8 rounded-md border-neutral-200 text-neutral-700">
              <a href="tel:+966501234567">Call us directly</a>
            </Button>
          </div>

          <ContactInfo />
        </div>
      </section>

      <section id="wholesale" className="section-spacing bg-white">
        <div className="container-custom max-w-3xl">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">Send your requirements</span>
          <h2 className="text-h3 text-neutral-950 mb-4">Wholesale inquiry — tell us what you need.</h2>
          <p className="text-body text-neutral-500 mb-10">
            Planning a large order? Share the products, quantities, preferred sizes, and delivery city. Our team will get back to you with availability and a tailored quote.
          </p>

          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-label text-neutral-700 mb-2 block">Full Name</label>
                <input type="text" className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
              </div>
              <div>
                <label className="text-label text-neutral-700 mb-2 block">Email</label>
                <input type="email" className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
              </div>
              <div>
                <label className="text-label text-neutral-700 mb-2 block">Phone No.</label>
                <input type="tel" className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
              </div>
              <div>
                <label className="text-label text-neutral-700 mb-2 block">Product Interest</label>
                <input type="text" className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
              </div>
            </div>
            <div>
              <label className="text-label text-neutral-700 mb-2 block">Message</label>
              <textarea rows={5} className="w-full px-4 py-3 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-body"></textarea>
            </div>
            <Button type="submit" className="h-12 px-10 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold">
              Send
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

function ContactInfo() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="flex items-center gap-3 text-neutral-700">
        <Mail className="w-5 h-5 text-secondary" />
        <div>
          <span className="text-label text-neutral-500 block">Mail</span>
          <span className="text-small">hello@alnours.sa</span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-neutral-700">
        <Phone className="w-5 h-5 text-secondary" />
        <div>
          <span className="text-label text-neutral-500 block">Call us</span>
          <span className="text-small">+966 50 123 4567</span>
        </div>
      </div>
      <div className="flex items-center gap-3 text-neutral-700">
        <MapPin className="w-5 h-5 text-secondary" />
        <div>
          <span className="text-label text-neutral-500 block">Address</span>
          <span className="text-small">Al Olaya, Riyadh</span>
        </div>
      </div>
    </div>
  );
}

function ContactCTASection() {
  return (
    <section className="section-spacing bg-white">
      <div className="container-custom">
        <span className="text-label text-primary uppercase tracking-wider mb-2 block">Contact us</span>
        <h2 className="text-h2 text-neutral-950 mb-4">Let's plan your next order.</h2>
        <p className="text-body text-neutral-500 max-w-2xl mb-10">
          Whether you're ordering for home or wholesale, we'll help you choose products, sizes, and delivery options—quickly and clearly.
        </p>

        <div className="flex flex-wrap gap-4 mb-12">
          <Button asChild className="h-12 px-8 rounded-md bg-secondary hover:bg-secondary/90 text-white font-semibold">
            <a href="https://wa.me/966501234567" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp Us
            </a>
          </Button>
          <Button asChild variant="outline" className="h-12 px-8 rounded-md border-neutral-200 text-neutral-700">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>

        <ContactInfo />
      </div>
    </section>
  );
}
