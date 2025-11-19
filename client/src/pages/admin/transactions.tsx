import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Transaction } from "@shared/schema";
import adminBg from "@assets/stock_images/online_banking_servi_775ecb2d.jpg";

export default function AdminTransactions() {
  const { toast } = useToast();

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions"],
  });

  const approveMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return await apiRequest("POST", `/api/admin/transactions/${transactionId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Transaction Approved",
        description: "Transaction has been approved and processed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return await apiRequest("POST", `/api/admin/transactions/${transactionId}/decline`, {});
    },
    onSuccess: () => {
      toast({
        title: "Transaction Declined",
        description: "Transaction has been declined",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Decline Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  const pendingTransactions = transactions?.filter(t => t.status === 'pending') || [];
  const processedTransactions = transactions?.filter(t => t.status !== 'pending') || [];

  return (
    <div 
      className="space-y-8 min-h-screen p-8 -m-8" 
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(${adminBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white" data-testid="text-page-title">Transaction Management</h1>
        <p className="text-gray-300" data-testid="text-page-description">
          Approve or decline pending transactions
        </p>
      </div>

      {/* Pending Transactions */}
      <Card data-testid="card-pending">
        <CardHeader>
          <CardTitle>Pending Approval</CardTitle>
          <CardDescription>
            {pendingTransactions.length} transaction(s) awaiting review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : pendingTransactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTransactions.map((transaction, index) => (
                    <TableRow key={transaction.id} data-testid={`row-pending-${index}`}>
                      <TableCell className="font-mono text-sm" data-testid={`cell-date-${index}`}>
                        {new Date(transaction.createdAt!).toLocaleDateString('en-AU')}
                      </TableCell>
                      <TableCell data-testid={`cell-type-${index}`}>
                        <Badge variant="outline">{transaction.type.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell data-testid={`cell-description-${index}`}>
                        {transaction.description || 'No description'}
                        {transaction.reference && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Ref: {transaction.reference}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold" data-testid={`cell-amount-${index}`}>
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => approveMutation.mutate(transaction.id)}
                            disabled={approveMutation.isPending || declineMutation.isPending}
                            data-testid={`button-approve-${index}`}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => declineMutation.mutate(transaction.id)}
                            disabled={approveMutation.isPending || declineMutation.isPending}
                            data-testid={`button-decline-${index}`}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8" data-testid="text-no-pending">
              No pending transactions
            </p>
          )}
        </CardContent>
      </Card>

      {/* Processed Transactions */}
      <Card data-testid="card-processed">
        <CardHeader>
          <CardTitle>Recent Processed Transactions</CardTitle>
          <CardDescription>
            Previously reviewed transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : processedTransactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedTransactions.slice(0, 10).map((transaction, index) => (
                    <TableRow key={transaction.id} data-testid={`row-processed-${index}`}>
                      <TableCell className="font-mono text-sm" data-testid={`cell-processed-date-${index}`}>
                        {new Date(transaction.createdAt!).toLocaleDateString('en-AU')}
                      </TableCell>
                      <TableCell data-testid={`cell-processed-type-${index}`}>
                        <Badge variant="outline">{transaction.type.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell data-testid={`cell-processed-description-${index}`}>
                        {transaction.description || 'No description'}
                      </TableCell>
                      <TableCell className="font-semibold" data-testid={`cell-processed-amount-${index}`}>
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell data-testid={`cell-processed-status-${index}`}>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No processed transactions</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
