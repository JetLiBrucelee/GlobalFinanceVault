import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, CreditCard, Globe, TrendingUp, Smartphone, Lock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
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

      {/* Hero Section */}
      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container relative mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl" data-testid="text-hero-title">
              Banking Made Simple,
              <span className="block text-primary">Secure, & Global</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground" data-testid="text-hero-description">
              Experience modern banking across Australia, USA, and New Zealand. 
              Manage your money with confidence, security, and ease.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-hero-open-account"
              >
                Open Your Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-hero-login"
              >
                Log In
              </Button>
            </div>
          </div>
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

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p data-testid="text-footer-copyright">© 2024 The Peoples Finance. All rights reserved.</p>
            <p className="mt-2" data-testid="text-footer-regions">Serving customers in Australia, USA, and New Zealand</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
