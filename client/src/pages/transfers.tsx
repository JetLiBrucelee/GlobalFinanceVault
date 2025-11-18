import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import type { Account } from "@shared/schema";
import { useLocation } from "wouter";

export default function Transfers() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1]);
  const initialTab = params.get('tab') || 'transfer';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const { toast } = useToast();
  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const primaryAccount = accounts?.[0];

  // Transfer form
  const [transferForm, setTransferForm] = useState({
    toAccountNumber: '',
    amount: '',
    description: '',
  });

  // Bill pay form
  const [billPayForm, setBillPayForm] = useState({
    billerCode: '',
    referenceNumber: '',
    amount: '',
    description: '',
  });

  // PayID form
  const [payIdForm, setPayIdForm] = useState({
    payId: '',
    payIdType: 'email',
    amount: '',
    description: '',
  });

  const transferMutation = useMutation({
    mutationFn: async (data: typeof transferForm) => {
      return await apiRequest("POST", "/api/transactions/transfer", data);
    },
    onSuccess: () => {
      toast({
        title: "Transfer Initiated",
        description: "Your transfer is pending approval",
      });
      setTransferForm({ toAccountNumber: '', amount: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const billPayMutation = useMutation({
    mutationFn: async (data: typeof billPayForm) => {
      return await apiRequest("POST", "/api/transactions/bill-pay", data);
    },
    onSuccess: () => {
      toast({
        title: "Bill Payment Initiated",
        description: "Your payment is pending approval",
      });
      setBillPayForm({ billerCode: '', referenceNumber: '', amount: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const payIdMutation = useMutation({
    mutationFn: async (data: typeof payIdForm) => {
      return await apiRequest("POST", "/api/transactions/payid", data);
    },
    onSuccess: () => {
      toast({
        title: "PayID Transfer Initiated",
        description: "Your transfer is pending approval",
      });
      setPayIdForm({ payId: '', payIdType: 'email', amount: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Transfer Failed",
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Transfers & Payments</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Send money, pay bills, and manage PayID
        </p>
      </div>

      {/* Account Balance */}
      {primaryAccount && (
        <Card data-testid="card-account-balance">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold" data-testid="text-available-balance">
                  {formatCurrency(primaryAccount.balance)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Account</p>
                <p className="font-mono" data-testid="text-account-number">
                  {primaryAccount.accountNumber.slice(0, 4)}...{primaryAccount.accountNumber.slice(-4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transfer Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-transfers">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transfer" data-testid="tab-transfer">Transfer</TabsTrigger>
          <TabsTrigger value="bill-pay" data-testid="tab-bill-pay">Bill Pay</TabsTrigger>
          <TabsTrigger value="payid" data-testid="tab-payid">PayID</TabsTrigger>
        </TabsList>

        <TabsContent value="transfer" data-testid="content-transfer">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Money</CardTitle>
              <CardDescription>
                Send money to another account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  transferMutation.mutate(transferForm);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="toAccountNumber">To Account Number</Label>
                  <Input
                    id="toAccountNumber"
                    type="text"
                    placeholder="Enter account number"
                    value={transferForm.toAccountNumber}
                    onChange={(e) => setTransferForm({ ...transferForm, toAccountNumber: e.target.value })}
                    required
                    data-testid="input-to-account"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    required
                    data-testid="input-amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What's this transfer for?"
                    value={transferForm.description}
                    onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                    data-testid="input-description"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={transferMutation.isPending}
                  data-testid="button-submit-transfer"
                >
                  {transferMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Send Transfer'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bill-pay" data-testid="content-bill-pay">
          <Card>
            <CardHeader>
              <CardTitle>Pay Bills</CardTitle>
              <CardDescription>
                Pay your bills quickly and securely
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  billPayMutation.mutate(billPayForm);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="billerCode">Biller Code</Label>
                  <Input
                    id="billerCode"
                    type="text"
                    placeholder="Enter biller code"
                    value={billPayForm.billerCode}
                    onChange={(e) => setBillPayForm({ ...billPayForm, billerCode: e.target.value })}
                    required
                    data-testid="input-biller-code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referenceNumber">Reference Number</Label>
                  <Input
                    id="referenceNumber"
                    type="text"
                    placeholder="Enter reference number"
                    value={billPayForm.referenceNumber}
                    onChange={(e) => setBillPayForm({ ...billPayForm, referenceNumber: e.target.value })}
                    required
                    data-testid="input-reference-number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billAmount">Amount</Label>
                  <Input
                    id="billAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={billPayForm.amount}
                    onChange={(e) => setBillPayForm({ ...billPayForm, amount: e.target.value })}
                    required
                    data-testid="input-bill-amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billDescription">Description (Optional)</Label>
                  <Textarea
                    id="billDescription"
                    placeholder="What bill are you paying?"
                    value={billPayForm.description}
                    onChange={(e) => setBillPayForm({ ...billPayForm, description: e.target.value })}
                    data-testid="input-bill-description"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={billPayMutation.isPending}
                  data-testid="button-submit-bill-pay"
                >
                  {billPayMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Pay Bill'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payid" data-testid="content-payid">
          <Card>
            <CardHeader>
              <CardTitle>PayID Transfer</CardTitle>
              <CardDescription>
                Send money using email or phone number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  payIdMutation.mutate(payIdForm);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="payId">PayID (Email or Phone)</Label>
                  <Input
                    id="payId"
                    type="text"
                    placeholder="email@example.com or phone number"
                    value={payIdForm.payId}
                    onChange={(e) => setPayIdForm({ ...payIdForm, payId: e.target.value })}
                    required
                    data-testid="input-payid"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payIdAmount">Amount</Label>
                  <Input
                    id="payIdAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={payIdForm.amount}
                    onChange={(e) => setPayIdForm({ ...payIdForm, amount: e.target.value })}
                    required
                    data-testid="input-payid-amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payIdDescription">Description (Optional)</Label>
                  <Textarea
                    id="payIdDescription"
                    placeholder="What's this payment for?"
                    value={payIdForm.description}
                    onChange={(e) => setPayIdForm({ ...payIdForm, description: e.target.value })}
                    data-testid="input-payid-description"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={payIdMutation.isPending}
                  data-testid="button-submit-payid"
                >
                  {payIdMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Send Payment'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
