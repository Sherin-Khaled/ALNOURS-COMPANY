import { useAddresses, useCreateAddress } from "@/hooks/use-addresses";
import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Addresses() {
  const { data: addresses, isLoading } = useAddresses();
  const { mutateAsync: createAddress, isPending } = useCreateAddress();
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({ title: "", fullName: "", phone: "", city: "", addressLine: "", isDefault: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAddress(formData);
      setShowForm(false);
      setFormData({ title: "", fullName: "", phone: "", city: "", addressLine: "", isDefault: false });
      toast({ title: t.account.addresses.saved });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div>{t.cta.loading}</div>;

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="font-sora text-h3 text-neutral-950 mb-2">{t.account.addresses.title}</h2>
          <p className="text-body text-neutral-500">{t.account.addresses.subtitle}</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}
            className="h-11 px-6 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold"
            data-testid="button-add-address">
            <Plus className="w-4 h-4 mr-2" /> {t.account.addresses.addNew}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-lg p-8 border border-neutral-200 mb-8 space-y-6">
          <h3 className="font-sora font-bold text-h4 text-neutral-950">{t.account.addresses.newAddress}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-label text-neutral-700 mb-2 block">{t.account.addresses.form.fullName}</label>
              <input required value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
            </div>
            <div>
              <label className="text-label text-neutral-700 mb-2 block">{t.account.addresses.form.phone}</label>
              <input required value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
            </div>
            <div>
              <label className="text-label text-neutral-700 mb-2 block">{t.account.addresses.form.city}</label>
              <input required value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
            </div>
            <div>
              <label className="text-label text-neutral-700 mb-2 block">{t.account.addresses.form.label}</label>
              <input required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full h-11 px-4 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body" />
            </div>
          </div>
          <div>
            <label className="text-label text-neutral-700 mb-2 block">{t.account.addresses.form.addressLine}</label>
            <textarea required rows={3} value={formData.addressLine} onChange={e=>setFormData({...formData, addressLine: e.target.value})} className="w-full px-4 py-3 rounded-md border border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-body"></textarea>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="h-11 px-6 rounded-md border-neutral-200 text-neutral-700">{t.cta.cancel}</Button>
            <Button type="submit" disabled={isPending} className="h-11 px-8 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold" data-testid="button-save-address">
              {t.account.addresses.form.save}
            </Button>
          </div>
        </form>
      )}

      {addresses?.length === 0 && !showForm ? (
        <div className="bg-neutral-50 rounded-lg p-16 border border-neutral-200 text-center">
          <MapPin className="w-12 h-12 text-neutral-500 mx-auto mb-4 opacity-50" />
          <p className="text-body font-semibold text-neutral-950">{t.account.addresses.noAddresses}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses?.map(addr => (
            <div key={addr.id} className="bg-neutral-50 rounded-lg p-6 border border-neutral-200 relative">
              {addr.isDefault && <span className="absolute top-4 right-4 bg-primary text-white text-label px-3 py-1 rounded-pill">{t.account.addresses.default}</span>}
              <h4 className="font-semibold text-neutral-950 flex items-center gap-2 mb-3 text-body">
                <MapPin className="w-4 h-4 text-primary" /> {addr.title}
              </h4>
              <div className="text-small text-neutral-700 space-y-1">
                <p className="font-medium text-neutral-950">{addr.fullName}</p>
                <p>{addr.addressLine}</p>
                <p>{addr.city}</p>
                <p>{addr.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
