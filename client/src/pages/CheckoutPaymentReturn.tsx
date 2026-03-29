import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { verifyBackendMoyasarPaymentOnce } from "@/lib/moyasar";
import { clearCardCheckoutDraft, clearCardCheckoutFlash, saveCardCheckoutFlash } from "@/lib/card-checkout-draft";
import { queryClient } from "@/lib/queryClient";
import { api } from "@shared/routes";
import { useCart } from "@/store/use-cart";
import { Loader2 } from "lucide-react";

type VerificationState = {
  description: string;
  orderId?: number;
  paymentStatus?: string;
  status: "error" | "loading" | "success";
  title: string;
};

function getPaymentStatusText(paymentStatus?: string) {
  switch (paymentStatus) {
    case "paid":
      return {
        title: "Payment confirmed",
        description: "Your card payment was verified successfully and your order has been created.",
      };
    case "pending":
      return {
        title: "Payment pending",
        description: "Your payment is still pending confirmation. Your order will only be created after payment is confirmed.",
      };
    case "failed":
      return {
        title: "Payment failed",
        description: "Your payment did not complete. No order was created, and you can try again from checkout.",
      };
    default:
      return {
        title: "Payment update received",
        description: "The latest payment status was recorded on your order.",
      };
  }
}

export default function CheckoutPaymentReturn() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const paymentId = searchParams.get("id")?.trim() || "";
  const rawCheckoutSessionId = searchParams.get("checkoutSessionId")?.trim() || "";
  const rawOrderId = searchParams.get("orderId")?.trim() || "";
  const fallbackMessage = searchParams.get("message")?.trim() || "";
  const parsedCheckoutSessionId = Number.parseInt(rawCheckoutSessionId, 10);
  const parsedOrderId = Number.parseInt(rawOrderId, 10);
  const [state, setState] = useState<VerificationState>({
    status: "loading",
    title: "Verifying payment",
    description: "Please wait while we confirm the payment status with Moyasar.",
  });
  const isVerifying = state.status === "loading";

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      if (!paymentId) {
        setState({
          status: "error",
          title: "Missing payment reference",
          description: "No Moyasar payment ID was found in the callback URL.",
          orderId: Number.isFinite(parsedOrderId) ? parsedOrderId : undefined,
        });
        return;
      }

      try {
        const result = await verifyBackendMoyasarPaymentOnce({
          checkoutSessionId: Number.isFinite(parsedCheckoutSessionId) ? parsedCheckoutSessionId : undefined,
          orderId: Number.isFinite(parsedOrderId) ? parsedOrderId : undefined,
          paymentId,
        });

        if (cancelled) {
          return;
        }

        const copy = getPaymentStatusText(result.paymentStatus);

        if (result.paymentStatus === "failed") {
          saveCardCheckoutFlash({
            status: "failed",
            message: fallbackMessage || copy.description,
          });
          setState({
            status: "success",
            title: copy.title,
            description: "Returning you to checkout so you can try the payment again.",
          });
          toast({
            title: copy.title,
            description: fallbackMessage || copy.description,
            variant: "destructive",
          });
          window.setTimeout(() => setLocation("/checkout"), 1200);
          return;
        }

        if (result.paymentStatus === "paid") {
          clearCardCheckoutDraft();
          clearCardCheckoutFlash();
          clearCart();
        }

        setState({
          status: "success",
          title: copy.title,
          description: fallbackMessage || copy.description,
          orderId: result.orderId || undefined,
          paymentStatus: result.paymentStatus,
        });

        queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
        if (result.orderId) {
          queryClient.invalidateQueries({ queryKey: [api.orders.list.path, String(result.orderId)] });
        }

        toast({
          title: copy.title,
          description: fallbackMessage || copy.description,
          variant: "default",
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "We could not verify the payment result.";
        setState({
          status: "error",
          title: "Payment verification failed",
          description: message,
          orderId: Number.isFinite(parsedOrderId) ? parsedOrderId : undefined,
        });
      }
    }

    void verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [clearCart, fallbackMessage, parsedCheckoutSessionId, parsedOrderId, paymentId, setLocation, toast]);

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <SEO title="Payment Result" description="Moyasar payment verification result" />
      <div className="container-custom max-w-2xl">
        <Card className="p-8 border border-neutral-200">
          <h1 className="font-sora text-h3 text-neutral-950 mb-3">{state.title}</h1>
          <p className="text-body text-neutral-600 mb-6">{state.description}</p>

          {isVerifying && (
            <div
              aria-live="polite"
              className="mb-6 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-small text-neutral-700"
            >
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Payment verification is still running. Please stay on this page.</span>
            </div>
          )}

          {state.paymentStatus && (
            <p className="text-small text-neutral-500 mb-6">
              Current payment status: <span className="font-semibold text-neutral-950">{state.paymentStatus}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {state.orderId && (
              <Button onClick={() => setLocation(`/account/orders/${state.orderId}`)}>
                View Order
              </Button>
            )}
            <Button
              aria-busy={isVerifying}
              data-testid="button-payment-return-back"
              disabled={isVerifying}
              variant="outline"
              onClick={() => {
                if (isVerifying) {
                  return;
                }

                setLocation(state.orderId ? "/account/orders" : "/checkout");
              }}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying payment
                </>
              ) : state.orderId ? "Back to Orders" : "Back to Checkout"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
