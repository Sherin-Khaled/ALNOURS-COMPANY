import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { data: user } = useAuth();
  const { toast } = useToast();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  
  if (!user) return null;

  return (
    <div className="space-y-12">
      <div>
        <h2 className="font-sora text-h3 text-neutral-950 mb-2">Account Information</h2>
        <p className="text-body text-neutral-500 mb-8">Update your personal information.</p>

        <form onSubmit={e => { e.preventDefault(); toast({ title: "Saved!" }); }} className="space-y-6 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-label text-neutral-700 mb-2 block">First name</label>
              <input type="text" defaultValue={user.firstName} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
            </div>
            <div>
              <label className="text-label text-neutral-700 mb-2 block">Last name</label>
              <input type="text" defaultValue={user.lastName || ""} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
            </div>
          </div>
          <div>
            <label className="text-label text-neutral-700 mb-2 block">Email</label>
            <input type="email" defaultValue={user.email} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
          </div>
          <div>
            <label className="text-label text-neutral-700 mb-2 block">Phone No.</label>
            <input type="tel" defaultValue={user.phone} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
          </div>
          <Button type="submit" className="h-11 px-8 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold" data-testid="button-save-profile">
            Save changes
          </Button>
        </form>
      </div>

      <div className="border-t border-neutral-200 pt-12">
        <h2 className="font-sora text-h4 text-neutral-950 mb-2">Security</h2>
        <p className="text-body text-neutral-500 mb-8">Update your password.</p>

        <form onSubmit={e => { e.preventDefault(); toast({ title: "Password updated!" }); }} className="space-y-6 max-w-xl">
          <div>
            <label className="text-label text-neutral-700 mb-2 block">Current password</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
          </div>
          <div>
            <label className="text-label text-neutral-700 mb-2 block">New password</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
          </div>
          <div>
            <label className="text-label text-neutral-700 mb-2 block">Confirm password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
          </div>
          <div>
            <button type="button" className="text-small text-primary hover:underline font-medium">Forgot your password?</button>
          </div>
          <Button type="submit" className="h-11 px-8 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold" data-testid="button-update-password">
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
