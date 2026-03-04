import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";
import { Citrus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutateAsync: login, isPending } = useLogin();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      toast({ title: t.auth.login.welcomeToast });
      setLocation("/account");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F0F9FF 100%)" }}>
      <SEO title={t.seo.login.title} description={t.seo.login.description} />
      <div className="w-full max-w-[960px] bg-white rounded-modal shadow-[0_24px_64px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-[400px] bg-primary p-10 md:p-12 text-white flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-white/20 rounded-md flex items-center justify-center">
              <Citrus className="w-6 h-6 text-white" />
            </div>
            <span className="font-sora font-bold text-h4">ALNOURS</span>
          </div>
          <h2 className="font-sora text-h3 mb-4">{t.auth.login.welcomeTitle}</h2>
          <p className="text-white/70 text-body">
            {t.auth.login.welcomeBody}
          </p>
        </div>

        <div className="flex-1 p-8 md:p-12">
          <h2 className="font-sora text-h3 text-neutral-950 mb-2">{t.auth.login.title}</h2>
          <p className="text-small text-neutral-500 mb-8">
            {t.auth.login.helper}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-label text-neutral-700 mb-2 block">{t.auth.login.email}</label>
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body"
                placeholder="you@example.com" required data-testid="input-email"
              />
            </div>
            <div>
              <label className="text-label text-neutral-700 mb-2 block">{t.auth.login.password}</label>
              <input 
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body"
                placeholder="Enter your password" required data-testid="input-password"
              />
            </div>
            <div className="text-right">
              <button type="button" className="text-small text-primary hover:underline font-medium">{t.auth.login.forgot}</button>
            </div>
            <Button type="submit" disabled={isPending}
              className="w-full h-12 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold text-body"
              data-testid="button-signin"
            >
              {isPending ? t.cta.signingIn : t.auth.login.button}
            </Button>
          </form>

          <p className="text-center mt-8 text-neutral-500 text-small">
            {t.auth.login.bottomPrefix}{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">{t.auth.login.bottomLink}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
