import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Globe, Lock, TrendingUp, Smartphone, Award, Users, DollarSign, Star, Check, Search, CreditCard, PiggyBank, Home, Car, Plane, Building2, Calculator, UserCheck } from "lucide-react";
import { ProfessionalFooter } from "@/components/professional-footer";
import { useLocation } from "wouter";
import bankLogo from "@assets/bank-logo.jpg";
import bgPattern from "@assets/banking-background.jpg";

export default function Landing() {
  const [, setLocation] = useLocation();
  
  const productCategories = [
    { icon: CreditCard, label: "Credit Cards", href: "/cards" },
    { icon: PiggyBank, label: "Savings", href: "/savings" },
    { icon: Home, label: "Home Loans", href: "/home-loans" },
    { icon: Car, label: "Auto Loans", href: "/auto-loans" },
    { icon: Plane, label: "Travel", href: "/travel" },
    { icon: TrendingUp, label: "Investments", href: "/investments" },
    { icon: Building2, label: "Business", href: "/business" },
    { icon: Calculator, label: "Calculators", href: "/calculators" },
  ];
  
  const navLinks = [
    { label: "Transfers", href: "/transfers" },
    { label: "Bill Pay", href: "/bill-pay" },
    { label: "Business", href: "/business" },
    { label: "Investment", href: "/investment" },
    { label: "Loans", href: "/loans" },
    { label: "Credit Cards", href: "/credit-cards" },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background wallpaper */}
      <div 
        className="fixed inset-0 z-0" 
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.85)), url(${bgPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Overlay pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03]" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59 130 246) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="relative z-10">{/* Content wrapper */}
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <img src={bankLogo} alt="Fundamental Financial Credit" className="h-10 w-10 object-contain" data-testid="logo-icon" />
              <span className="text-xl font-bold hidden lg:block" data-testid="text-brand-name">Fundamental Financial Credit</span>
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation(link.href)}
                  className="text-sm"
                >
                  {link.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="text-sm"
              >
                <Search className="h-4 w-4" />
              </Button>
            </nav>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/login')}
                data-testid="button-login"
              >
                Log In
              </Button>
              <Button
                onClick={() => setLocation('/open-account')}
                data-testid="button-get-started"
              >
                Open Account
              </Button>
            </div>          </div>
        </div>
      </header>

      {/* Hero Section with Premium Background */}
      <section className="relative py-12 md:py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-500/5 to-blue-600/5" />
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(to right, rgb(59 130 246 / 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgb(59 130 246 / 0.03) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
        <div className="container relative mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 text-xs md:text-sm" data-testid="badge-promo">
              <DollarSign className="h-3 w-3 mr-1" />
              Earn $300 bonus with new checking account
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl xl:text-6xl" data-testid="text-hero-title">
              Banking Made Simple,
              <span className="block text-primary mt-2">Secure, & Global</span>
            </h1>
            <p className="mt-4 md:mt-6 text-sm md:text-base lg:text-lg text-muted-foreground px-4" data-testid="text-hero-description">
              Experience modern banking across Australia, USA, and New Zealand. 
              Manage your money with confidence, security, and ease.
            </p>
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4">
              <Button
                size="lg"
                className="text-sm md:text-base px-6 md:px-8 w-full sm:w-auto"
                onClick={() => setLocation('/open-account')}
                data-testid="button-hero-open-account"
              >
                Open Your Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-sm md:text-base px-6 md:px-8 w-full sm:w-auto"
                onClick={() => setLocation('/login')}
                data-testid="button-hero-login"
              >
                Log In
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-4 md:gap-8 text-xs md:text-sm text-muted-foreground px-4">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                <span className="whitespace-nowrap">Bank-grade security</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                <span className="whitespace-nowrap">Award-winning service</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                <span className="whitespace-nowrap">Trusted by millions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Carousel */}
      <section className="py-8 md:py-12 border-y bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-3 md:px-6 lg:px-8">
          <h2 className="text-center text-xs md:text-sm font-semibold text-muted-foreground mb-4 md:mb-6">EXPLORE OUR PRODUCTS</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
            {productCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => setLocation(category.href)}
                className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-lg hover-elevate transition-all group"
                data-testid={`category-${category.label.toLowerCase().replace(' ', '-')}`}
              >
                <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <category.icon className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <span className="text-xs md:text-sm font-medium text-center leading-tight">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Offers */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-background to-blue-50/30 dark:to-blue-950/10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="overflow-hidden border-2 hover-elevate" data-testid="promo-checking">
              <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600" />
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-3">Limited Time Offer</Badge>
                <h3 className="text-2xl font-bold mb-2">Earn $300 Bonus</h3>
                <p className="text-muted-foreground mb-4">
                  Open a new checking account and complete qualifying activities to earn your bonus.
                </p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span>$0 monthly fee</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span>Instant debit card</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span>24/7 mobile banking</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={() => setLocation('/open-account')} data-testid="promo-checking-cta">
                  Open Account
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-2 hover-elevate" data-testid="promo-savings">
              <div className="h-2 bg-gradient-to-r from-green-600 to-emerald-600" />
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-3">High Yield</Badge>
                <h3 className="text-2xl font-bold mb-2">4.50% APY Savings</h3>
                <p className="text-muted-foreground mb-4">
                  Earn competitive rates on your savings with no minimum balance requirements.
                </p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span>No monthly fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span>FDIC insured</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span>Easy transfers</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" onClick={() => setLocation('/open-account')} data-testid="promo-savings-cta">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-2 hover-elevate" data-testid="promo-credit">
              <div className="h-2 bg-gradient-to-r from-purple-600 to-pink-600" />
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-3">Rewards</Badge>
                <h3 className="text-2xl font-bold mb-2">Earn 3% Cash Back</h3>
                <p className="text-muted-foreground mb-4">
                  Get rewarded on every purchase with our premium credit cards and travel benefits.
                </p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span>No annual fee</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span>Travel insurance included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5" />
                    <span>Instant approval</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" onClick={() => setLocation('/open-account')} data-testid="promo-credit-cta">
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Trust Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto mb-8 md:mb-12 max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold">Big on Security & Trust</h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground">
              Your money and personal information are protected with industry-leading security
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 grid-cols-2 lg:grid-cols-4">
            <div className="text-center" data-testid="trust-security">
              <div className="mx-auto mb-3 md:mb-4 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              </div>
              <h3 className="text-sm md:text-base font-semibold mb-2">24/7 Fraud Monitoring</h3>
              <p className="text-xs md:text-sm text-muted-foreground px-2">
                Advanced AI monitors your account around the clock for suspicious activity
              </p>
            </div>

            <div className="text-center" data-testid="trust-encryption">
              <div className="mx-auto mb-3 md:mb-4 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              </div>
              <h3 className="text-sm md:text-base font-semibold mb-2">256-bit Encryption</h3>
              <p className="text-xs md:text-sm text-muted-foreground px-2">
                Military-grade encryption protects all your transactions and data
              </p>
            </div>

            <div className="text-center" data-testid="trust-insurance">
              <div className="mx-auto mb-3 md:mb-4 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              </div>
              <h3 className="text-sm md:text-base font-semibold mb-2">FDIC Insured</h3>
              <p className="text-xs md:text-sm text-muted-foreground px-2">
                Your deposits are insured up to $250,000 by federal regulators
              </p>
            </div>

            <div className="text-center" data-testid="trust-support">
              <div className="mx-auto mb-3 md:mb-4 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-primary/10">
                <UserCheck className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              </div>
              <h3 className="text-sm md:text-base font-semibold mb-2">Expert Support</h3>
              <p className="text-xs md:text-sm text-muted-foreground px-2">
                Real people available 24/7 to help with any questions or concerns
              </p>
            </div>
          </div>

          {/* Security Alert */}
          <Card className="mt-12 border-l-4 border-l-destructive bg-destructive/5" data-testid="security-alert">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Shield className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Stay Alert: Phishing Scams Are Widespread</h3>
                  <p className="text-sm text-muted-foreground">
                    Be cautious - do not click on links you receive through suspicious SMS or emails. 
                    We'll never ask you for your PIN, password, or access to your device or internet banking. 
                    <strong className="text-foreground"> Stop. Think. Protect.</strong>
                  </p>
                  <Button variant="ghost" className="px-0 mt-2 h-auto" onClick={() => window.location.href = '#security'} data-testid="security-alert-cta">
                    View latest scam alerts →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Customer Testimonial */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-blue-50/30 to-background dark:from-blue-950/10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <Card className="max-w-4xl mx-auto border-2" data-testid="testimonial-card">
            <CardContent className="p-8 md:p-12">
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl font-medium mb-6">
                "Switching to Fundamental Financial Credit was the best financial decision we made. 
                We're saving $5,329 this year on our home loan, and the customer service is outstanding."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">The Williams Family</p>
                  <p className="text-sm text-muted-foreground">Home Loan Customers Since 2023</p>
                </div>
              </div>
              <Button className="mt-6" onClick={() => setLocation('/open-account')} data-testid="testimonial-cta">
                Start Saving Today
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto mb-8 md:mb-12 max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-features-title">Why Choose Fundamental Financial Credit?</h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground" data-testid="text-features-description">
              Everything you need for modern banking in one secure platform
            </p>
          </div>

          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card data-testid="card-feature-global">
              <CardContent className="p-5 md:p-6">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">Global Banking</h3>
                <p className="mt-2 text-xs md:text-sm text-muted-foreground">
                  Operate seamlessly across Australia, USA, and New Zealand with local account details
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-cards">
              <CardContent className="p-5 md:p-6">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">Instant Virtual Cards</h3>
                <p className="mt-2 text-xs md:text-sm text-muted-foreground">
                  Get debit and credit cards instantly with your account. Manage, freeze, or replace anytime
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-secure">
              <CardContent className="p-5 md:p-6">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">Bank-Grade Security</h3>
                <p className="mt-2 text-xs md:text-sm text-muted-foreground">
                  Multi-layer security with access codes, encryption, and real-time fraud monitoring
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-transfers">
              <CardContent className="p-5 md:p-6">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">Instant Transfers</h3>
                <p className="mt-2 text-xs md:text-sm text-muted-foreground">
                  Send money instantly with transfers, PayID, and bill payments available 24/7
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-mobile">
              <CardContent className="p-5 md:p-6">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Smartphone className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">Mobile First</h3>
                <p className="mt-2 text-xs md:text-sm text-muted-foreground">
                  Full-featured banking on any device. Responsive design works perfectly everywhere
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-support">
              <CardContent className="p-5 md:p-6">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-bold">Protected Accounts</h3>
                <p className="mt-2 text-xs md:text-sm text-muted-foreground">
                  Your deposits are protected with comprehensive insurance and regulatory compliance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tools & Calculators Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-background to-blue-50/20 dark:to-blue-950/10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto mb-8 md:mb-12 max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold">Financial Tools & Calculators</h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground">
              Make informed decisions with our free financial planning tools
            </p>
          </div>

          <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
            <Card 
              className="hover-elevate cursor-pointer" 
              data-testid="tool-mortgage"
              onClick={() => setLocation('/calculators')}
            >
              <CardContent className="p-4 md:p-6 text-center">
                <div className="h-12 w-12 md:h-14 md:w-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Home className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                </div>
                <h3 className="text-sm md:text-base font-semibold mb-2">Mortgage Calculator</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Estimate your monthly payments
                </p>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer" 
              data-testid="tool-savings"
              onClick={() => setLocation('/calculators')}
            >
              <CardContent className="p-4 md:p-6 text-center">
                <div className="h-12 w-12 md:h-14 md:w-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <PiggyBank className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                </div>
                <h3 className="text-sm md:text-base font-semibold mb-2">Savings Calculator</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Plan your savings goals
                </p>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer" 
              data-testid="tool-loan"
              onClick={() => setLocation('/calculators')}
            >
              <CardContent className="p-4 md:p-6 text-center">
                <div className="h-12 w-12 md:h-14 md:w-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                </div>
                <h3 className="text-sm md:text-base font-semibold mb-2">Loan Calculator</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Calculate loan payments
                </p>
              </CardContent>
            </Card>

            <Card 
              className="hover-elevate cursor-pointer" 
              data-testid="tool-investment"
              onClick={() => setLocation('/calculators')}
            >
              <CardContent className="p-4 md:p-6 text-center">
                <div className="h-12 w-12 md:h-14 md:w-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                </div>
                <h3 className="text-sm md:text-base font-semibold mb-2">Investment Calculator</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Project investment growth
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground" data-testid="card-cta">
            <CardContent className="p-8 md:p-12">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold" data-testid="text-cta-title">Ready to Get Started?</h2>
                <p className="mt-4 text-primary-foreground/90" data-testid="text-cta-description">
                  Open your account in minutes and start banking the modern way
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  className="mt-8"
                  onClick={() => setLocation('/open-account')}
                  data-testid="button-cta-open-account"
                >
                  Open Your Account Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <ProfessionalFooter />
      </div>{/* End content wrapper */}
    </div>
  );
}
