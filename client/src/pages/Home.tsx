import { Link } from "wouter";
import { ArrowRight, Truck, ShieldCheck, Leaf } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const featured = products?.slice(0, 4) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-[-1]">
          {/* landing page hero scenic fresh juice oranges */}
          <img 
            src="https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=2574&auto=format&fit=crop"
            alt="Fresh Oranges"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl text-white">
            <span className="inline-block py-1 px-4 rounded-full bg-primary text-white font-bold text-sm tracking-wider mb-6 premium-shadow">
              OFFICIAL DISTRIBUTOR
            </span>
            <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-[1.1] mb-6 drop-shadow-lg">
              Quality <br/>
              <span className="text-primary">Delivered.</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/80 mb-10 leading-relaxed max-w-lg">
              Fresh juices and premium food distributed across Saudi Arabia by ALNOURS. We bring the world's best flavors to your table.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/products" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 flex items-center gap-2 premium-shadow"
              >
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/about" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: "Fast Delivery", desc: "Across all major Saudi cities" },
              { icon: ShieldCheck, title: "Premium Quality", desc: "Certified and authentic brands" },
              { icon: Leaf, title: "Freshness Guaranteed", desc: "Temperature controlled logistics" }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-border/50 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold">Featured Arrivals</h2>
              <p className="text-muted-foreground mt-2">Discover our newest premium selections.</p>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 font-bold text-primary hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-96 bg-accent/20 animate-pulse rounded-[2rem]"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-10 text-center md:hidden">
             <Link href="/products" className="inline-flex items-center gap-2 font-bold text-primary">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
