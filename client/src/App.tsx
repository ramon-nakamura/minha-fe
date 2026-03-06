import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import LandingPage from "@/pages/LandingPage";
import Profile from "@/pages/Profile";
import AccountPage from "@/pages/AccountPage";
import Admin from "@/pages/Admin";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import { CookieBanner } from "@/components/CookieBanner";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Preparando o altar...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/account" component={() => <ProtectedRoute component={AccountPage} />} />
      <Route path="/admin" component={() => <ProtectedRoute component={Admin} />} />
      <Route path="/termos" component={() => <ProtectedRoute component={Terms} />} />
      <Route path="/privacidade" component={() => <ProtectedRoute component={Privacy} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <CookieBanner />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
