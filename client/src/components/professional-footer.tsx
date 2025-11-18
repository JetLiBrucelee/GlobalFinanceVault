import { Facebook, Twitter, Youtube, Linkedin, Instagram } from "lucide-react";
import { useLocation } from "wouter";

export function ProfessionalFooter() {
  const [, setLocation] = useLocation();
  
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4 text-sm">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-complaints">Complaints and compliments</button></li>
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-contact">Contact us</button></li>
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-careers">Careers</button></li>
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-help">Help Centre</button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm">About</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-inclusion">Access and Inclusion</button></li>
              <li><button onClick={() => setLocation("/investment")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-investor">Investor centre</button></li>
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-about">About Our Group</button></li>
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-sustainability">Sustainability</button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm">Security & Privacy</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-security">Security</button></li>
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-faqs">FAQs</button></li>
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-privacy">Privacy</button></li>
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-fraud">Fraud Protection</button></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-web-terms">Website terms and conditions</button></li>
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-terms">Terms and conditions</button></li>
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-sitemap">Site index</button></li>
              <li><button onClick={() => setLocation("/support")} className="hover:text-foreground transition-colors text-left" data-testid="footer-link-accessibility">Accessibility</button></li>
            </ul>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-6">
          <a href="#" className="h-10 w-10 rounded bg-[#1877f2] hover:opacity-90 transition-opacity flex items-center justify-center text-white" data-testid="footer-social-facebook">
            <Facebook className="h-5 w-5" />
          </a>
          <a href="#" className="h-10 w-10 rounded bg-black hover:opacity-90 transition-opacity flex items-center justify-center text-white" data-testid="footer-social-twitter">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="#" className="h-10 w-10 rounded bg-[#ff0000] hover:opacity-90 transition-opacity flex items-center justify-center text-white" data-testid="footer-social-youtube">
            <Youtube className="h-5 w-5" />
          </a>
          <a href="#" className="h-10 w-10 rounded bg-[#0a66c2] hover:opacity-90 transition-opacity flex items-center justify-center text-white" data-testid="footer-social-linkedin">
            <Linkedin className="h-5 w-5" />
          </a>
          <a href="#" className="h-10 w-10 rounded bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 transition-opacity flex items-center justify-center text-white" data-testid="footer-social-instagram">
            <Instagram className="h-5 w-5" />
          </a>
        </div>
        
        <div className="text-xs text-muted-foreground leading-relaxed mb-6 max-w-5xl">
          <p className="mb-3">
            For Fundamental Financial Credit-issued products, conditions, fees and charges apply. These may change or we may introduce new ones in the future. Full details are available on request. Lending criteria apply to approved credit products. This information does not take your personal objectives, circumstances or needs into account. Consider its appropriateness to these factors before acting on it. Read the disclosure documents for your selected product or service, including the Terms and Conditions, before deciding. Target Market Determinations for the products and services described on this website are available only in Australia from Fundamental Financial Credit Corporation ABN 33 007 457 141 AFSL and Australian credit licence 233714.
          </p>
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div 
          className="h-32 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 relative"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              hsl(var(--primary) / 0.4),
              hsl(var(--primary) / 0.4) 20px,
              hsl(var(--primary) / 0.6) 20px,
              hsl(var(--primary) / 0.6) 40px,
              hsl(var(--primary) / 0.5) 40px,
              hsl(var(--primary) / 0.5) 60px,
              hsl(var(--primary) / 0.7) 60px,
              hsl(var(--primary) / 0.7) 80px
            )`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-500/20" />
          <div className="container mx-auto px-4 md:px-6 lg:px-8 h-full flex items-center justify-center">
            <div className="bg-white/95 dark:bg-background/95 backdrop-blur-sm px-8 py-4 rounded-lg shadow-lg">
              <p className="text-xs text-center text-foreground/80 max-w-4xl">
                Fundamental Financial Credit acknowledges the Traditional Owners as the custodians of this land, recognising their connection to land, waters and community. We pay our respects to all peoples and their Elders past and present.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-muted/30 py-3">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <p className="text-xs text-center text-muted-foreground">
            © 2024 Fundamental Financial Credit. All rights reserved. | Serving customers in Australia, USA, and New Zealand
          </p>
        </div>
      </div>
    </footer>
  );
}
