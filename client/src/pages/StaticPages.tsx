import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function About() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        {/* Hero */}
        <div className="mb-16">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">About</span>
          <h1 className="text-h1 text-neutral-950 mb-6">Built to deliver trusted products across Saudi Arabia.</h1>
          <p className="text-body text-neutral-500 max-w-3xl mb-8">
            ALNOURS is a Saudi-based food distribution company supplying premium FMCG products with reliable availability, clear pricing (VAT included), and smooth online ordering.
          </p>
          <div className="flex gap-4">
            <Button asChild className="h-[48px] px-8 bg-primary hover:bg-primary-hover text-white">
              <Link href="/products">Shop Products</Link>
            </Button>
            <Button asChild variant="outline" className="h-[48px] px-8 border-neutral-200">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>

        {/* Mission & Coverage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div>
            <h2 className="text-h3 text-neutral-950 mb-4">Our mission</h2>
            <p className="text-body text-neutral-700">
              Make everyday shopping simpler by providing trusted brands, accurate availability, and dependable fulfillment—so customers can order with confidence.
            </p>
          </div>
          <div>
            <h2 className="text-h3 text-neutral-950 mb-4">Coverage across Saudi Arabia</h2>
            <p className="text-body text-neutral-700">
              Based in Riyadh and serving customers across Saudi Arabia—including major cities like Jeddah.
            </p>
          </div>
        </div>

        {/* What we do */}
        <div className="mb-24">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">What we do</span>
          <h2 className="text-h2 text-neutral-950 mb-8">Distribution built for reliability.</h2>
          <p className="text-body text-neutral-500 mb-12 max-w-3xl">
            We bring trusted FMCG products to customers across Saudi Arabia through dependable supply, simple online ordering, and flexible fulfillment options.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-neutral-50 rounded-lg border border-neutral-200">
              <h3 className="font-bold text-neutral-950 mb-4">Distribution & supply</h3>
              <p className="text-neutral-700">Reliable FMCG supply across Saudi Arabia with consistent availability.</p>
            </div>
            <div className="p-8 bg-neutral-50 rounded-lg border border-neutral-200">
              <h3 className="font-bold text-neutral-950 mb-4">Online ordering</h3>
              <p className="text-neutral-700">Browse products, choose size, and place your order in minutes.</p>
            </div>
            <div className="p-8 bg-neutral-50 rounded-lg border border-neutral-200">
              <h3 className="font-bold text-neutral-950 mb-4">Delivery or pickup</h3>
              <p className="text-neutral-700">Flexible delivery or pickup options—whichever works for you.</p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-primary rounded-section p-12 text-center text-white">
          <span className="text-label opacity-80 uppercase tracking-wider mb-2 block">Contact us</span>
          <h2 className="text-h2 mb-4">Let’s plan your next order.</h2>
          <p className="text-body opacity-80 mb-8 max-w-2xl mx-auto">
            Whether you’re ordering for home or wholesale, we’ll help you choose products, sizes, and delivery options—quickly and clearly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="h-[48px] px-8 bg-white text-primary hover:bg-neutral-100">WhatsApp Us</Button>
            <Button asChild variant="outline" className="h-[48px] px-8 border-white text-white hover:bg-white/10">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
          <div className="mt-8 flex justify-center gap-8 text-sm opacity-60">
            <span>Mail</span>
            <span>Call us</span>
            <span>Address</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Contact() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        {/* Top Section */}
        <div className="mb-24">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">Contact Us</span>
          <h1 className="text-h1 text-neutral-950 mb-6">Let’s plan your next order.</h1>
          <p className="text-body text-neutral-500 max-w-3xl mb-8">
            Whether you’re ordering for home or wholesale, we’ll help you choose products, sizes, and delivery options—quickly and clearly.
          </p>
          <div className="flex gap-4">
            <Button className="h-[48px] px-8 bg-primary hover:bg-primary-hover text-white">Send Your Requirements</Button>
            <Button variant="outline" className="h-[48px] px-8 border-neutral-200">Call us directly</Button>
          </div>
          <div className="mt-8 flex gap-8 text-sm text-neutral-500">
            <span>Mail</span>
            <span>Call us</span>
            <span>Address</span>
          </div>
        </div>

        {/* Wholesale Form */}
        <div className="max-w-3xl mx-auto bg-white rounded-section p-8 md:p-12 border border-neutral-200 shadow-sm">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block text-center">Send your requirements</span>
          <h2 className="text-h3 text-neutral-950 mb-4 text-center">Wholesale inquiry — tell us what you need.</h2>
          <p className="text-body text-neutral-500 mb-8 text-center">
            Planning a large order? Share the products, quantities, preferred sizes, and delivery city. Our team will get back to you with availability and a tailored quote.
          </p>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-label text-neutral-950">Full Name</label>
                <input type="text" className="w-full h-[44px] px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-label text-neutral-950">Email</label>
                <input type="email" className="w-full h-[44px] px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-label text-neutral-950">Phone No.</label>
                <input type="tel" className="w-full h-[44px] px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-label text-neutral-950">Product Interest</label>
                <input type="text" className="w-full h-[44px] px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-label text-neutral-950">Message</label>
              <textarea rows={4} className="w-full p-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"></textarea>
            </div>
            <Button className="w-full h-[48px] bg-primary hover:bg-primary-hover text-white font-bold">Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
