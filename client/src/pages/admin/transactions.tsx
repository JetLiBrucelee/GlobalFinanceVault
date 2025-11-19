import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { format } from "date-fns";
import adminBg from "@assets/stock_images/online_banking_servi_775ecb2d.jpg";

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
  processedAt: string | null;
  progressPercentage: number;
  verificationCode1: string | null;
  verificationCode2: string | null;
  verificationCode3: string | null;
  verificationCode4: string | null;
}

export default function AdminTransactions() {
  const { toast } = useToast();
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions"],
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  const { data: inProgressTransactions, isLoading: inProgressLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions/in-progress"],
    refetchInterval: 3000,
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async ({ transactionId, codeNumber, code }: { transactionId: string; codeNumber: number; code: string }) => {
      return await apiRequest("POST", `/api/admin/transactions/${transactionId}/verify-code`, { codeNumber, code });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Code Verified",
        description: data.message,
      });
      // Clear the input
      setCodeInputs({});
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/in-progress"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
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
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon?: any }> = {
      completed: { variant: "default", icon: CheckCircle },
      "in-progress": { variant: "secondary", icon: Clock },
      pending: { variant: "outline", icon: AlertCircle },
      declined: { variant: "destructive" },
    };
    const { variant, icon: Icon } = config[status] || { variant: "secondary" };
    return (
      <Badge variant={variant}>
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {status}
      </Badge>
    );
  };

  const getNextCodeNumber = (transaction: Transaction): number => {
    const progress = transaction.progressPercentage;
    if (progress === 0) return 1;
    if (progress === 25) return 2;
    if (progress === 50) return 3;
    if (progress === 75) return 4;
    return 5; // Completed
  };

  const getCodeLabel = (codeNumber: number): string => {
    const labels: Record<number, string> = {
      1: "Code 1 - Initiate (25%)",
      2: "Code 2 - Debit Sender (50%)",
      3: "Code 3 - Transfer In Transit (75%)",
      4: "Code 4 - Complete Transfer (100%)",
    };
    return labels[codeNumber] || "Complete";
  };

  const handleVerifyCode = (transactionId: string, codeNumber: number) => {
    const code = codeInputs[`${transactionId}-${codeNumber}`];
    if (!code) {
      toast({
        title: "Code Required",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    verifyCodeMutation.mutate({ transactionId, codeNumber, code });
  };

  const completedTransactions = transactions?.filter(t => t.status === 'completed') || [];

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
      <div>
        <h1 className="text-3xl font-bold text-white" data-testid="text-page-title">Transaction Management</h1>
        <p className="text-gray-300" data-testid="text-page-description">
          Complete in-progress transfers with verification codes
        </p>
      </div>

      {/* In-Progress Transactions */}
      <Card data-testid="card-in-progress">
        <CardHeader>
          <CardTitle>In-Progress Transactions</CardTitle>
          <CardDescription>
            {inProgressTransactions?.length || 0} transaction(s) requiring code verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inProgressLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : inProgressTransactions && inProgressTransactions.length > 0 ? (
            <div className="space-y-6">
              {inProgressTransactions.map((transaction, index) => {
                const nextCode = getNextCodeNumber(transaction);
                const isComplete = nextCode === 5;

                return (
                  <Card key={transaction.id} className="border-2 border-primary/20" data-testid={`card-transaction-${index}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {formatCurrency(transaction.amount)} Transfer
                          </CardTitle>
                          <CardDescription>
                            {transaction.description} • {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                          </CardDescription>
                        </div>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">Progress</span>
                          <span className="text-muted-foreground">{transaction.progressPercentage}%</span>
                        </div>
                        <Progress value={transaction.progressPercentage} className="h-3" />
                        <div className="grid grid-cols-4 gap-2 mt-2 text-xs text-center">
                          <div className={transaction.progressPercentage >= 25 ? "text-primary font-medium" : "text-muted-foreground"}>
                            25%
                          </div>
                          <div className={transaction.progressPercentage >= 50 ? "text-primary font-medium" : "text-muted-foreground"}>
                            50%
                          </div>
                          <div className={transaction.progressPercentage >= 75 ? "text-primary font-medium" : "text-muted-foreground"}>
                            75%
                          </div>
                          <div className={transaction.progressPercentage >= 100 ? "text-primary font-medium" : "text-muted-foreground"}>
                            100%
                          </div>
                        </div>
                      </div>

                      {!isComplete ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Next Step:</strong> Enter {getCodeLabel(nextCode)} to continue
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="bg-green-500/10 border-green-500">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-green-700 dark:text-green-400">
                            <strong>Transfer Complete!</strong> All verification codes have been processed.
                          </AlertDescription>
                        </Alert>
                      )}

                      {!isComplete && (
                        <div className="flex gap-3 items-end">
                          <div className="flex-1">
                            <Label htmlFor={`code-${transaction.id}-${nextCode}`}>
                              {getCodeLabel(nextCode)}
                            </Label>
                            <Input
                              id={`code-${transaction.id}-${nextCode}`}
                              type="text"
                              placeholder="Enter verification code"
                              value={codeInputs[`${transaction.id}-${nextCode}`] || ''}
                              onChange={(e) => setCodeInputs({
                                ...codeInputs,
                                [`${transaction.id}-${nextCode}`]: e.target.value.toUpperCase()
                              })}
                              className="font-mono uppercase"
                              data-testid={`input-code${nextCode}-${index}`}
                            />
                          </div>
                          <Button
                            onClick={() => handleVerifyCode(transaction.id, nextCode)}
                            disabled={verifyCodeMutation.isPending}
                            data-testid={`button-verify-${index}`}
                          >
                            Verify <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      )}

                      {/* Checkpoint History */}
                      <div className="text-xs space-y-1 text-muted-foreground border-t pt-3">
                        <div className="font-medium text-foreground mb-2">Checkpoint History:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2, 3, 4].map((num) => (
                            <div key={num} className={transaction.progressPercentage >= num * 25 ? "text-green-600 dark:text-green-400" : ""}>
                              {transaction.progressPercentage >= num * 25 ? "✓" : "○"} Code {num} ({num * 25}%)
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <p className="text-lg font-medium">No in-progress transactions</p>
              <p className="text-sm text-muted-foreground">Check Pending Transactions to approve new transfers</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Transactions */}
      <Card data-testid="card-completed">
        <CardHeader>
          <CardTitle>Recent Completed Transactions</CardTitle>
          <CardDescription>
            {completedTransactions.length} completed transaction(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : completedTransactions.length > 0 ? (
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
                  {completedTransactions.slice(0, 10).map((transaction, index) => (
                    <TableRow key={transaction.id} data-testid={`row-completed-${index}`}>
                      <TableCell data-testid={`cell-date-${index}`}>
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell data-testid={`cell-type-${index}`}>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </TableCell>
                      <TableCell data-testid={`cell-description-${index}`}>
                        {transaction.description || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`cell-amount-${index}`}>
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell data-testid={`cell-status-${index}`}>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No completed transactions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
