import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen pt-[64px] flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 bg-primary items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="max-w-md relative z-10">
          <h1 className="text-h1 mb-4">Welcome back</h1>
          <p className="text-body opacity-80">Sign in to track orders, manage addresses, and checkout faster.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-h3 text-neutral-950 mb-2">Log In</h2>
            <p className="text-small text-neutral-500">Sign in with your email or sign up to become an ALNOURS member</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-label text-neutral-950">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-[44px] px-4 rounded-md border border-neutral-200 focus:border-primary outline-none"
                placeholder="Email"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-label text-neutral-950">Password</label>
                <button type="button" className="text-small text-primary hover:underline font-semibold">Forgot Password</button>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-[44px] px-4 rounded-md border border-neutral-200 focus:border-primary outline-none"
                placeholder="Password"
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full h-[48px] bg-primary hover:bg-primary-hover text-white font-bold"
            >
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-8 text-center text-small text-neutral-500">
            Don’t have an account? <Link href="/signup" className="text-primary font-bold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
