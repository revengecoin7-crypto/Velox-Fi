import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "@/context/WalletContext";
import { AuthProvider } from "@/context/AuthContext";
import { recordPageView, heartbeat } from "@/lib/analytics";
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
import Games from "@/pages/games";
import GameSnake from "@/pages/game-snake";
import GameTetris from "@/pages/game-tetris";
import GameRunner from "@/pages/game-runner";
import GameRocket from "@/pages/game-rocket";
import GamePump from "@/pages/game-pump";
import GameHowl from "@/pages/game-howl";
import Mine from "@/pages/mine";
import Convert from "@/pages/convert";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Analytics() {
  const [location] = useLocation();
  useEffect(() => {
    recordPageView(location);
  }, [location]);
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
      <Route path="/games" component={Games} />
      <Route path="/games/snake" component={GameSnake} />
      <Route path="/games/tetris" component={GameTetris} />
      <Route path="/games/runner" component={GameRunner} />
      <Route path="/games/rocket" component={GameRocket} />
      <Route path="/games/pump" component={GamePump} />
      <Route path="/games/howl" component={GameHowl} />
      <Route path="/mine" component={Mine} />
      <Route path="/convert" component={Convert} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={Profile} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
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
