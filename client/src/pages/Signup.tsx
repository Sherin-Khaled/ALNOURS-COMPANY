import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useSignup } from "@/hooks/use-auth";
import { Citrus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Signup() {
  const [formData, setFormData] = useState({ firstName: "", phone: "", email: "", password: "", confirmPassword: "" });
  const { mutateAsync: signup, isPending } = useSignup();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: t.auth.signup.passwordMismatch, variant: "destructive" });
      return;
    }
    try {
      await signup({ firstName: formData.firstName, phone: formData.phone, email: formData.email, password: formData.password });
      toast({ title: t.auth.signup.createdToast });
      setLocation("/account");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-20" style={{ background: "linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F0F9FF 100%)" }}>
      <SEO title={t.seo.signup.title} description={t.seo.signup.description} />
      <div className="w-full max-w-[960px] bg-white rounded-modal shadow-[0_24px_64px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-[400px] bg-primary p-10 md:p-12 text-white flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-white/20 rounded-md flex items-center justify-center">
              <Citrus className="w-6 h-6 text-white" />
            </div>
            <span className="font-sora font-bold text-h4">ALNOURS</span>
          </div>
          <h2 className="font-sora text-h3 mb-4">{t.auth.signup.joinTitle}</h2>
          <p className="text-white/70 text-body">
            {t.auth.signup.joinBody}
          </p>
        </div>

        <div className="flex-1 p-8 md:p-12">
          <h2 className="font-sora text-h3 text-neutral-950 mb-2">{t.auth.signup.title}</h2>
          <p className="text-small text-neutral-500 mb-8">{t.auth.signup.helper}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-label text-neutral-700 mb-2 block">{t.auth.signup.fullName}</label>
              <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body"
                data-testid="input-fullname" />
            </div>
            <div>
              <label className="text-label text-neutral-700 mb-2 block">{t.auth.signup.phone}</label>
              <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body"
                data-testid="input-phone" />
            </div>
            <div>
              <label className="text-label text-neutral-700 mb-2 block">{t.auth.signup.email}</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body"
                data-testid="input-email" />
            </div>
            <div>
              <label className="text-label text-neutral-700 mb-2 block">{t.auth.signup.password}</label>
              <input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body"
                data-testid="input-password" />
            </div>
            <div>
              <label className="text-label text-neutral-700 mb-2 block">{t.auth.signup.confirmPassword}</label>
              <input type="password" required minLength={6} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body"
                data-testid="input-confirm-password" />
            </div>
            
            <Button type="submit" disabled={isPending} className="w-full h-12 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold text-body" data-testid="button-signup">
              {isPending ? t.cta.creating : t.auth.signup.button}
            </Button>
          </form>

          <p className="text-center mt-8 text-neutral-500 text-small">
            {t.auth.signup.bottomPrefix}{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">{t.auth.signup.bottomLink}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
