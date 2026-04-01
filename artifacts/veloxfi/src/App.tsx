import { useSyncExternalStore, useCallback } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/home";
import Demo from "@/pages/demo";
import Presale from "@/pages/presale";
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
      <Route path="/demo" component={Demo} />
      <Route path="/presale" component={Presale} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter hook={useHashLocation}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
