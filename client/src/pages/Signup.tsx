import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useSignup } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function Signup() {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phone: "", email: "", password: "", confirmPassword: "" });
  const { mutateAsync: signup, isPending } = useSignup();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password
      });
      toast({ title: "Account created!" });
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
          <h1 className="text-h1 mb-4">Join ALNOURS</h1>
          <p className="text-body opacity-80">Create an account to checkout faster, track orders, and manage addresses.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-h3 text-neutral-950 mb-2">Create account</h2>
            <p className="text-small text-neutral-500">It takes less than a minute.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-label text-neutral-950">Full Name</label>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" required
                  value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="w-full h-[44px] px-4 rounded-md border border-neutral-200 focus:border-primary outline-none" 
                  placeholder="First name"
                />
                <input 
                  type="text"
                  value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="w-full h-[44px] px-4 rounded-md border border-neutral-200 focus:border-primary outline-none" 
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-label text-neutral-950">Phone No.</label>
              <input type="tel" required
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full h-[44px] px-4 rounded-md border border-neutral-200 focus:border-primary outline-none" 
                placeholder="Phone No."
              />
            </div>
            <div className="space-y-2">
              <label className="text-label text-neutral-950">Email</label>
              <input type="email" required
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full h-[44px] px-4 rounded-md border border-neutral-200 focus:border-primary outline-none" 
                placeholder="Email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-label text-neutral-950">Password</label>
              <input type="password" required minLength={6}
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full h-[44px] px-4 rounded-md border border-neutral-200 focus:border-primary outline-none" 
                placeholder="Password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-label text-neutral-950">Confirm password</label>
              <input type="password" required minLength={6}
                value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full h-[44px] px-4 rounded-md border border-neutral-200 focus:border-primary outline-none" 
                placeholder="Confirm password"
              />
            </div>
            
            <Button type="submit" disabled={isPending} className="w-full h-[48px] bg-primary hover:bg-primary-hover text-white font-bold mt-6">
              {isPending ? "Creating..." : "Sign Up"}
            </Button>
          </form>

          <p className="mt-8 text-center text-small text-neutral-500">
            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
