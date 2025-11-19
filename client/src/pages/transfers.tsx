import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Account, User } from "@shared/schema";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Transfers() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1]);
  const initialTab = params.get('tab') || 'transfer';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  
  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  // Fetch all users and accounts for admin transfer dropdown
  const { data: allUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAdmin === true,
  });

  const { data: allAccounts } = useQuery<Account[]>({
    queryKey: ["/api/admin/accounts"],
    enabled: isAdmin === true,
  });

  useEffect(() => {
    // Force admins to transfer tab only
    if (isAdmin && initialTab !== 'transfer') {
      setActiveTab('transfer');
    } else {
      setActiveTab(initialTab);
    }
  }, [initialTab, isAdmin]);

  const primaryAccount = accounts?.[0];

  // Fetch user's transactions to show pending/in-progress
  const { data: userTransactions = [] } = useQuery<any[]>({
    queryKey: ["/api/transactions"],
  });

  const pendingTransactions = userTransactions.filter((t: any) => t.status === 'pending');
  const inProgressTransactions = userTransactions.filter((t: any) => t.status === 'in-progress');

  // Transfer form
  const [transferMethod, setTransferMethod] = useState<'internal' | 'external' | 'wire'>('internal');
  const [transferForm, setTransferForm] = useState({
    toAccountNumber: '',
    amount: '',
    description: '',
    // External transfer fields
    routingNumber: '',
    bsb: '',
    beneficiaryName: '',
    beneficiaryAddress: '',
    // Wire transfer fields
    swiftCode: '',
    iban: '',
    beneficiaryBankName: '',
    beneficiaryBankAddress: '',
    intermediaryBankName: '',
    intermediaryBankSwift: '',
    transferPurpose: '',
  });

  const [selectedUserId, setSelectedUserId] = useState('');

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
      // Build transfer details based on method
      let transferDetails: any = {};
      
      if (transferMethod === 'external') {
        transferDetails = {
          routingNumber: data.routingNumber,
          bsb: data.bsb,
          beneficiaryName: data.beneficiaryName,
          beneficiaryAddress: data.beneficiaryAddress,
        };
      } else if (transferMethod === 'wire') {
        transferDetails = {
          swiftCode: data.swiftCode,
          iban: data.iban,
          beneficiaryBankName: data.beneficiaryBankName,
          beneficiaryBankAddress: data.beneficiaryBankAddress,
          intermediaryBankName: data.intermediaryBankName || undefined,
          intermediaryBankSwift: data.intermediaryBankSwift || undefined,
          transferPurpose: data.transferPurpose,
        };
      }
      
      return await apiRequest("POST", "/api/transactions/transfer", {
        toAccountNumber: data.toAccountNumber,
        amount: data.amount,
        description: data.description,
        transferMethod,
        transferDetails,
      });
    },
    onSuccess: () => {
      toast({
        title: "Transfer Initiated",
        description: "Your transfer is pending approval",
      });
      setTransferForm({
        toAccountNumber: '',
        amount: '',
        description: '',
        routingNumber: '',
        bsb: '',
        beneficiaryName: '',
        beneficiaryAddress: '',
        swiftCode: '',
        iban: '',
        beneficiaryBankName: '',
        beneficiaryBankAddress: '',
        intermediaryBankName: '',
        intermediaryBankSwift: '',
        transferPurpose: '',
      });
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
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-1' : 'grid-cols-3'}`}>
          <TabsTrigger value="transfer" data-testid="tab-transfer">Transfer</TabsTrigger>
          {!isAdmin && (
            <>
              <TabsTrigger value="bill-pay" data-testid="tab-bill-pay">Bill Pay</TabsTrigger>
              <TabsTrigger value="payid" data-testid="tab-payid">PayID</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="transfer" data-testid="content-transfer">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Money</CardTitle>
              <CardDescription>
                {isAdmin ? 'Transfer funds to a registered user account' : 'Send money to another account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isAdmin) {
                    if (!selectedUserId) {
                      toast({
                        title: "Error",
                        description: "Please select a user to transfer to",
                        variant: "destructive",
                      });
                      return;
                    }
                    // Find the account for the selected user
                    const userAccount = allAccounts?.find(acc => acc.userId === selectedUserId);
                    if (userAccount) {
                      transferMutation.mutate({ ...transferForm, toAccountNumber: userAccount.accountNumber });
                    } else {
                      toast({
                        title: "Error",
                        description: "Could not find account for selected user",
                        variant: "destructive",
                      });
                    }
                  } else {
                    transferMutation.mutate(transferForm);
                  }
                }}
                className="space-y-4"
              >
                {/* Transfer Method Selection (non-admin only) */}
                {!isAdmin && (
                  <div className="space-y-3">
                    <Label>Transfer Method</Label>
                    <Tabs value={transferMethod} onValueChange={(v) => setTransferMethod(v as any)} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="internal">Internal</TabsTrigger>
                        <TabsTrigger value="external">External</TabsTrigger>
                        <TabsTrigger value="wire">Wire</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <p className="text-xs text-muted-foreground">
                      {transferMethod === 'internal' && 'Transfer to another account within The Peoples Finance'}
                      {transferMethod === 'external' && 'Transfer to an external bank account (domestic)'}
                      {transferMethod === 'wire' && 'International wire transfer to any bank worldwide'}
                    </p>
                  </div>
                )}

                {isAdmin ? (
                  <div className="space-y-2">
                    <Label htmlFor="selectUser">Select User</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId} required>
                      <SelectTrigger data-testid="select-user">
                        <SelectValue placeholder="Choose a user to transfer to" />
                      </SelectTrigger>
                      <SelectContent>
                        {allUsers?.filter(u => !u.isAdmin).map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.firstName} {u.lastName} ({u.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="toAccountNumber">
                      {transferMethod === 'internal' ? 'To Account Number' : 'Beneficiary Account Number'}
                    </Label>
                    <Input
                      id="toAccountNumber"
                      type="text"
                      placeholder={transferMethod === 'wire' ? 'Enter IBAN or account number' : 'Enter account number'}
                      value={transferForm.toAccountNumber}
                      onChange={(e) => setTransferForm({ ...transferForm, toAccountNumber: e.target.value })}
                      required
                      data-testid="input-to-account"
                    />
                  </div>
                )}
                
                {/* External Transfer Fields */}
                {!isAdmin && transferMethod === 'external' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {primaryAccount?.region === 'AU' && (
                        <div className="space-y-2">
                          <Label htmlFor="bsb">BSB</Label>
                          <Input
                            id="bsb"
                            type="text"
                            placeholder="XXX-XXX"
                            value={transferForm.bsb}
                            onChange={(e) => setTransferForm({ ...transferForm, bsb: e.target.value })}
                            required
                          />
                        </div>
                      )}
                      {primaryAccount?.region === 'US' && (
                        <div className="space-y-2">
                          <Label htmlFor="routingNumber">Routing Number</Label>
                          <Input
                            id="routingNumber"
                            type="text"
                            placeholder="XXXXXXXXX"
                            value={transferForm.routingNumber}
                            onChange={(e) => setTransferForm({ ...transferForm, routingNumber: e.target.value })}
                            required
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
                        <Input
                          id="beneficiaryName"
                          type="text"
                          placeholder="Full name"
                          value={transferForm.beneficiaryName}
                          onChange={(e) => setTransferForm({ ...transferForm, beneficiaryName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="beneficiaryAddress">Beneficiary Address</Label>
                      <Textarea
                        id="beneficiaryAddress"
                        placeholder="Street address, city, state, postal code"
                        value={transferForm.beneficiaryAddress}
                        onChange={(e) => setTransferForm({ ...transferForm, beneficiaryAddress: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}
                
                {/* Wire Transfer Fields */}
                {!isAdmin && transferMethod === 'wire' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="swiftCode">SWIFT/BIC Code</Label>
                        <Input
                          id="swiftCode"
                          type="text"
                          placeholder="AAAABBCCXXX"
                          value={transferForm.swiftCode}
                          onChange={(e) => setTransferForm({ ...transferForm, swiftCode: e.target.value.toUpperCase() })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="iban">IBAN (if applicable)</Label>
                        <Input
                          id="iban"
                          type="text"
                          placeholder="GBXXXXXXXXXXXXXXXXXX"
                          value={transferForm.iban}
                          onChange={(e) => setTransferForm({ ...transferForm, iban: e.target.value.toUpperCase() })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="beneficiaryBankName">Beneficiary Bank Name</Label>
                        <Input
                          id="beneficiaryBankName"
                          type="text"
                          placeholder="Bank name"
                          value={transferForm.beneficiaryBankName}
                          onChange={(e) => setTransferForm({ ...transferForm, beneficiaryBankName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="beneficiaryAddress">Beneficiary Address</Label>
                        <Input
                          id="beneficiaryAddress"
                          type="text"
                          placeholder="City, Country"
                          value={transferForm.beneficiaryAddress}
                          onChange={(e) => setTransferForm({ ...transferForm, beneficiaryAddress: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="beneficiaryBankAddress">Beneficiary Bank Address</Label>
                      <Textarea
                        id="beneficiaryBankAddress"
                        placeholder="Bank street address, city, country"
                        value={transferForm.beneficiaryBankAddress}
                        onChange={(e) => setTransferForm({ ...transferForm, beneficiaryBankAddress: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="intermediaryBankName">Intermediary Bank (Optional)</Label>
                        <Input
                          id="intermediaryBankName"
                          type="text"
                          placeholder="Bank name"
                          value={transferForm.intermediaryBankName}
                          onChange={(e) => setTransferForm({ ...transferForm, intermediaryBankName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="intermediaryBankSwift">Intermediary SWIFT (Optional)</Label>
                        <Input
                          id="intermediaryBankSwift"
                          type="text"
                          placeholder="AAAABBCCXXX"
                          value={transferForm.intermediaryBankSwift}
                          onChange={(e) => setTransferForm({ ...transferForm, intermediaryBankSwift: e.target.value.toUpperCase() })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transferPurpose">Transfer Purpose</Label>
                      <Textarea
                        id="transferPurpose"
                        placeholder="Purpose of this international transfer"
                        value={transferForm.transferPurpose}
                        onChange={(e) => setTransferForm({ ...transferForm, transferPurpose: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

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

        {!isAdmin && (
          <>
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
          </>
        )}
      </Tabs>

      {/* My Transactions Status */}
      {(pendingTransactions.length > 0 || inProgressTransactions.length > 0) && (
        <Card data-testid="card-transaction-status">
          <CardHeader>
            <CardTitle>My Transactions Status</CardTitle>
            <CardDescription>
              Track your pending and in-progress transfers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTransactions.map((transaction: any, index: number) => (
              <Card key={transaction.id} className="border-yellow-500/30" data-testid={`card-pending-${index}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">${parseFloat(transaction.amount).toFixed(2)} Transfer</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description || 'Transfer'} • {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pending Approval
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Waiting for admin approval. You'll be notified when processing begins.
                  </p>
                </CardContent>
              </Card>
            ))}

            {inProgressTransactions.map((transaction: any, index: number) => (
              <Card key={transaction.id} className="border-blue-500/30" data-testid={`card-inprogress-${index}`}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">${parseFloat(transaction.amount).toFixed(2)} Transfer</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description || 'Transfer'} • {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <Badge variant="default">
                      <Clock className="w-3 h-3 mr-1" />
                      In Progress
                    </Badge>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Processing Status</span>
                      <span className="text-muted-foreground">{transaction.progressPercentage}%</span>
                    </div>
                    <Progress value={transaction.progressPercentage} className="h-2" />
                    <div className="grid grid-cols-4 gap-2 mt-2 text-xs text-center">
                      <div className={transaction.progressPercentage >= 25 ? "text-primary font-medium" : "text-muted-foreground"}>
                        {transaction.progressPercentage >= 25 ? "✓" : "○"} 25%
                      </div>
                      <div className={transaction.progressPercentage >= 50 ? "text-primary font-medium" : "text-muted-foreground"}>
                        {transaction.progressPercentage >= 50 ? "✓" : "○"} 50%
                      </div>
                      <div className={transaction.progressPercentage >= 75 ? "text-primary font-medium" : "text-muted-foreground"}>
                        {transaction.progressPercentage >= 75 ? "✓" : "○"} 75%
                      </div>
                      <div className={transaction.progressPercentage >= 100 ? "text-primary font-medium" : "text-muted-foreground"}>
                        {transaction.progressPercentage >= 100 ? "✓" : "○"} 100%
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {transaction.progressPercentage === 25 && "Transaction initiated. Awaiting further verification..."}
                    {transaction.progressPercentage === 50 && "Funds debited from your account. Transfer in progress..."}
                    {transaction.progressPercentage === 75 && "Transfer in transit. Almost complete..."}
                    {transaction.progressPercentage === 100 && "Transfer completed successfully!"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
