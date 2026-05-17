import { useEffect } from "react";
import { Switch, Route, useLocation, useRoute } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "@/context/WalletContext";
import { AuthProvider } from "@/context/AuthContext";
import { recordPageView, heartbeat } from "@/lib/analytics";
import { captureReferralFromUrl, setPendingReferral } from "@/lib/referral";
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
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Presale from "@/pages/presale";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Analytics() {
  const [location] = useLocation();
  useEffect(() => {
    recordPageView(location);
    // Pick up ?ref=username from anywhere on the site (homepage, presale, ...)
    captureReferralFromUrl();
    // Pick up ?verify=<token> from email verification links.
    try {
      const params = new URLSearchParams(window.location.search);
      const verifyToken = params.get("verify");
      if (verifyToken) {
        fetch(`/api/veloxfi/verify-email?token=${encodeURIComponent(verifyToken)}`)
          .then(r => r.json())
          .then((d) => {
            if (d?.ok) {
              alert(d.alreadyVerified ? "Email already verified." : "✓ Email verified! You can now convert WOLF to $BATTLE.");
              // Remove the verify token from the URL so it can't be replayed.
              const url = new URL(window.location.href);
              url.searchParams.delete("verify");
              window.history.replaceState({}, "", url.toString());
              // Force a soft reload so /veloxfi/me re-fetches the new flag.
              window.location.reload();
            } else {
              alert(d?.error ?? "Verification link is invalid or expired.");
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, [location]);
  useEffect(() => {
    const id = setInterval(() => heartbeat(location), 30_000);
    return () => clearInterval(id);
  }, [location]);
  return null;
}

// Short-link handler for veloxfi.io/r/<username> — stores the referrer in
// localStorage and bounces to /login (register tab).
function ReferralRedirect() {
  const [, params] = useRoute("/r/:code");
  const [, navigate] = useLocation();
  useEffect(() => {
    if (params?.code) setPendingReferral(params.code);
    navigate("/login");
  }, [params?.code, navigate]);
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
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/blog" component={Blog} />
        <Route path="/buy" component={Presale} />
        <Route path="/presale" component={Presale} />
        <Route path="/r/:code" component={ReferralRedirect} />
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
