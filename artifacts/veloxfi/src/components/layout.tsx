import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CreditCard, 
  Receipt, 
  PieChart, 
  Target, 
  Moon, 
  Sun
} from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/accounts", label: "Accounts", icon: CreditCard },
    { href: "/transactions", label: "Transactions", icon: Receipt },
    { href: "/budgets", label: "Budgets", icon: PieChart },
    { href: "/goals", label: "Goals", icon: Target },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-sidebar hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 font-bold text-2xl text-primary font-mono tracking-tighter">
            <span className="w-8 h-8 rounded-sm bg-primary text-primary-foreground flex items-center justify-center text-lg">
              V
            </span>
            VELOXFI
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="button-toggle-theme"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 mr-2" /> Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 mr-2" /> Dark Mode
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden border-b p-4 flex items-center justify-between bg-card">
          <div className="font-bold text-xl text-primary font-mono">VELOXFI</div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
