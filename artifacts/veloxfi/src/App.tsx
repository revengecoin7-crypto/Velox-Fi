import { useSyncExternalStore, useCallback, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
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
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

/* ── Hash-based location hook (no external sub-package) ── */
function subscribeHashChange(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}
function getHashSnapshot() {
  const h = window.location.hash;
  return h ? h.slice(1) : "/";
}

function useHashLocation(): [string, (to: string) => void] {
  const path = useSyncExternalStore(
    subscribeHashChange,
    getHashSnapshot,
    () => "/",
  );
  const navigate = useCallback((to: string) => {
    window.location.hash = to;
    window.scrollTo(0, 0);
  }, []);
  return [path, navigate];
}

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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    /* Only count this browser as a visitor once, ever.
       localStorage persists across refreshes and sessions — unlike
       sessionStorage which can reset in embedded/iframe contexts. */
    if (localStorage.getItem("vfx_visitor_id")) return;
    localStorage.setItem("vfx_visitor_id", crypto.randomUUID());
    const prev = parseInt(localStorage.getItem("vfx_visitors") ?? "0", 10) || 0;
    localStorage.setItem("vfx_visitors", String(prev + 1));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <WouterRouter hook={useHashLocation}>
          <Router />
        </WouterRouter>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
