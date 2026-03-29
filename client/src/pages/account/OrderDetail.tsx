import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";
import type { Order } from "@shared/schema";
import { AccountContentLoadingState } from "@/components/account/AccountLoadingState";

export default function OrderDetail() {
  const [, params] = useRoute("/account/orders/:id");
  const orderId = params?.id;
  const { t } = useLanguage();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["/api/orders", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch order");
      return await res.json();
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return <AccountContentLoadingState variant="detail" />;
  }

  if (error || !order) {
    return (
      <div data-testid="text-order-not-found">
        <p className="text-body text-neutral-500 mb-4">{t.account.orderDetail?.notFound || "Order not found"}</p>
        <Button asChild variant="outline">
          <Link href="/account/orders" data-testid="link-back-to-orders">
            <ArrowLeft className="w-4 h-4" />
            {t.account.orderDetail?.backToOrders || "Back to Orders"}
          </Link>
        </Button>
      </div>
    );
  }

  const statusColor =
    order.status === "Verified" ? "bg-green-100 text-green-700" :
    order.status === "Delivered" ? "bg-secondary/10 text-secondary" :
    order.status === "Cancelled" ? "bg-destructive/10 text-destructive" :
    "bg-promo/20 text-neutral-950";

  const shippingCost = order.shippingCost ?? ((order.items?.length || 0) > 0 ? 10 : 0);
  const discountAmount = order.discountAmount ?? 0;
  const subtotalFromItems = (order.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const subtotal = subtotalFromItems > 0
    ? subtotalFromItems
    : Math.max(order.total - shippingCost + discountAmount, 0);
  const discountLabel = t.cart.rows.discount || "Discount";
  const paymentStatusCopy =
    order.paymentStatus === "paid" ? { label: t.account.orderDetail?.paid || "Paid", badge: "default" as const } :
    order.paymentStatus === "failed" ? { label: "Failed", badge: "destructive" as const } :
    order.paymentStatus === "unpaid" ? { label: "Unpaid", badge: "secondary" as const } :
    { label: t.account.orderDetail?.pending || "Pending", badge: "secondary" as const };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Button asChild variant="ghost" size="icon" data-testid="button-back-to-orders">
          <Link href="/account/orders">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h2 className="font-sora text-h3 text-neutral-950" data-testid="text-order-title">
            {t.account.orderDetail?.title || "Order"} {order.orderNo}
          </h2>
          <p className="text-small text-neutral-500" data-testid="text-order-date">
            {new Date(order.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <span className={`inline-block px-3 py-1 rounded-pill text-label ${statusColor}`} data-testid="text-order-status">
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-neutral-500" />
              <h3 className="font-sora font-semibold text-neutral-950" data-testid="text-items-title">
                {t.account.orderDetail?.itemsTitle || "Items"}
              </h3>
            </div>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-3 border-b border-neutral-100 last:border-b-0" data-testid={`row-order-item-${idx}`}>
                    {item.image && (
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-neutral-50 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" data-testid={`img-order-item-${idx}`} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-950 text-small" data-testid={`text-item-name-${idx}`}>{item.name}</p>
                      <p className="text-small text-neutral-500">{item.size}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-small text-neutral-500">x{item.quantity}</p>
                      <p className="font-semibold text-neutral-950 text-small" data-testid={`text-item-price-${idx}`}>SAR {item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-small text-neutral-500" data-testid="text-no-items">
                {t.account.orderDetail?.noItems || "No item details available for this order."}
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-sora font-semibold text-neutral-950 mb-4" data-testid="text-summary-title">
              {t.account.orderDetail?.summaryTitle || "Order Summary"}
            </h3>
            <div className="space-y-3 text-small">
              <div className="flex items-center justify-between gap-2">
                <span className="text-neutral-500">{t.checkout?.subtotal || "Subtotal"}</span>
                <span className="font-semibold text-neutral-950" data-testid="text-subtotal">SAR {subtotal}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-neutral-500">{t.checkout?.shipping || "Shipping"}</span>
                <span className="font-semibold text-neutral-950" data-testid="text-shipping">SAR {shippingCost}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-neutral-500">{discountLabel}</span>
                  <span className="font-semibold text-neutral-950">- SAR {discountAmount}</span>
                </div>
              )}
              <div className="border-t border-neutral-200 pt-3 flex items-center justify-between gap-2">
                <span className="font-semibold text-neutral-950">{t.checkout?.total || "Total"}</span>
                <span className="font-sora font-bold text-neutral-950" data-testid="text-total">SAR {order.total}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-neutral-500" />
              <h3 className="font-sora font-semibold text-neutral-950" data-testid="text-payment-title">
                {t.account.orderDetail?.paymentTitle || "Payment"}
              </h3>
            </div>
            <div className="space-y-2 text-small">
              <div className="flex items-center justify-between gap-2">
                <span className="text-neutral-500">{t.account.orderDetail?.method || "Method"}</span>
                <span className="font-semibold text-neutral-950" data-testid="text-payment-method">
                  {order.paymentMethod === "card" ? (t.checkout?.paymentCard || "Credit / Debit Card") : (t.checkout?.paymentCod || "Cash on Delivery")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-neutral-500">{t.account.orderDetail?.paymentStatus || "Status"}</span>
                <Badge variant={paymentStatusCopy.badge} data-testid="text-payment-status">
                  {paymentStatusCopy.label}
                </Badge>
              </div>
            </div>
          </Card>

          {order.shippingAddress && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-neutral-500" />
                <h3 className="font-sora font-semibold text-neutral-950" data-testid="text-shipping-title">
                  {t.account.orderDetail?.shippingTitle || "Shipping Address"}
                </h3>
              </div>
              <div className="space-y-1 text-small text-neutral-700" data-testid="text-shipping-address">
                <p className="font-semibold text-neutral-950">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                {order.shippingAddress.postalCode && <p>{order.shippingAddress.postalCode}</p>}
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.email}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
