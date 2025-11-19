import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Lock, Unlock, Ban, Trash2, DollarSign, Plus, Minus, CheckCircle, XCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Account, Transaction } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import adminBg from "@assets/stock_images/online_banking_servi_775ecb2d.jpg";

interface UserDetails {
  user: User;
  accounts: Account[];
  recentTransactions: Transaction[];
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'block' | 'lock' | 'delete' | null;
    user: User | null;
  }>({ open: false, action: null, user: null });
  
  const [fundDialog, setFundDialog] = useState<{
    open: boolean;
    type: 'fund' | 'debit' | null;
    user: User | null;
  }>({ open: false, type: null, user: null });

  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    userId: string | null;
  }>({ open: false, userId: null });
  
  const [amount, setAmount] = useState('');

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: userDetails, isLoading: isLoadingDetails } = useQuery<UserDetails>({
    queryKey: [`/api/admin/users/${detailDialog.userId}/details`],
    enabled: !!detailDialog.userId && detailDialog.open,
  });

  const blockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/block`, {});
    },
    onSuccess: () => {
      toast({
        title: "User Blocked",
        description: "User has been blocked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setActionDialog({ open: false, action: null, user: null });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/unblock`, {});
    },
    onSuccess: () => {
      toast({
        title: "User Unblocked",
        description: "User has been unblocked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const lockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/lock`, {});
    },
    onSuccess: () => {
      toast({
        title: "User Locked",
        description: "User has been locked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setActionDialog({ open: false, action: null, user: null });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unlockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/unlock`, {});
    },
    onSuccess: () => {
      toast({
        title: "User Unlocked",
        description: "User has been unlocked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/admin/users/${userId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been permanently deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setActionDialog({ open: false, action: null, user: null });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fundAccountMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: string }) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/fund`, { amount });
    },
    onSuccess: () => {
      toast({
        title: "Account Funded",
        description: `Successfully added funds to the account`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounts"] });
      setFundDialog({ open: false, type: null, user: null });
      setAmount('');
    },
    onError: (error: Error) => {
      toast({
        title: "Operation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const debitAccountMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: string }) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/debit`, { amount });
    },
    onSuccess: () => {
      toast({
        title: "Account Debited",
        description: `Successfully debited funds from the account`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/accounts"] });
      setFundDialog({ open: false, type: null, user: null });
      setAmount('');
    },
    onError: (error: Error) => {
      toast({
        title: "Operation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "User Approved",
        description: "User account has been approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disapproveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/disapprove`, {});
    },
    onSuccess: () => {
      toast({
        title: "User Disapproved",
        description: "User account has been disapproved",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFundDebit = () => {
    if (!fundDialog.user || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (fundDialog.type === 'fund') {
      fundAccountMutation.mutate({ userId: fundDialog.user.id, amount });
    } else if (fundDialog.type === 'debit') {
      debitAccountMutation.mutate({ userId: fundDialog.user.id, amount });
    }
  };

  const handleAction = () => {
    if (!actionDialog.user) return;

    switch (actionDialog.action) {
      case 'block':
        blockUserMutation.mutate(actionDialog.user.id);
        break;
      case 'lock':
        lockUserMutation.mutate(actionDialog.user.id);
        break;
      case 'delete':
        deleteUserMutation.mutate(actionDialog.user.id);
        break;
    }
  };

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
        <h1 className="text-3xl font-bold text-white" data-testid="text-page-title">Manage Users</h1>
        <p className="text-gray-300" data-testid="text-page-description">
          View and manage all user accounts
        </p>
      </div>

      {/* Users Table */}
      <Card data-testid="card-users">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {users?.length || 0} total user(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={user.id} data-testid={`row-user-${index}`}>
                      <TableCell className="font-medium" data-testid={`cell-name-${index}`}>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell data-testid={`cell-email-${index}`}>
                        {user.email}
                      </TableCell>
                      <TableCell data-testid={`cell-role-${index}`}>
                        {user.isAdmin ? (
                          <Badge variant="default">Admin</Badge>
                        ) : (
                          <Badge variant="outline">User</Badge>
                        )}
                      </TableCell>
                      <TableCell data-testid={`cell-status-${index}`}>
                        <div className="flex gap-2 flex-wrap">
                          {user.isAdmin ? (
                            <Badge variant="default" className="bg-purple-600">Admin</Badge>
                          ) : user.isApproved ? (
                            <Badge variant="default" className="bg-green-600">Approved</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-600">Pending</Badge>
                          )}
                          {user.isBlocked && (
                            <Badge variant="destructive">Blocked</Badge>
                          )}
                          {user.isLocked && (
                            <Badge variant="secondary">Locked</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground" data-testid={`cell-joined-${index}`}>
                        {new Date(user.createdAt!).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${index}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDetailDialog({ open: true, userId: user.id })}
                              data-testid={`action-view-details-${index}`}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!user.isAdmin && (
                              <>
                                {user.isApproved ? (
                                  <DropdownMenuItem
                                    onClick={() => disapproveUserMutation.mutate(user.id)}
                                    data-testid={`action-disapprove-${index}`}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Disapprove Account
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => approveUserMutation.mutate(user.id)}
                                    data-testid={`action-approve-${index}`}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve Account
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => setFundDialog({ open: true, type: 'fund', user })}
                              data-testid={`action-fund-${index}`}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Fund Account
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setFundDialog({ open: true, type: 'debit', user })}
                              data-testid={`action-debit-${index}`}
                            >
                              <Minus className="mr-2 h-4 w-4" />
                              Debit Account
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.isBlocked ? (
                              <DropdownMenuItem
                                onClick={() => unblockUserMutation.mutate(user.id)}
                                data-testid={`action-unblock-${index}`}
                              >
                                <Unlock className="mr-2 h-4 w-4" />
                                Unblock User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ open: true, action: 'block', user })}
                                data-testid={`action-block-${index}`}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Block User
                              </DropdownMenuItem>
                            )}
                            {user.isLocked ? (
                              <DropdownMenuItem
                                onClick={() => unlockUserMutation.mutate(user.id)}
                                data-testid={`action-unlock-${index}`}
                              >
                                <Unlock className="mr-2 h-4 w-4" />
                                Unlock Account
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ open: true, action: 'lock', user })}
                                data-testid={`action-lock-${index}`}
                              >
                                <Lock className="mr-2 h-4 w-4" />
                                Lock Account
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setActionDialog({ open: true, action: 'delete', user })}
                              className="text-destructive"
                              data-testid={`action-delete-${index}`}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <AlertDialogContent data-testid="dialog-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === 'block' && 'Block User'}
              {actionDialog.action === 'lock' && 'Lock Account'}
              {actionDialog.action === 'delete' && 'Delete User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === 'block' &&
                `Are you sure you want to block ${actionDialog.user?.firstName} ${actionDialog.user?.lastName}? They will not be able to access their account.`}
              {actionDialog.action === 'lock' &&
                `Are you sure you want to lock ${actionDialog.user?.firstName} ${actionDialog.user?.lastName}'s account? They will need to contact support to unlock it.`}
              {actionDialog.action === 'delete' &&
                `Are you sure you want to permanently delete ${actionDialog.user?.firstName} ${actionDialog.user?.lastName}? This action cannot be undone and will delete all associated data.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={actionDialog.action === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
              data-testid="button-confirm"
            >
              {actionDialog.action === 'block' && 'Block User'}
              {actionDialog.action === 'lock' && 'Lock Account'}
              {actionDialog.action === 'delete' && 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fund/Debit Dialog */}
      <Dialog open={fundDialog.open} onOpenChange={(open) => setFundDialog({ ...fundDialog, open })}>
        <DialogContent data-testid="dialog-fund-debit">
          <DialogHeader>
            <DialogTitle>
              {fundDialog.type === 'fund' ? 'Fund Account' : 'Debit Account'}
            </DialogTitle>
            <DialogDescription>
              {fundDialog.type === 'fund' 
                ? `Add funds to ${fundDialog.user?.firstName} ${fundDialog.user?.lastName}'s account`
                : `Debit funds from ${fundDialog.user?.firstName} ${fundDialog.user?.lastName}'s account`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (AUD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFundDialog({ open: false, type: null, user: null });
                setAmount('');
              }}
              data-testid="button-cancel-fund"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFundDebit}
              disabled={fundAccountMutation.isPending || debitAccountMutation.isPending}
              data-testid="button-confirm-fund"
            >
              {fundDialog.type === 'fund' ? 'Fund Account' : 'Debit Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ ...detailDialog, open })}>
        <DialogContent className="max-w-3xl max-h-[80vh]" data-testid="dialog-user-details">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View account balances and recent transactions
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {isLoadingDetails ? (
              <div className="space-y-4 py-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : userDetails ? (
              <div className="space-y-6 py-4">
                {/* User Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">User Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Name:</span> {userDetails.user.firstName} {userDetails.user.lastName}</div>
                    <div><span className="font-medium">Email:</span> {userDetails.user.email}</div>
                    <div><span className="font-medium">Username:</span> {userDetails.user.username}</div>
                    <div><span className="font-medium">Status:</span> {
                      userDetails.user.isApproved ? 
                        <Badge variant="default" className="bg-green-600 ml-2">Approved</Badge> : 
                        <Badge variant="secondary" className="bg-yellow-600 ml-2">Pending</Badge>
                    }</div>
                  </div>
                </div>

                {/* Accounts */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Accounts ({userDetails.accounts.length})</h3>
                  {userDetails.accounts.length > 0 ? (
                    <div className="space-y-3">
                      {userDetails.accounts.map((account) => (
                        <Card key={account.id}>
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="font-medium">{account.region} Account - {account.accountType}</div>
                                <div className="text-sm text-muted-foreground">Account #: {account.accountNumber}</div>
                                {account.bsb && <div className="text-sm text-muted-foreground">BSB: {account.bsb}</div>}
                                {account.routingNumber && <div className="text-sm text-muted-foreground">Routing: {account.routingNumber}</div>}
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">
                                  ${parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className="text-xs text-muted-foreground">Balance</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No accounts found</p>
                  )}
                </div>

                {/* Recent Transactions */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Recent Transactions (Last 5)</h3>
                  {userDetails.recentTransactions.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userDetails.recentTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="text-sm">
                                {new Date(transaction.createdAt!).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-sm capitalize">{transaction.type}</TableCell>
                              <TableCell className="text-sm">{transaction.description || '-'}</TableCell>
                              <TableCell className="text-sm text-right font-medium">
                                ${parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  transaction.status === 'completed' ? 'default' :
                                  transaction.status === 'pending' ? 'secondary' :
                                  'destructive'
                                }>
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No transactions found</p>
                  )}
                </div>
              </div>
            ) : null}
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialog({ open: false, userId: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
