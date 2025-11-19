import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProfessionalFooter } from "@/components/professional-footer";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import AccessCode from "@/pages/access-code";
import Dashboard from "@/pages/dashboard";
import Cards from "@/pages/cards";
import Transfers from "@/pages/transfers";
import Statements from "@/pages/statements";
import Settings from "@/pages/settings";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminTransactions from "@/pages/admin/transactions";
import AdminPendingTransactions from "@/pages/admin/pending-transactions";
import AdminAccessCodes from "@/pages/admin/access-codes";
import AdminLogin from "@/pages/admin/login";
import NotFound from "@/pages/not-found";
import BillPay from "@/pages/bill-pay";
import Business from "@/pages/business";
import Investment from "@/pages/investment";
import Loans from "@/pages/loans";
import CreditCards from "@/pages/credit-cards";
import Support from "@/pages/support";
import OpenAccount from "@/pages/open-account";
import TravelBanking from "@/pages/travel";
import backgroundImage from "@assets/banking-background.jpg";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { data: accounts, isLoading: accountsLoading } = useQuery<any[]>({
    queryKey: ["/api/accounts"],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/open-account" component={OpenAccount} />
        <Route path="/transfers" component={Transfers} />
        <Route path="/bill-pay" component={BillPay} />
        <Route path="/business" component={Business} />
        <Route path="/investment" component={Investment} />
        <Route path="/loans" component={Loans} />
        <Route path="/credit-cards" component={CreditCards} />
        <Route path="/support" component={Support} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // If authenticated, check if they have an account (requires access code verification)
  // If accounts are loading, show loading screen
  if (accountsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no accounts, redirect to access code verification (admins skip this check)
  if (!user?.isAdmin && (!accounts || accounts.length === 0)) {
    return (
      <Switch>
        <Route path="/access-code" component={AccessCode} />
        <Route component={AccessCode} />
      </Switch>
    );
  }

  // User is authenticated and has an account - show full app
  // Admins should see admin dashboard at root, regular users see user dashboard
  return (
    <Switch>
      <Route path="/" component={user?.isAdmin ? AdminDashboard : Dashboard} />
      <Route path="/cards" component={Cards} />
      <Route path="/transfers" component={Transfers} />
      <Route path="/statements" component={Statements} />
      <Route path="/settings" component={Settings} />
      <Route path="/travel" component={TravelBanking} />
      <Route path="/calculators" component={() => <div>Calculators - Coming Soon</div>} />
      <Route path="/business" component={() => <div>Business - Coming Soon</div>} />
      <Route path="/auto-loans" component={() => <div>Auto Loans - Coming Soon</div>} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/transactions" component={AdminTransactions} />
      <Route path="/admin/pending-transactions" component={AdminPendingTransactions} />
      <Route path="/admin/access-codes" component={AdminAccessCodes} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <TooltipProvider>
      {!isLoading && isAuthenticated ? (
        <SidebarProvider style={style as React.CSSProperties}>
          <div 
            className="flex h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed"
            style={{ 
              backgroundImage: `url(${backgroundImage})`,
              backgroundColor: '#f8fafc'
            }}
          >
            <AppSidebar user={user} />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between gap-4 p-4 border-b bg-background/90 backdrop-blur-md">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
              </header>
              <main className="flex-1 overflow-y-auto">
                <div className="p-4 md:p-6 lg:p-8">
                  <div className="mx-auto max-w-7xl">
                    <Router />
                  </div>
                </div>
                <ProfessionalFooter />
              </main>
            </div>
          </div>
        </SidebarProvider>
      ) : (
        <Router />
      )}
      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
