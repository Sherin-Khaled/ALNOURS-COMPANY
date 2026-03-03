import { useCart } from "@/store/use-cart";
import { Link, useLocation } from "wouter";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center">
        <h2 className="text-h2 text-neutral-950 mb-4">Your Cart</h2>
        <p className="text-body text-neutral-500 mb-8">Your cart is currently empty.</p>
        <Button asChild className="h-[48px] px-8 bg-primary hover:bg-primary-hover text-white">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white">
      <div className="container-custom">
        <h1 className="text-h2 text-neutral-950 mb-10">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-0 border-t border-neutral-200">
            {items.map((item) => (
              <div key={item.id} className="py-4 border-b border-neutral-200 flex items-center gap-4">
                <div className="w-[56px] h-[56px] bg-neutral-50 rounded-[12px] flex-shrink-0 p-1">
                  <img src={item.product.images?.packshot} alt={item.product.name} className="w-full h-full object-contain" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-950">{item.product.name}</h3>
                  <p className="text-small text-neutral-500">{item.size}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-neutral-200 rounded-md">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-neutral-700 hover:bg-neutral-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-neutral-700 hover:bg-neutral-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-destructive"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Coupon Section */}
            <div className="pt-8 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Coupon code" 
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  className="w-full h-[44px] px-4 border border-neutral-200 rounded-md focus:border-primary outline-none"
                />
              </div>
              <Button variant="outline" className="h-[44px] border-neutral-200">Apply</Button>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-neutral-50 p-8 rounded-lg border border-neutral-200">
              <h3 className="text-[20px] font-bold text-neutral-950 mb-6">Cart Total</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-neutral-700">
                  <span>Shipping</span>
                  <span className="font-semibold">10 SAR</span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">{subtotal} SAR</span>
                </div>
                <div className="border-t border-neutral-200 pt-4 flex justify-between font-bold text-xl text-neutral-950">
                  <span>Total</span>
                  <span className="text-primary">{total} SAR</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout}
                disabled={isPending}
                className="w-full h-[48px] bg-primary hover:bg-primary-hover text-white font-bold mb-4"
              >
                {isPending ? "Processing..." : "Proceed To Checkout"}
              </Button>
              <Link href="/products" className="block text-center text-sm font-semibold text-neutral-500 hover:text-primary transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
