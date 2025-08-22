import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy Policy" }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-center">
          <ul className="flex space-x-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md",
                    location.pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}