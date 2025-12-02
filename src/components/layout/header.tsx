import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">MN</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mesa Networks
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#services"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Services
            </a>
            <a
              href="#why-us"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Why Us
            </a>
            <a
              href="#projects"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Projects
            </a>
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              Get Quote
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
