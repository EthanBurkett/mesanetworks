export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  MN
                </span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mesa Networks
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional network infrastructure solutions for businesses
              across Texas.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#services"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Structured Cabling
                </a>
              </li>
              <li>
                <a
                  href="/#services"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Wireless Networks
                </a>
              </li>
              <li>
                <a
                  href="/#services"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Security Cameras
                </a>
              </li>
              <li>
                <a
                  href="/#services"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Network Equipment
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/portfolio"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Our Work
                </a>
              </li>
              <li>
                <a
                  href="/careers"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="/consultation"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:info@mesanet.works"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  info@mesanet.works
                </a>
              </li>
              <li>
                <a
                  href="tel:+15127864561"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  (512) 786-4561
                </a>
              </li>
              <li className="text-muted-foreground">Austin, Texas</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {currentYear} Mesa Networks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
