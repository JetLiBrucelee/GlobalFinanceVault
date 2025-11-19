import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, CreditCard, Wallet, TrendingUp, ArrowLeftRight, Receipt, Send } from "lucide-react";
import { Link } from "wouter";
import type { Account, Transaction } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: accounts, isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const primaryAccount = accounts?.[0];
  const recentTransactions = transactions?.slice(0, 5) || [];

  const formatCurrency = (amount: string | number, abbreviated = false) => {
    const value = Number(amount);
    
    if (abbreviated && value >= 1_000_000_000) {
      const billions = value / 1_000_000_000;
      return `$${billions.toFixed(billions >= 100 ? 0 : 1)}B`;
    } else if (abbreviated && value >= 1_000_000) {
      const millions = value / 1_000_000;
      return `$${millions.toFixed(millions >= 100 ? 0 : 1)}M`;
    } else if (abbreviated && value >= 1_000) {
      const thousands = value / 1_000;
      return `$${thousands.toFixed(thousands >= 100 ? 0 : 1)}K`;
    }
    
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      approved: "default",
      pending: "secondary",
      declined: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"} data-testid={`badge-status-${status}`}>{status}</Badge>;
  };

  const getTransactionIcon = (type: string, fromAccountId: string | null) => {
    if (fromAccountId === primaryAccount?.id) {
      return <ArrowUpRight className="h-4 w-4 text-destructive" />;
    }
    return <ArrowDownRight className="h-4 w-4 text-chart-2" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Welcome back{user ? `, ${user.firstName} ${user.lastName}` : ''}! Here's your account overview
        </p>
      </div>

      {/* Account Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-balance">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold break-words" data-testid="text-balance" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {formatCurrency(primaryAccount?.balance || 0, true)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1" data-testid="text-account-number">
              {primaryAccount?.accountNumber ? `****${primaryAccount.accountNumber.slice(-4)}` : '****'}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-income">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-income">
                {formatCurrency(
                  transactions
                    ?.filter(t => t.toAccountId === primaryAccount?.id && t.status === 'completed')
                    .reduce((sum, t) => sum + Number(t.amount), 0) || 0
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-expenses">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-expenses">
                {formatCurrency(
                  transactions
                    ?.filter(t => t.fromAccountId === primaryAccount?.id && t.status === 'completed')
                    .reduce((sum, t) => sum + Number(t.amount), 0) || 0
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-transactions">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-pending-count">
                {transactions?.filter(t => t.status === 'pending').length || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4" data-testid="text-quick-actions-title">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/transfers">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-action-transfer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ArrowLeftRight className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Transfer Money</h3>
                  <p className="text-xs text-muted-foreground">Send to another account</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/transfers?tab=bill-pay">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-action-bill-pay">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Pay Bills</h3>
                  <p className="text-xs text-muted-foreground">Quick bill payments</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/transfers?tab=payid">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-action-payid">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">PayID</h3>
                  <p className="text-xs text-muted-foreground">Send via email or phone</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/cards">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-action-cards">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">My Cards</h3>
                  <p className="text-xs text-muted-foreground">Manage your cards</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card data-testid="card-recent-transactions">
        <CardHeader className="flex flex-row items-center justify-between gap-1">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest account activity</CardDescription>
          </div>
          <Button variant="ghost" asChild data-testid="button-view-all">
            <Link href="/statements">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8" data-testid="text-no-transactions">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover-elevate"
                  data-testid={`transaction-${index}`}
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {getTransactionIcon(transaction.type, transaction.fromAccountId)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium" data-testid={`text-transaction-description-${index}`}>
                      {transaction.description || transaction.type}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-transaction-date-${index}`}>
                      {new Date(transaction.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.fromAccountId === primaryAccount?.id
                          ? 'text-destructive'
                          : 'text-chart-2'
                      }`}
                      data-testid={`text-transaction-amount-${index}`}
                    >
                      {transaction.fromAccountId === primaryAccount?.id ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
