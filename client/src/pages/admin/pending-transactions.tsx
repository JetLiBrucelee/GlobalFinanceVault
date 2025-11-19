import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Copy, Check } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  fromAccountId: string | null;
  toAccountId: string | null;
  amount: string;
  type: string;
  status: string;
  description: string | null;
  reference: string | null;
  createdAt: string;
  progressPercentage: number;
}

export default function PendingTransactions() {
  const { toast } = useToast();
  const [approvalDialog, setApprovalDialog] = useState<{
    open: boolean;
    transaction: Transaction | null;
    codes: { code1: string; code2: string; code3: string; code4: string } | null;
  }>({ open: false, transaction: null, codes: null });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: pendingTransactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions/pending"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const approveTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return await apiRequest("POST", `/api/admin/transactions/${transactionId}/approve`, {});
    },
    onSuccess: (data: any) => {
      setApprovalDialog({
        open: true,
        transaction: data.transaction,
        codes: data.verificationCodes,
      });
      toast({
        title: "Transaction Approved",
        description: "Verification codes generated. Use them to complete the transaction.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/in-progress"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const declineTransactionMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      return await apiRequest("POST", `/api/admin/transactions/${transactionId}/decline`, {});
    },
    onSuccess: () => {
      toast({
        title: "Transaction Declined",
        description: "The transaction has been declined.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Decline Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, codeNumber: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(codeNumber);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied!",
      description: `Code ${codeNumber} copied to clipboard`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Pending Transactions</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Review and approve transfers waiting for verification
        </p>
      </div>

      <Card data-testid="card-pending-transactions">
        <CardHeader>
          <CardTitle>Awaiting Approval</CardTitle>
          <CardDescription>
            {pendingTransactions?.length || 0} transaction(s) pending approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : pendingTransactions && pendingTransactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTransactions.map((transaction, index) => (
                    <TableRow key={transaction.id} data-testid={`row-transaction-${index}`}>
                      <TableCell data-testid={`cell-date-${index}`}>
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell data-testid={`cell-type-${index}`}>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`cell-amount-${index}`}>
                        ${parseFloat(transaction.amount).toFixed(2)}
                      </TableCell>
                      <TableCell data-testid={`cell-description-${index}`}>
                        {transaction.description || 'N/A'}
                      </TableCell>
                      <TableCell data-testid={`cell-status-${index}`}>
                        <Badge variant="secondary">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveTransactionMutation.mutate(transaction.id)}
                          disabled={approveTransactionMutation.isPending}
                          data-testid={`button-approve-${index}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => declineTransactionMutation.mutate(transaction.id)}
                          disabled={declineTransactionMutation.isPending}
                          data-testid={`button-decline-${index}`}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <p className="text-lg font-medium">No pending transactions</p>
              <p className="text-sm text-muted-foreground">All transactions have been processed</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog with Verification Codes */}
      <Dialog open={approvalDialog.open} onOpenChange={(open) => setApprovalDialog({ ...approvalDialog, open })}>
        <DialogContent className="max-w-2xl" data-testid="dialog-approval-codes">
          <DialogHeader>
            <DialogTitle>Transaction Approved - Verification Codes</DialogTitle>
            <DialogDescription>
              Use these 4 verification codes in sequence to complete the transaction. Each code must be entered in order.
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Save these codes securely. You will need to enter them in the Transactions page to complete this transfer.
            </AlertDescription>
          </Alert>

          {approvalDialog.codes && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Code 1 (25%)", code: approvalDialog.codes.code1, key: "1" },
                  { label: "Code 2 (50% - Debits Sender)", code: approvalDialog.codes.code2, key: "2" },
                  { label: "Code 3 (75%)", code: approvalDialog.codes.code3, key: "3" },
                  { label: "Code 4 (100% - Completes)", code: approvalDialog.codes.code4, key: "4" },
                ].map((item) => (
                  <Card key={item.key}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-lg font-mono font-bold bg-muted px-3 py-2 rounded flex-1">
                          {item.code}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard(item.code, item.key)}
                          data-testid={`button-copy-code${item.key}`}
                        >
                          {copiedCode === item.key ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Transaction Details</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Amount:</strong> ${parseFloat(approvalDialog.transaction?.amount || "0").toFixed(2)}</p>
                  <p><strong>Type:</strong> {approvalDialog.transaction?.type}</p>
                  <p><strong>Description:</strong> {approvalDialog.transaction?.description || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => {
                setApprovalDialog({ open: false, transaction: null, codes: null });
                window.location.href = '/admin/transactions';
              }}
              data-testid="button-go-to-transactions"
            >
              Go to Transactions Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
