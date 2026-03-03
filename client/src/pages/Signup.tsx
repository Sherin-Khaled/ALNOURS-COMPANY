import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useSignup } from "@/hooks/use-auth";
import { Citrus, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phone: "", email: "", password: "" });
  const { mutateAsync: signup, isPending } = useSignup();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(formData);
      toast({ title: "Account created!" });
      setLocation("/account");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-bl from-orange-50 via-white to-green-50 flex items-center justify-center p-4 py-20">
      <div className="w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl border border-white/50 relative overflow-hidden">
        <div className="flex justify-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Citrus className="w-8 h-8" />
          </div>
        </div>
        
        <h2 className="text-3xl font-display font-bold text-center mb-2">Create Account</h2>
        <p className="text-muted-foreground text-center mb-8">Join ALNOURS for fast checkout.</p>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">First Name</label>
              <input type="text" required
                value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-muted focus:bg-white focus:border-primary border-2 border-transparent focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Last Name</label>
              <input type="text" 
                value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-muted focus:bg-white focus:border-primary border-2 border-transparent focus:outline-none" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Phone</label>
            <input type="tel" required
              value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl bg-muted focus:bg-white focus:border-primary border-2 border-transparent focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Email Address</label>
            <input type="email" required
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl bg-muted focus:bg-white focus:border-primary border-2 border-transparent focus:outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Password</label>
            <input type="password" required minLength={6}
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full px-5 py-4 rounded-2xl bg-muted focus:bg-white focus:border-primary border-2 border-transparent focus:outline-none" 
            />
          </div>
          
          <button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-bold transition-colors active:scale-95 disabled:opacity-50 mt-6 flex items-center justify-center gap-2">
            {isPending ? "Creating..." : "Sign Up"} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center mt-8 text-muted-foreground">
          Already have an account? <Link href="/login" className="text-foreground font-bold hover:text-primary transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
