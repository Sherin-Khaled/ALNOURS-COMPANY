import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  
  const categories = ["All", "Cocktail", "Mango", "Orange", "Guava"];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-12">
          <span className="text-label text-primary uppercase tracking-wider mb-2 block">Shop</span>
          <h1 className="text-h2 text-neutral-950">Products</h1>
          <p className="text-body text-neutral-500 mt-2">Premium drinks available now</p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`h-[40px] px-6 rounded-pill font-medium transition-all ${
                cat === "All" 
                  ? "bg-primary text-white" 
                  : "bg-neutral-50 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid - 2 columns premium as per specs */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[300px] bg-neutral-50 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Why ALNOURS */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-neutral-200 pt-16">
          {[
            { title: "VAT included", desc: "Transparent pricing with no hidden costs." },
            { title: "Fast Delivery", desc: "Reliable distribution across Saudi Arabia." },
            { title: "Secure Payment", desc: "Safe and encrypted checkout process." }
          ].map((item, i) => (
            <div key={i} className="text-center">
              <h3 className="text-[20px] font-semibold text-neutral-950 mb-2">{item.title}</h3>
              <p className="text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
