import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
import type { Transaction, Account } from "@shared/schema";

export default function Statements() {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const primaryAccount = accounts?.[0];

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(Number(amount));
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      approved: "default",
      pending: "secondary",
      declined: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getTransactionIcon = (fromAccountId: string | null) => {
    if (fromAccountId === primaryAccount?.id) {
      return <ArrowUpRight className="h-4 w-4 text-destructive" />;
    }
    return <ArrowDownRight className="h-4 w-4 text-chart-2" />;
  };

  const filteredTransactions = transactions?.filter(t => {
    if (filterType !== "all") {
      if (filterType === "income" && t.toAccountId !== primaryAccount?.id) return false;
      if (filterType === "expense" && t.fromAccountId !== primaryAccount?.id) return false;
    }
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Statements</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            View and download your transaction history
          </p>
        </div>
        <Button data-testid="button-download">
          <Download className="mr-2 h-4 w-4" />
          Download Statement
        </Button>
      </div>

      {/* Filters */}
      <Card data-testid="card-filters">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger data-testid="select-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expense">Expenses Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card data-testid="card-transactions">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {filteredTransactions?.length || 0} transaction(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction, index) => (
                    <TableRow key={transaction.id} data-testid={`row-transaction-${index}`}>
                      <TableCell className="font-mono text-sm" data-testid={`cell-date-${index}`}>
                        {new Date(transaction.createdAt!).toLocaleDateString('en-AU')}
                      </TableCell>
                      <TableCell data-testid={`cell-description-${index}`}>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.fromAccountId)}
                          <span>{transaction.description || transaction.type}</span>
                        </div>
                        {transaction.reference && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Ref: {transaction.reference}
                          </p>
                        )}
                      </TableCell>
                      <TableCell data-testid={`cell-type-${index}`}>
                        <Badge variant="outline">{transaction.type.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell data-testid={`cell-status-${index}`}>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className="text-right" data-testid={`cell-amount-${index}`}>
                        <span
                          className={`font-semibold ${
                            transaction.fromAccountId === primaryAccount?.id
                              ? 'text-destructive'
                              : 'text-chart-2'
                          }`}
                        >
                          {transaction.fromAccountId === primaryAccount?.id ? '-' : '+'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12" data-testid="text-no-transactions">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
