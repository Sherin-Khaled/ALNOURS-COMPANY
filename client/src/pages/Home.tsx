import { Link } from "wouter";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const featured = products?.slice(0, 4) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-neutral-50">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <span className="text-label text-primary uppercase tracking-wider mb-4 block">
              Official Distributor
            </span>
            <h1 className="text-h1 text-neutral-950 mb-4">
              Quality Delivered
            </h1>
            <h2 className="text-h3 text-neutral-700 mb-6 font-normal">
              Fresh juices, delivered across Riyadh & Jeddah.
            </h2>
            <p className="text-body text-neutral-500 mb-10 max-w-xl">
              Shop in minutes—secure payment, VAT included, delivery or pickup.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Button asChild className="h-[48px] px-8 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold">
                <Link href="/products">Shop Products</Link>
              </Button>
              <Button asChild variant="outline" className="h-[48px] px-8 rounded-md border-neutral-200 text-neutral-700 hover:bg-neutral-50">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-neutral-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-promo" />
                <span>VAT included</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-promo" />
                <span>Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decorative element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/10 to-transparent z-0 hidden lg:block" />
      </section>

      {/* Featured Products */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="mb-12">
            <span className="text-label text-primary uppercase tracking-wider mb-2 block">New this week</span>
            <h2 className="text-h2 text-neutral-950">Featured Products</h2>
            <p className="text-body text-neutral-500 mt-2">Best sellers & top picks this week.</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[400px] bg-neutral-50 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Button asChild variant="link" className="text-primary font-bold text-lg group">
              <Link href="/products">
                View All <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Shop by Flavor */}
      <section className="section-spacing bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-label text-primary uppercase tracking-wider mb-2 block">Browse</span>
            <h2 className="text-h2 text-neutral-950">Shop by Flavor</h2>
            <p className="text-body text-neutral-500 mt-2">Pick a flavor and start shopping.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Cocktail", desc: "A fruity blend for a refreshing sip.", color: "bg-[#FFEFD5]" },
              { name: "Mango", desc: "Tropical mango flavor, smooth and rich.", color: "bg-[#FFFACD]" },
              { name: "Guava", desc: "Classic guava taste, light and delicious.", color: "bg-[#F0FFF0]" },
              { name: "Orange", desc: "Citrus refreshment with a bright taste.", color: "bg-[#FFF5EE]" }
            ].map((flavor) => (
              <Link key={flavor.name} href={`/products?flavor=${flavor.name.toLowerCase()}`}>
                <div className={`p-8 rounded-section ${flavor.color} h-full card-hover-shadow cursor-pointer border border-white/50 transition-all active:scale-95`}>
                  <h3 className="text-h3 text-neutral-950 mb-3">{flavor.name}</h3>
                  <p className="text-neutral-700">{flavor.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-h2 text-neutral-950">How it works</h2>
            <p className="text-body text-neutral-500 mt-2">Order in minutes. Delivered with confidence.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Browse & choose", body: "Pick your flavor and size—clear options, no confusion." },
              { step: "2", title: "Pay securely", body: "Secure online payments, VAT included." },
              { step: "3", title: "Delivery or pickup", body: "Choose what suits you in Riyadh & Jeddah." }
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-[120px] font-bold text-neutral-50 absolute -top-16 -left-4 z-0">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <h3 className="text-h4 text-neutral-950 mb-4">{item.step}. {item.title}</h3>
                  <p className="text-body text-neutral-700">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
