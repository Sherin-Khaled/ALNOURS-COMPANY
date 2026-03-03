import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";
import { Citrus, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutateAsync: login, isPending } = useLogin();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      toast({ title: "Welcome back!" });
      setLocation("/account");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border border-white/50 relative overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute top-[-50px] -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="flex justify-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Citrus className="w-8 h-8" />
          </div>
        </div>
        
        <h2 className="text-3xl font-display font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-muted-foreground text-center mb-8">Sign in to your ALNOURS account.</p>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-bold mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-muted border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-muted border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-foreground hover:bg-primary text-white py-4 rounded-2xl font-bold transition-colors active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {isPending ? "Signing in..." : "Sign In"} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center mt-8 text-muted-foreground">
          Don't have an account? <Link href="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
