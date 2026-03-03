import { useCart } from "@/store/use-cart";
import { Link, useLocation } from "wouter";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotals, clearCart } = useCart();
  const { data: user } = useAuth();
  const [, setLocation] = useLocation();
  const { mutateAsync: createOrder, isPending } = useCreateOrder();
  const { toast } = useToast();
  
  const [coupon, setCoupon] = useState("");
  const { subtotal, shipping, total } = getTotals();

  const handleCheckout = async () => {
    if (!user) {
      toast({ title: "Login required", description: "Please login to complete your order." });
      setLocation("/login");
      return;
    }
    
    try {
      await createOrder({
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          size: i.size
        })),
        // Hardcoded addressId for demo purposes since we don't have address selection in this simple view
        addressId: undefined 
      });
      clearCart();
      toast({ title: "Order placed!", description: "Thank you for your purchase." });
      setLocation("/account/orders");
    } catch (e: any) {
      toast({ title: "Checkout failed", description: e.message, variant: "destructive" });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-background">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
          <img src="https://cdn-icons-png.flaticon.com/512/2838/2838895.png" alt="Empty Cart" className="w-16 opacity-20" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-4">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
        <Link href="/products" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-display font-bold mb-10">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-border flex flex-col sm:flex-row gap-6 items-center shadow-sm">
                <div className="w-24 h-24 bg-accent/20 rounded-2xl p-2 flex-shrink-0">
                  <img src={item.product.images?.packshot} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-lg text-foreground">{item.product.name}</h3>
                  <p className="text-muted-foreground text-sm">{item.product.flavor} • {item.size}</p>
                  <div className="text-primary font-bold mt-2">{item.product.currency} {item.product.price}</div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-muted rounded-xl p-1 border border-border">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-primary transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-primary transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="p-3 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div>
            <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm sticky top-28">
              <h3 className="text-2xl font-bold font-display mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 text-lg">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-bold text-foreground">SAR {subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-bold text-foreground">SAR {shipping}</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-bold text-2xl">
                  <span>Total</span>
                  <span className="text-primary">SAR {total}</span>
                </div>
              </div>

              {/* Mock Coupon */}
              <div className="mb-8 relative">
                <input 
                  type="text" 
                  placeholder="Promo Code" 
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-4 pr-24 focus:outline-none focus:border-primary transition-colors"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-foreground text-white px-4 rounded-lg text-sm font-bold hover:bg-primary transition-colors">
                  Apply
                </button>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-bold text-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 premium-shadow"
              >
                {isPending ? "Processing..." : "Checkout securely"} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
