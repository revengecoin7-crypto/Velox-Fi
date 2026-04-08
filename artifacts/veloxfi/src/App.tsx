import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "@/context/WalletContext";
import Home from "@/pages/home";
import Demo from "@/pages/demo";
import Presale from "@/pages/presale";
import Admin from "@/pages/admin";
import Battles from "@/pages/battles";
import Leaderboard from "@/pages/leaderboard";
import Create from "@/pages/create";
import Whitepaper from "@/pages/whitepaper";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import FAQ from "@/pages/faq";
import Roadmap from "@/pages/roadmap";
import Game from "@/pages/game";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/battles" component={Battles} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/create" component={Create} />
      <Route path="/whitepaper" component={Whitepaper} />
      <Route path="/demo" component={Demo} />
      <Route path="/presale" component={Presale} />
      <Route path="/admin" component={Admin} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/faq" component={FAQ} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/game" component={Game} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    /* Assign a persistent UUID to this browser if it doesn't have one yet,
       then tell the server — server deduplicates via the UUID primary key. */
    let vid = localStorage.getItem("vfx_visitor_id");
    if (!vid) {
      vid = crypto.randomUUID();
      localStorage.setItem("vfx_visitor_id", vid);
    }
    fetch("/api/stats/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: vid }),
    }).catch(() => { /* non-critical, ignore */ });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <Router />
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
