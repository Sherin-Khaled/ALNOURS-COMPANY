import { useAuth } from "@/hooks/use-auth";

export default function Profile() {
  const { data: user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-border shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-muted-foreground font-bold">First Name</label>
          <div className="mt-1 text-lg font-medium">{user.firstName}</div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground font-bold">Last Name</label>
          <div className="mt-1 text-lg font-medium">{user.lastName || "—"}</div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground font-bold">Email</label>
          <div className="mt-1 text-lg font-medium">{user.email}</div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground font-bold">Phone</label>
          <div className="mt-1 text-lg font-medium">{user.phone}</div>
        </div>
      </div>
    </div>
  );
}
