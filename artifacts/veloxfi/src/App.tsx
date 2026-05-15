import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "@/context/WalletContext";
import { AuthProvider } from "@/context/AuthContext";
import { recordPageView, heartbeat } from "@/lib/analytics";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import Leaderboard from "@/pages/leaderboard";
import Whitepaper from "@/pages/whitepaper";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import FAQ from "@/pages/faq";
import Roadmap from "@/pages/roadmap";
import Mine from "@/pages/mine";
import Daily from "@/pages/daily";
import Pet from "@/pages/pet";
import Factions from "@/pages/factions";
import Convert from "@/pages/convert";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Analytics() {
  const [location] = useLocation();
  useEffect(() => { recordPageView(location); }, [location]);
  useEffect(() => {
    const id = setInterval(() => heartbeat(location), 30_000);
    return () => clearInterval(id);
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <Analytics />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/mine" component={Mine} />
        <Route path="/daily" component={Daily} />
        <Route path="/pet" component={Pet} />
        <Route path="/factions" component={Factions} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/profile" component={Profile} />
        <Route path="/convert" component={Convert} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/admin" component={Admin} />
        <Route path="/whitepaper" component={Whitepaper} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/faq" component={FAQ} />
        <Route path="/roadmap" component={Roadmap} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WalletProvider>
          <Router />
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
