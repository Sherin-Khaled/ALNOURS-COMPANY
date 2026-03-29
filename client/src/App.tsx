import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NotFound from "@/pages/not-found";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Brands from "@/pages/Brands";
import Cart from "@/pages/Cart";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AccountLayout from "@/pages/account/AccountLayout";
import AccountOverview from "@/pages/account/AccountOverview";
import Profile from "@/pages/account/Profile";
import Orders from "@/pages/account/Orders";
import OrderDetail from "@/pages/account/OrderDetail";
import Addresses from "@/pages/account/Addresses";
import {
  About,
  Contact,
  PrivacyPolicy,
  TermsConditions,
  RefundReturnPolicy,
  ShippingDeliveryPolicy,
} from "@/pages/StaticPages";
import Checkout from "@/pages/Checkout";
import CheckoutPaymentReturn from "@/pages/CheckoutPaymentReturn";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const isAuthPage = location === "/login" || location === "/signup" || location === "/forgot-password" || location.startsWith("/reset-password");

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Navbar />}
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:slug" component={ProductDetail} />
          <Route path="/brands" component={Brands} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-and-conditions" component={TermsConditions} />
          <Route path="/refund-return-policy" component={RefundReturnPolicy} />
          <Route path="/shipping-delivery-policy" component={ShippingDeliveryPolicy} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout/payment-return" component={CheckoutPaymentReturn} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/account">
            <AccountLayout><AccountOverview /></AccountLayout>
          </Route>
          <Route path="/account/profile">
            <AccountLayout><Profile /></AccountLayout>
          </Route>
          <Route path="/account/orders">
            <AccountLayout><Orders /></AccountLayout>
          </Route>
          <Route path="/account/orders/:id">
            <AccountLayout><OrderDetail /></AccountLayout>
          </Route>
          <Route path="/account/addresses">
            <AccountLayout><Addresses /></AccountLayout>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Router />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
