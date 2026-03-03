import { useOrders } from "@/hooks/use-orders";
import { Package } from "lucide-react";

export default function Orders() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) return <div>Loading orders...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold font-display mb-2">Order History</h2>
      
      {orders?.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 border border-border shadow-sm text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Package className="w-8 h-8" />
          </div>
          <p className="text-lg font-bold">No orders yet</p>
        </div>
      ) : (
        orders?.map(order => (
          <div key={order.id} className="bg-white rounded-[2rem] p-6 border border-border shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-primary/30 transition-colors">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-bold text-lg">Order #{order.orderNo}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Placed on {new Date(order.date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold text-2xl text-primary mb-1">SAR {order.total}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
