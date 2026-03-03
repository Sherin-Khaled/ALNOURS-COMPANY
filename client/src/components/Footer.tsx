import { Link } from "wouter";
import { Citrus, MapPin, Phone, Mail } from "lucide-react";

export function Footer({ minimal = false }: { minimal?: boolean }) {
  if (minimal) {
    return (
      <footer className="bg-neutral-50 border-t border-neutral-200 py-8 mt-16">
        <div className="container-custom text-center text-small text-neutral-500">
          <p>&copy; {new Date().getFullYear()} ALNOURS Food Trading. All rights reserved.</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-neutral-950 text-white pt-16 pb-8 mt-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <Citrus className="w-6 h-6 text-white" />
              </div>
              <span className="font-sora font-bold text-h4 tracking-tight">ALNOURS</span>
            </div>
            <p className="text-white/60 leading-relaxed max-w-md text-body">
              ALNOURS is a Saudi-based food distribution company supplying premium FMCG products to customers across the Kingdom. We focus on reliable availability, clear pricing, and fast fulfillment.
            </p>
          </div>

          <div>
            <h4 className="font-sora font-bold text-body mb-6">Explore</h4>
            <ul className="space-y-3 text-white/60 text-small">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link href="/brands" className="hover:text-white transition-colors">Brands</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sora font-bold text-body mb-6">Contact</h4>
            <ul className="space-y-4 text-white/60 text-small">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <span>hello@alnours.sa</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <span>+966 50 123 4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span>Al Olaya Dist, Riyadh, Saudi Arabia</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center text-label text-white/40">
          <p>&copy; {new Date().getFullYear()} ALNOURS Food Trading. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
