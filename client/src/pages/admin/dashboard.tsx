import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CreditCard, TrendingUp, ShieldCheck, UserPlus, Settings, FileText, ArrowLeftRight } from "lucide-react";
import { Link } from "wouter";
import type { User, Account, Transaction, AccessCode } from "@shared/schema";

export default function AdminDashboard() {
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: accounts, isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ["/api/admin/accounts"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions"],
  });

  const { data: accessCodes, isLoading: accessCodesLoading } = useQuery<AccessCode[]>({
    queryKey: ["/api/admin/access-codes"],
  });

  const adminAccount = accounts?.find(acc => acc.userId === users?.find(u => u.isAdmin)?.id);

  const formatCurrency = (amount: string | number, abbreviated = false) => {
    const value = Number(amount);
    
    if (abbreviated && value >= 1_000_000_000) {
      const billions = value / 1_000_000_000;
      return `$${billions.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}B`;
    } else if (abbreviated && value >= 1_000_000) {
      const millions = value / 1_000_000;
      return `$${millions.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}M`;
    } else if (abbreviated && value >= 1_000) {
      const thousands = value / 1_000;
      return `$${thousands.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}K`;
    }
    
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;
  const pendingTransactions = transactions?.filter(t => t.status === 'pending').length || 0;
  const activeAccessCodes = accessCodes?.filter(c => !c.isUsed && new Date(c.expiresAt) > new Date()).length || 0;

  // Calculate monthly income and expenses for admin account
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const monthlyIncome = transactions
    ?.filter(t => 
      t.toAccountId === adminAccount?.id && 
      t.status === 'completed' &&
      new Date(t.createdAt!) >= thisMonth
    )
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const monthlyExpenses = transactions
    ?.filter(t => 
      t.fromAccountId === adminAccount?.id && 
      t.status === 'completed' &&
      new Date(t.createdAt!) >= thisMonth
    )
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Welcome back! Here's your account overview
        </p>
      </div>

      {/* Account Balance Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-balance">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-balance">
                  {formatCurrency(adminAccount?.balance || 0, false)}
                </div>
                <p className="text-xs text-muted-foreground mt-1" data-testid="text-account-number">
                  {adminAccount?.accountNumber ? `****${adminAccount.accountNumber.slice(-4)}` : '****'}
                </p>
              </>
            )}
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
                {formatCurrency(monthlyIncome)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-expenses">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-expenses">
                {formatCurrency(monthlyExpenses)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-transactions">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-pending-count">
                {pendingTransactions}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Admin Specific */}
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

          <Link href="/admin/users">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-action-manage-users">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Users</h3>
                  <p className="text-xs text-muted-foreground">View and edit users</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/transactions">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-action-transactions">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Transactions</h3>
                  <p className="text-xs text-muted-foreground">Review all transactions</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/access-codes">
            <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid="card-action-access-codes">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Access Codes</h3>
                  <p className="text-xs text-muted-foreground">Manage access codes</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-total-users">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-users">
                {users?.length || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {users?.filter(u => !u.isBlocked).length || 0} active
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-accounts">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {accountsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-accounts">
                {accounts?.length || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(totalBalance)} total
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-transactions">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-pending-transactions">
                {pendingTransactions}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Transactions awaiting review
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-access-codes">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Access Codes</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {accessCodesLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-active-codes">
                {activeAccessCodes}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Unused codes available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-recent-users">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Newest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : users && users.length > 0 ? (
              <div className="space-y-4">
                {users.slice(0, 5).map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4"
                    data-testid={`recent-user-${index}`}
                  >
                    <div className="flex-1">
                      <p className="font-medium" data-testid={`user-name-${index}`}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`user-email-${index}`}>
                        {user.email}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(user.createdAt!).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No users yet</p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-pending-approvals">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Transactions requiring review</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions
                  .filter(t => t.status === 'pending')
                  .slice(0, 5)
                  .map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-4"
                      data-testid={`pending-transaction-${index}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {transaction.description || transaction.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-semibold">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No pending transactions</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
