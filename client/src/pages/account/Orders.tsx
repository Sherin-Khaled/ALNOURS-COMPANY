import { useOrders } from "@/hooks/use-orders";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Orders() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) return <div>Loading orders...</div>;

  return (
    <div>
      <h2 className="font-sora text-h3 text-neutral-950 mb-2">Orders</h2>
      <p className="text-body text-neutral-500 mb-8">Track your recent orders and view order details.</p>
      
      {orders?.length === 0 ? (
        <div className="bg-neutral-50 rounded-lg p-16 border border-neutral-200 text-center">
          <h3 className="text-h4 text-neutral-950 mb-2">No orders yet</h3>
          <p className="text-body text-neutral-500 mb-6">Start shopping to place your first order.</p>
          <Button asChild className="h-11 px-8 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold">
            <Link href="/products">Shop products</Link>
          </Button>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-label text-neutral-500 px-6 py-4">Order No.</th>
                <th className="text-label text-neutral-500 px-6 py-4">Date</th>
                <th className="text-label text-neutral-500 px-6 py-4">Total</th>
                <th className="text-label text-neutral-500 px-6 py-4">Status</th>
                <th className="text-label text-neutral-500 px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map(order => (
                <tr key={order.id} className="border-b border-neutral-200 last:border-b-0">
                  <td className="px-6 py-4 font-semibold text-neutral-950 text-small">{order.orderNo}</td>
                  <td className="px-6 py-4 text-neutral-700 text-small">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-semibold text-neutral-950 text-small">SAR {order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-pill text-label ${
                      order.status === 'Delivered' ? 'bg-secondary/10 text-secondary' : 
                      order.status === 'Cancelled' ? 'bg-destructive/10 text-destructive' :
                      'bg-promo/20 text-neutral-950'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary font-semibold text-small hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
