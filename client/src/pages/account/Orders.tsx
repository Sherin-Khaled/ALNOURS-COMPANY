import { useOrders } from "@/hooks/use-orders";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Order } from "@shared/schema";
import { AccountContentLoadingState } from "@/components/account/AccountLoadingState";

function getOrderStatusClass(status: string) {
  if (status === "Verified") return "bg-green-100 text-green-700";
  if (status === "Delivered") return "bg-secondary/10 text-secondary";
  if (status === "Cancelled") return "bg-destructive/10 text-destructive";

  return "bg-promo/20 text-neutral-950";
}

export default function Orders() {
  const { data: orders, isLoading } = useOrders() as { data: Order[] | undefined; isLoading: boolean };
  const { t } = useLanguage();
  const sortedOrders = [...(orders ?? [])].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    return dateDiff !== 0 ? dateDiff : b.id - a.id;
  });

  if (isLoading) return <AccountContentLoadingState variant="table" />;

  return (
    <div>
      <h2 className="font-sora text-h3 text-neutral-950 mb-2">{t.account.orders.title}</h2>
      <p className="text-body text-neutral-500 mb-8">{t.account.orders.subtitle}</p>
      
      {sortedOrders.length === 0 ? (
        <div className="bg-neutral-50 rounded-lg p-16 border border-neutral-200 text-center">
          <h3 className="text-h4 text-neutral-950 mb-2">{t.account.orders.empty.title}</h3>
          <p className="text-body text-neutral-500 mb-6">{t.account.orders.empty.body}</p>
          <Button asChild className="h-11 px-8 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold">
            <Link href="/products">{t.account.orders.empty.cta}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4 md:hidden">
            {sortedOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-neutral-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-label text-neutral-500 mb-2">
                      {t.account.orders.table.orderNo}
                    </p>
                    <p className="font-semibold text-neutral-950 break-words">
                      {order.orderNo}
                    </p>
                  </div>

                  <span className={`inline-block shrink-0 px-3 py-1 rounded-pill text-label ${getOrderStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-label text-neutral-500 mb-2">
                      {t.account.orders.table.date}
                    </p>
                    <p className="text-small text-neutral-700">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-label text-neutral-500 mb-2">
                      {t.account.orders.table.total}
                    </p>
                    <p className="text-small font-semibold text-neutral-950">
                      SAR {order.total}
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  className="mt-5 h-11 w-full rounded-md bg-primary hover:bg-primary-hover text-white font-semibold"
                >
                  <Link
                    href={`/account/orders/${order.id}`}
                    data-testid={`button-view-order-mobile-${order.id}`}
                  >
                    {t.cta.view}
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="hidden md:block border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-label text-neutral-500 px-6 py-4">{t.account.orders.table.orderNo}</th>
                  <th className="text-label text-neutral-500 px-6 py-4">{t.account.orders.table.date}</th>
                  <th className="text-label text-neutral-500 px-6 py-4">{t.account.orders.table.total}</th>
                  <th className="text-label text-neutral-500 px-6 py-4">{t.account.orders.table.status}</th>
                  <th className="text-label text-neutral-500 px-6 py-4">{t.account.orders.table.action}</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map(order => (
                  <tr key={order.id} className="border-b border-neutral-200 last:border-b-0">
                    <td className="px-6 py-4 font-semibold text-neutral-950 text-small">{order.orderNo}</td>
                    <td className="px-6 py-4 text-neutral-700 text-small">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-neutral-950 text-small">SAR {order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-pill text-label ${getOrderStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/account/orders/${order.id}`} className="text-primary font-semibold text-small hover:underline" data-testid={`link-view-order-${order.id}`}>{t.cta.view}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
