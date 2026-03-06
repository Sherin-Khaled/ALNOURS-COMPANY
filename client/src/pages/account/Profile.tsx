import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

export default function Profile() {
  const { data: user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  
  if (!user) return null;

  return (
    <div className="space-y-12">
      <div>
        <h2 className="font-sora text-h3 text-neutral-950 mb-2">{t.account.profile.infoTitle}</h2>
        <p className="text-body text-neutral-500 mb-8">{t.account.profile.infoSubtitle}</p>

        <form onSubmit={e => { e.preventDefault(); toast({ title: t.account.profile.saved }); }} className="space-y-6 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-label text-neutral-700 mb-2 block">{t.account.profile.fields.firstName}</label>
              <input type="text" defaultValue={user.firstName} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
            </div>
            <div>
              <label className="text-label text-neutral-700 mb-2 block">{t.account.profile.fields.lastName}</label>
              <input type="text" defaultValue={user.lastName || ""} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
            </div>
          </div>
          <div>
            <label className="text-label text-neutral-700 mb-2 block">{t.account.profile.fields.email}</label>
            <input type="email" defaultValue={user.email} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
          </div>
          <div>
            <label className="text-label text-neutral-700 mb-2 block">{t.account.profile.fields.phone}</label>
            <input type="tel" defaultValue={user.phone} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
          </div>
          <Button type="submit" className="h-11 px-8 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold" data-testid="button-save-profile">
            {t.account.profile.saveChanges}
          </Button>
        </form>
      </div>

      <div className="border-t border-neutral-200 pt-12">
        <h2 className="font-sora text-h4 text-neutral-950 mb-2">{t.account.profile.securityTitle}</h2>
        <p className="text-body text-neutral-500 mb-8">{t.account.profile.securitySubtitle}</p>

        <form onSubmit={e => { e.preventDefault(); toast({ title: t.account.profile.passwordUpdated }); }} className="space-y-6 max-w-xl">
          <div>
            <label className="text-label text-neutral-700 mb-2 block">{t.account.profile.securityFields.current}</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
          </div>
          <div>
            <label className="text-label text-neutral-700 mb-2 block">{t.account.profile.securityFields.new}</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
          </div>
          <div>
            <label className="text-label text-neutral-700 mb-2 block">{t.account.profile.securityFields.confirm}</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
          </div>
          <div>
            <Link href="/forgot-password" className="text-small text-primary hover:underline font-medium" data-testid="link-forgot-password">{t.account.profile.forgot}</Link>
          </div>
          <Button type="submit" className="h-11 px-8 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold" data-testid="button-update-password">
            {t.account.profile.updatePassword}
          </Button>
        </form>
      </div>
    </div>
  );
}
