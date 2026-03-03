import { useAddresses, useCreateAddress } from "@/hooks/use-addresses";
import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Addresses() {
  const { data: addresses, isLoading } = useAddresses();
  const { mutateAsync: createAddress, isPending } = useCreateAddress();
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ title: "", fullName: "", phone: "", city: "", addressLine: "", isDefault: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAddress(formData);
      setShowForm(false);
      setFormData({ title: "", fullName: "", phone: "", city: "", addressLine: "", isDefault: false });
      toast({ title: "Address saved!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-display">Saved Addresses</h2>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 border border-border shadow-sm mb-8 space-y-4">
          <h3 className="font-bold text-lg mb-4">New Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Title (e.g. Home)" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="px-4 py-3 rounded-xl bg-muted focus:bg-white border-2 border-transparent focus:border-primary focus:outline-none" />
            <input placeholder="Full Name" required value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} className="px-4 py-3 rounded-xl bg-muted focus:bg-white border-2 border-transparent focus:border-primary focus:outline-none" />
            <input placeholder="Phone" required value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="px-4 py-3 rounded-xl bg-muted focus:bg-white border-2 border-transparent focus:border-primary focus:outline-none" />
            <input placeholder="City" required value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} className="px-4 py-3 rounded-xl bg-muted focus:bg-white border-2 border-transparent focus:border-primary focus:outline-none" />
          </div>
          <textarea placeholder="Full Address Line" required rows={3} value={formData.addressLine} onChange={e=>setFormData({...formData, addressLine: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-muted focus:bg-white border-2 border-transparent focus:border-primary focus:outline-none resize-none"></textarea>
          
          <div className="flex justify-end gap-4 mt-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 font-bold text-muted-foreground hover:bg-muted rounded-xl">Cancel</button>
            <button type="submit" disabled={isPending} className="px-6 py-3 font-bold bg-foreground text-white rounded-xl hover:bg-primary transition-colors disabled:opacity-50">Save Address</button>
          </div>
        </form>
      )}

      {addresses?.length === 0 && !showForm ? (
         <div className="bg-white rounded-[2rem] p-12 border border-border shadow-sm text-center">
         <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
         <p className="text-lg font-bold">No addresses saved</p>
       </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses?.map(addr => (
            <div key={addr.id} className="bg-white rounded-[2rem] p-6 border border-border shadow-sm relative">
              {addr.isDefault && <span className="absolute top-4 right-4 bg-primary text-white text-xs px-2 py-1 rounded-full font-bold">Default</span>}
              <h4 className="font-bold text-lg flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-primary" /> {addr.title}</h4>
              <div className="text-muted-foreground text-sm space-y-1">
                <p className="text-foreground font-medium">{addr.fullName}</p>
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
