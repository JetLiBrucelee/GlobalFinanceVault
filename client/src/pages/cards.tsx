import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard } from "lucide-react";
import CardDisplay from "@/components/CardDisplay";
import type { Card as CardType, Account } from "@shared/schema";

export default function Cards() {
  const { data: cards, isLoading: cardsLoading } = useQuery<CardType[]>({
    queryKey: ["/api/cards"],
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

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
            return (
              <CardDisplay
                key={card.id}
                card={card}
                account={account}
                index={index}
              />
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
