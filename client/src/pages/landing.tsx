import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CreditCard, Globe, TrendingUp, Smartphone, Lock, DollarSign, Calculator, PiggyBank, Home, Car, Plane, Building2, Award, Users, Star, Check } from "lucide-react";
import { ProfessionalFooter } from "@/components/professional-footer";

export default function Landing() {
  const productCategories = [
    { icon: CreditCard, label: "Credit Cards", href: "#cards" },
    { icon: PiggyBank, label: "Savings", href: "#savings" },
    { icon: Home, label: "Home Loans", href: "#home-loans" },
    { icon: Car, label: "Auto Loans", href: "#auto" },
    { icon: Plane, label: "Travel", href: "#travel" },
    { icon: TrendingUp, label: "Investments", href: "#investments" },
    { icon: Building2, label: "Business", href: "#business" },
    { icon: Calculator, label: "Calculators", href: "#tools" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" data-testid="logo-icon" />
              <span className="text-xl font-bold" data-testid="text-brand-name">The Peoples Finance</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                Log In
              </Button>
              <Button
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-get-started"
              >
                Open Account
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Premium Background */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-500/5 to-blue-600/5" />
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(to right, rgb(59 130 246 / 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgb(59 130 246 / 0.03) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
        <div className="container relative mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4" data-testid="badge-promo">
              <DollarSign className="h-3 w-3 mr-1" />
              Earn $300 bonus with new checking account
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl" data-testid="text-hero-title">
              Banking Made Simple,
              <span className="block text-primary mt-2">Secure, & Global</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground" data-testid="text-hero-description">
              Experience modern banking across Australia, USA, and New Zealand. 
              Manage your money with confidence, security, and ease.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="text-base px-8"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-hero-open-account"
              >
                Open Your Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-hero-login"
              >
                Log In
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Bank-grade security
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Award-winning service
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Trusted by millions
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Carousel */}
      <section className="py-12 border-y bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-center text-sm font-semibold text-muted-foreground mb-6">EXPLORE OUR PRODUCTS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {productCategories.map((category, index) => (
              <a
                key={index}
                href={category.href}
                className="flex flex-col items-center gap-3 p-4 rounded-lg hover-elevate transition-all group"
                data-testid={`category-${category.label.toLowerCase().replace(' ', '-')}`}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-center">{category.label}</span>
              </a>
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
                <Button className="w-full" onClick={() => window.location.href = '/api/login'} data-testid="promo-checking-cta">
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
                <Button className="w-full" variant="outline" onClick={() => window.location.href = '/api/login'} data-testid="promo-savings-cta">
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
                <Button className="w-full" variant="outline" onClick={() => window.location.href = '/api/login'} data-testid="promo-credit-cta">
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security & Trust Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Big on Security & Trust</h2>
            <p className="mt-4 text-muted-foreground">
              Your money and personal information are protected with industry-leading security
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center" data-testid="trust-security">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">24/7 Fraud Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI monitors your account around the clock for suspicious activity
              </p>
            </div>

            <div className="text-center" data-testid="trust-encryption">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">256-bit Encryption</h3>
              <p className="text-sm text-muted-foreground">
                Military-grade encryption protects all your transactions and data
              </p>
            </div>

            <div className="text-center" data-testid="trust-insurance">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">FDIC Insured</h3>
              <p className="text-sm text-muted-foreground">
                Your deposits are insured up to $250,000 by federal regulators
              </p>
            </div>

            <div className="text-center" data-testid="trust-support">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Expert Support</h3>
              <p className="text-sm text-muted-foreground">
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
                "Switching to The Peoples Finance was the best financial decision we made. 
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
              <Button className="mt-6" onClick={() => window.location.href = '/api/login'} data-testid="testimonial-cta">
                Start Saving Today
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold" data-testid="text-features-title">Why Choose The Peoples Finance?</h2>
            <p className="mt-4 text-muted-foreground" data-testid="text-features-description">
              Everything you need for modern banking in one secure platform
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card data-testid="card-feature-global">
              <CardContent className="p-6">
                <Globe className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-bold">Global Banking</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Operate seamlessly across Australia, USA, and New Zealand with local account details
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-cards">
              <CardContent className="p-6">
                <CreditCard className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-bold">Instant Virtual Cards</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get debit and credit cards instantly with your account. Manage, freeze, or replace anytime
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-secure">
              <CardContent className="p-6">
                <Lock className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-bold">Bank-Grade Security</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Multi-layer security with access codes, encryption, and real-time fraud monitoring
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-transfers">
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-bold">Instant Transfers</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Send money instantly with transfers, PayID, and bill payments available 24/7
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-mobile">
              <CardContent className="p-6">
                <Smartphone className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-bold">Mobile First</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Full-featured banking on any device. Responsive design works perfectly everywhere
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-support">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-xl font-bold">Protected Accounts</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your deposits are protected with comprehensive insurance and regulatory compliance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tools & Calculators Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-background to-blue-50/20 dark:to-blue-950/10">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Financial Tools & Calculators</h2>
            <p className="mt-4 text-muted-foreground">
              Make informed decisions with our free financial planning tools
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-elevate cursor-pointer" data-testid="tool-mortgage">
              <CardContent className="p-6 text-center">
                <Home className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Mortgage Calculator</h3>
                <p className="text-sm text-muted-foreground">
                  Estimate your monthly payments
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer" data-testid="tool-savings">
              <CardContent className="p-6 text-center">
                <PiggyBank className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Savings Calculator</h3>
                <p className="text-sm text-muted-foreground">
                  Plan your savings goals
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer" data-testid="tool-loan">
              <CardContent className="p-6 text-center">
                <Calculator className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Loan Calculator</h3>
                <p className="text-sm text-muted-foreground">
                  Calculate loan payments
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate cursor-pointer" data-testid="tool-investment">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Investment Calculator</h3>
                <p className="text-sm text-muted-foreground">
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
                  onClick={() => window.location.href = '/api/login'}
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
    </div>
  );
}
