import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Eye, EyeOff, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Card as CardType, Account } from "@shared/schema";

export default function Cards() {
  const [visibleCvvs, setVisibleCvvs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: cards, isLoading: cardsLoading } = useQuery<CardType[]>({
    queryKey: ["/api/cards"],
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const toggleCvvVisibility = (cardId: string) => {
    setVisibleCvvs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const formatCardNumber = (number: string) => {
    return number.match(/.{1,4}/g)?.join(' ') || number;
  };

  const getCardGradient = (type: string) => {
    return type === 'credit' 
      ? 'bg-gradient-to-br from-primary via-primary/90 to-primary/80'
      : 'bg-gradient-to-br from-chart-1 via-chart-1/90 to-chart-1/80';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">My Cards</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Manage your debit and credit cards
        </p>
      </div>

      {/* Cards Grid */}
      {cardsLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : cards && cards.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {cards.map((card, index) => {
            const account = accounts?.find(a => a.id === card.accountId);
            const isCvvVisible = visibleCvvs.has(card.id);
            
            return (
              <Card
                key={card.id}
                className={`${getCardGradient(card.cardType)} text-white border-0`}
                data-testid={`card-${index}`}
              >
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-6 w-6" />
                        <span className="font-medium">
                          {card.cardType === 'credit' ? 'Credit Card' : 'Debit Card'}
                        </span>
                      </div>
                      <Badge
                        variant={card.isActive ? "default" : "secondary"}
                        className="bg-white/20 text-white border-0"
                        data-testid={`badge-status-${index}`}
                      >
                        {card.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* Card Number */}
                    <div className="space-y-2">
                      <p className="text-xs text-white/70">Card Number</p>
                      <div className="flex items-center justify-between">
                        <p
                          className="text-xl font-mono tracking-wider"
                          data-testid={`text-card-number-${index}`}
                        >
                          {formatCardNumber(card.cardNumber)}
                        </p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-white/20"
                          onClick={() => copyToClipboard(card.cardNumber, 'Card number')}
                          data-testid={`button-copy-card-number-${index}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-white/70">Cardholder</p>
                        <p className="text-sm font-medium truncate" data-testid={`text-cardholder-${index}`}>
                          {card.cardholderName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-white/70">Expiry</p>
                        <p className="text-sm font-medium font-mono" data-testid={`text-expiry-${index}`}>
                          {card.expiryMonth}/{card.expiryYear.slice(-2)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-white/70">CVV</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium font-mono" data-testid={`text-cvv-${index}`}>
                            {isCvvVisible ? card.cvv : '***'}
                          </p>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-white hover:bg-white/20"
                            onClick={() => toggleCvvVisibility(card.id)}
                            data-testid={`button-toggle-cvv-${index}`}
                          >
                            {isCvvVisible ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Account Info */}
                    {account && (
                      <div className="pt-4 border-t border-white/20">
                        <p className="text-xs text-white/70 mb-1">Linked Account</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-mono" data-testid={`text-linked-account-${index}`}>
                            {account.accountNumber.slice(0, 4)}...{account.accountNumber.slice(-4)}
                          </p>
                          <p className="text-xs text-white/70">
                            {account.region === 'AU' && account.bsb && `BSB: ${account.bsb.slice(0, 3)}-${account.bsb.slice(3)}`}
                            {account.region === 'US' && account.routingNumber && `Routing: ${account.routingNumber}`}
                            {account.region === 'NZ' && account.swiftCode && `SWIFT: ${account.swiftCode}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card data-testid="card-no-cards">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Cards Yet</h3>
            <p className="text-muted-foreground">
              Your cards will appear here once your account is set up
            </p>
          </CardContent>
        </Card>
      )}

      {/* Card Information */}
      <Card data-testid="card-info">
        <CardHeader>
          <CardTitle>Card Information</CardTitle>
          <CardDescription>Important details about your cards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Security Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>All cards come with CVV protection</li>
              <li>Real-time fraud monitoring on all transactions</li>
              <li>Instant card freeze available in settings</li>
              <li>Contactless payments enabled by default</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Card Usage</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Use your debit card for everyday purchases</li>
              <li>Credit card offers additional protection and rewards</li>
              <li>Cards work globally wherever Visa/Mastercard is accepted</li>
              <li>Set spending limits and controls in settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
