import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Globe, CreditCard, Shield, DollarSign, Check, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import airplaneIcon from "@assets/stock_images/modern_airplane_icon_8e2d11fa.jpg";
import globeIcon from "@assets/stock_images/globe_world_map_icon_192cc559.jpg";
import creditCardIcon from "@assets/stock_images/credit_card_icon_pro_7f6470ae.jpg";

export default function TravelBanking() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    setLocation('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <Badge variant="secondary" className="mb-4">
            <Plane className="h-3 w-3 mr-2" />
            Travel Banking
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Banking for Your Global Adventures
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience seamless international banking with Fundamental Financial Credit. 
            Travel the world with confidence knowing your money is accessible anywhere.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center p-4 mb-4">
                <img src={globeIcon} alt="Global Access" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Global Access</h3>
              <p className="text-sm text-muted-foreground">
                Access your accounts from anywhere in the world with our secure mobile and web banking platforms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center p-4 mb-4">
                <img src={creditCardIcon} alt="Travel Cards" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Travel Credit Cards</h3>
              <p className="text-sm text-muted-foreground">
                Earn rewards on travel purchases with no foreign transaction fees on select cards
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center p-4 mb-4">
                <img src={airplaneIcon} alt="Travel Insurance" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Travel Insurance</h3>
              <p className="text-sm text-muted-foreground">
                Complimentary travel insurance coverage on select credit cards for peace of mind
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Multi-Currency Accounts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Multi-Currency Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Hold and transact in multiple currencies with competitive exchange rates. Perfect for frequent travelers and international business.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  $
                </div>
                <div>
                  <p className="font-semibold">US Dollar (USD)</p>
                  <p className="text-xs text-muted-foreground">United States</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  $
                </div>
                <div>
                  <p className="font-semibold">Australian Dollar (AUD)</p>
                  <p className="text-xs text-muted-foreground">Australia</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  $
                </div>
                <div>
                  <p className="font-semibold">New Zealand Dollar (NZD)</p>
                  <p className="text-xs text-muted-foreground">New Zealand</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Travel Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Travel Banking Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">No Foreign Transaction Fees</p>
                  <p className="text-sm text-muted-foreground">Save up to 3% on every international purchase</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">24/7 Travel Support</p>
                  <p className="text-sm text-muted-foreground">Expert assistance wherever you are in the world</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Emergency Card Replacement</p>
                  <p className="text-sm text-muted-foreground">Get a replacement card delivered anywhere globally</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Travel Notifications</p>
                  <p className="text-sm text-muted-foreground">Set travel alerts to avoid card blocks when abroad</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Competitive Exchange Rates</p>
                  <p className="text-sm text-muted-foreground">Get fair rates on currency conversions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">ATM Fee Refunds</p>
                  <p className="text-sm text-muted-foreground">Get refunds on international ATM fees with select accounts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Travel with Confidence?</h2>
            <p className="text-primary-foreground/90 mb-6 max-w-xl mx-auto">
              Upgrade to a travel-focused account or credit card and start enjoying worldwide banking benefits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => setLocation('/cards')}
                className="w-full sm:w-auto"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                View Travel Cards
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setLocation('/')}
                className="w-full sm:w-auto bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
