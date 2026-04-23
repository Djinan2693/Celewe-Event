import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";

const NotFound    = lazy(() => import("@/pages/not-found"));
const Home        = lazy(() => import("@/pages/Home").then(m => ({ default: m.Home })));
const Events      = lazy(() => import("@/pages/Events").then(m => ({ default: m.Events })));
const EventDetail = lazy(() => import("@/pages/EventDetail").then(m => ({ default: m.EventDetail })));
const Gallery     = lazy(() => import("@/pages/Gallery").then(m => ({ default: m.Gallery })));
const About       = lazy(() => import("@/pages/About").then(m => ({ default: m.About })));
const Contact     = lazy(() => import("@/pages/Contact").then(m => ({ default: m.Contact })));
const Privacy     = lazy(() => import("@/pages/Privacy").then(m => ({ default: m.Privacy })));
const Terms       = lazy(() => import("@/pages/Terms").then(m => ({ default: m.Terms })));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess").then(m => ({ default: m.PaymentSuccess })));
const ScanPage    = lazy(() => import("@/pages/Scan").then(m => ({ default: m.ScanPage })));
const AdminPage   = lazy(() => import("@/pages/Admin").then(m => ({ default: m.AdminPage })));
const ServerError = lazy(() => import("@/pages/ServerError").then(m => ({ default: m.ServerError })));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/"                component={Home} />
          <Route path="/events"          component={Events} />
          <Route path="/events/:slug"    component={EventDetail} />
          <Route path="/gallery"         component={Gallery} />
          <Route path="/about"           component={About} />
          <Route path="/contact"         component={Contact} />
          <Route path="/payment/success" component={PaymentSuccess} />
          <Route path="/scan"            component={ScanPage} />
          <Route path="/admin/tickets"   component={AdminPage} />
          <Route path="/privacy"         component={Privacy} />
          <Route path="/terms"           component={Terms} />
          <Route path="/500"             component={ServerError} />
          <Route                         component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
