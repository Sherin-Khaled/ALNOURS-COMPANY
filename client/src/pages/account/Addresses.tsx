import { useAddresses, useCreateAddress, useUpdateAddress } from "@/hooks/use-addresses";
import { useState } from "react";
import { MapPin, Plus, Pencil, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Address } from "@shared/schema";
import { AccountContentLoadingState } from "@/components/account/AccountLoadingState";

type FormData = { title: string; fullName: string; phone: string; city: string; addressLine: string; isDefault: boolean };
const emptyForm: FormData = { title: "", fullName: "", phone: "", city: "", addressLine: "", isDefault: false };

export default function Addresses() {
  const { data: addresses, isLoading } = useAddresses();
  const { mutateAsync: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutateAsync: updateAddress, isPending: isUpdating } = useUpdateAddress();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const { t, locale } = useLanguage();
  const isRtl = locale === "ar";
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setFormData({ title: addr.title, fullName: addr.fullName, phone: addr.phone, city: addr.city, addressLine: addr.addressLine, isDefault: addr.isDefault ?? false });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await updateAddress({ id: editingId, data: formData });
      } else {
        await createAddress(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
      toast({ title: t.account.addresses.saved });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) return <AccountContentLoadingState variant="cards" />;

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="font-sora text-h3 text-neutral-950 mb-2">{t.account.addresses.title}</h2>
          <p className="text-body text-neutral-500">{t.account.addresses.subtitle}</p>
        </div>
        {!showForm && (
          <Button onClick={openAdd}
            className="h-11 px-6 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold"
            data-testid="button-add-address">
            <Plus className="w-4 h-4 mr-2" /> {t.account.addresses.addNew}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-lg p-8 border border-neutral-200 mb-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-sora font-bold text-h4 text-neutral-950">
              {editingId !== null ? "Edit Address" : t.account.addresses.newAddress}
            </h3>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="text-neutral-400 hover:text-neutral-700">
              <X className="w-5 h-5" />
            </button>
          </div>
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
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }} className="h-11 px-6 rounded-md border-neutral-200 text-neutral-700">{t.cta.cancel}</Button>
            <Button type="submit" disabled={isCreating || isUpdating} className="h-11 px-8 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold" data-testid="button-save-address">
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
          {addresses?.map((addr: Address) => (
            <div key={addr.id} className="bg-neutral-50 rounded-lg p-6 border border-neutral-200 group text-start">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h4 className="font-semibold text-neutral-950 flex flex-1 items-center gap-2 min-w-0 text-body">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="truncate">{addr.title}</span>
                </h4>
                <div
                  className={`flex shrink-0 items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  {addr.isDefault && (
                    <span className="bg-primary text-white text-label px-3 py-1 rounded-pill">
                      {t.account.addresses.default}
                    </span>
                  )}
                  <button
                    onClick={() => openEdit(addr)}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors"
                    data-testid={`button-edit-address-${addr.id}`}
                    title="Edit address"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
