import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Save, Edit2, X, CheckCircle } from "lucide-react";
import type { User, Account, Transaction } from "@shared/schema";

interface UserDetails {
  user: User;
  accounts: Account[];
  recentTransactions: Transaction[];
}

interface UserDetailsDrawerProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDrawer({ userId, open, onOpenChange }: UserDetailsDrawerProps) {
  const { toast } = useToast();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  
  const [profileForm, setProfileForm] = useState<Partial<User>>({});
  const [accountForm, setAccountForm] = useState<Partial<Account>>({});

  const { data: userDetails, isLoading } = useQuery<UserDetails>({
    queryKey: [`/api/admin/users/${userId}/details`],
    enabled: !!userId && open,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}`, updates);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/details`] });
      setEditingProfile(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ accountId, updates }: { accountId: string; updates: Partial<Account> }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/accounts/${accountId}`, updates);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Account updated successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/details`] });
      setEditingAccountId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const approveUserMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/admin/users/${userId}/approve`, {});
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User approved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/details`] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEditProfile = () => {
    if (userDetails?.user) {
      setProfileForm({
        firstName: userDetails.user.firstName || "",
        lastName: userDetails.user.lastName || "",
        email: userDetails.user.email || "",
        phone: userDetails.user.phone || "",
        addressLine1: userDetails.user.addressLine1 || "",
        addressLine2: userDetails.user.addressLine2 || "",
        city: userDetails.user.city || "",
        state: userDetails.user.state || "",
        postalCode: userDetails.user.postalCode || "",
        country: userDetails.user.country || "",
      });
      setEditingProfile(true);
    }
  };

  const handleSaveProfile = () => {
    updateUserMutation.mutate(profileForm);
  };

  const handleEditAccount = (account: Account) => {
    setAccountForm({
      accountNumber: account.accountNumber,
      bsb: account.bsb || "",
      routingNumber: account.routingNumber || "",
      branchCode: account.branchCode || "",
      swiftCode: account.swiftCode || "",
      accountType: account.accountType,
    });
    setEditingAccountId(account.id);
  };

  const handleSaveAccount = (accountId: string) => {
    updateAccountMutation.mutate({ accountId, updates: accountForm });
  };

  if (!userId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]" data-testid="dialog-user-details-drawer">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4">
            <span>User Details</span>
            {userDetails && !userDetails.user.isApproved && (
              <Button
                size="sm"
                onClick={() => approveUserMutation.mutate()}
                disabled={approveUserMutation.isPending}
                data-testid="button-approve-user"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve User
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            View and edit user profile, accounts, and activity
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          {isLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : userDetails ? (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
                <TabsTrigger value="accounts" data-testid="tab-accounts">Accounts</TabsTrigger>
                <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>User profile and contact details</CardDescription>
                    </div>
                    {!editingProfile && (
                      <Button size="sm" variant="outline" onClick={handleEditProfile} data-testid="button-edit-profile">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingProfile ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={profileForm.firstName || ""}
                              onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                              data-testid="input-first-name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={profileForm.lastName || ""}
                              onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                              data-testid="input-last-name"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={profileForm.email || ""}
                              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                              data-testid="input-email"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={profileForm.phone || ""}
                              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                              data-testid="input-phone"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="addressLine1">Address Line 1</Label>
                          <Input
                            id="addressLine1"
                            value={profileForm.addressLine1 || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, addressLine1: e.target.value })}
                            data-testid="input-address-line1"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="addressLine2">Address Line 2</Label>
                          <Input
                            id="addressLine2"
                            value={profileForm.addressLine2 || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, addressLine2: e.target.value })}
                            data-testid="input-address-line2"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={profileForm.city || ""}
                              onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                              data-testid="input-city"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State/Province</Label>
                            <Input
                              id="state"
                              value={profileForm.state || ""}
                              onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                              data-testid="input-state"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input
                              id="postalCode"
                              value={profileForm.postalCode || ""}
                              onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                              data-testid="input-postal-code"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={profileForm.country || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                            data-testid="input-country"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile} disabled={updateUserMutation.isPending} data-testid="button-save-profile">
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setEditingProfile(false)} data-testid="button-cancel-profile">
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Name:</span> {userDetails.user.firstName} {userDetails.user.lastName}</div>
                        <div><span className="font-medium">Email:</span> {userDetails.user.email}</div>
                        <div><span className="font-medium">Phone:</span> {userDetails.user.phone || "Not provided"}</div>
                        <div><span className="font-medium">Username:</span> {userDetails.user.username}</div>
                        <div className="col-span-2"><span className="font-medium">Address:</span> {userDetails.user.addressLine1 || "Not provided"}</div>
                        {userDetails.user.addressLine2 && <div className="col-span-2">{userDetails.user.addressLine2}</div>}
                        <div><span className="font-medium">City:</span> {userDetails.user.city || "Not provided"}</div>
                        <div><span className="font-medium">State:</span> {userDetails.user.state || "Not provided"}</div>
                        <div><span className="font-medium">Postal Code:</span> {userDetails.user.postalCode || "Not provided"}</div>
                        <div><span className="font-medium">Country:</span> {userDetails.user.country || "Not provided"}</div>
                        <div className="col-span-2">
                          <span className="font-medium">Status:</span>{" "}
                          {userDetails.user.isApproved ? (
                            <Badge variant="default" className="bg-green-600 ml-2">Approved</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-600 ml-2">Pending Approval</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="accounts" className="space-y-4 mt-4">
                {userDetails.accounts.map((account) => (
                  <Card key={account.id} data-testid={`account-card-${account.region}`}>
                    <CardHeader className="flex flex-row items-center justify-between gap-2">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {account.region === "AU" && "🇦🇺 Australia"}
                          {account.region === "US" && "🇺🇸 United States"}
                          {account.region === "NZ" && "🇳🇿 New Zealand"}
                        </CardTitle>
                        <CardDescription>{account.accountType} Account</CardDescription>
                      </div>
                      {editingAccountId !== account.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAccount(account)}
                          data-testid={`button-edit-account-${account.region}`}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {editingAccountId === account.id ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Account Number</Label>
                              <Input
                                value={accountForm.accountNumber || ""}
                                onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                                data-testid={`input-account-number-${account.region}`}
                              />
                            </div>
                            {account.region === "AU" && (
                              <div className="space-y-2">
                                <Label>BSB</Label>
                                <Input
                                  value={accountForm.bsb || ""}
                                  onChange={(e) => setAccountForm({ ...accountForm, bsb: e.target.value })}
                                  maxLength={6}
                                  data-testid="input-bsb"
                                />
                              </div>
                            )}
                            {account.region === "US" && (
                              <div className="space-y-2">
                                <Label>Routing Number</Label>
                                <Input
                                  value={accountForm.routingNumber || ""}
                                  onChange={(e) => setAccountForm({ ...accountForm, routingNumber: e.target.value })}
                                  maxLength={9}
                                  data-testid="input-routing-number"
                                />
                              </div>
                            )}
                            {account.region === "NZ" && (
                              <div className="space-y-2">
                                <Label>Branch Code</Label>
                                <Input
                                  value={accountForm.branchCode || ""}
                                  onChange={(e) => setAccountForm({ ...accountForm, branchCode: e.target.value })}
                                  maxLength={6}
                                  data-testid="input-branch-code"
                                />
                              </div>
                            )}
                            <div className="space-y-2">
                              <Label>SWIFT Code</Label>
                              <Input
                                value={accountForm.swiftCode || ""}
                                onChange={(e) => setAccountForm({ ...accountForm, swiftCode: e.target.value })}
                                maxLength={11}
                                data-testid={`input-swift-code-${account.region}`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Account Type</Label>
                              <Input
                                value={accountForm.accountType || ""}
                                onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })}
                                data-testid="input-account-type"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSaveAccount(account.id)}
                              disabled={updateAccountMutation.isPending}
                              data-testid={`button-save-account-${account.region}`}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingAccountId(null)}
                              data-testid="button-cancel-account"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="font-medium">Account Number:</span> {account.accountNumber}</div>
                          {account.bsb && <div><span className="font-medium">BSB:</span> {account.bsb}</div>}
                          {account.routingNumber && <div><span className="font-medium">Routing:</span> {account.routingNumber}</div>}
                          {account.branchCode && <div><span className="font-medium">Branch:</span> {account.branchCode}</div>}
                          <div><span className="font-medium">SWIFT:</span> {account.swiftCode}</div>
                          <div><span className="font-medium">Type:</span> {account.accountType}</div>
                          <div><span className="font-medium">Balance:</span> ${parseFloat(account.balance).toLocaleString()}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Last {userDetails.recentTransactions.length} transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userDetails.recentTransactions.length > 0 ? (
                      <div className="space-y-2 text-sm">
                        {userDetails.recentTransactions.map((tx) => (
                          <div key={tx.id} className="flex justify-between items-center py-2 border-b">
                            <div>
                              <div className="font-medium">{tx.type}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(tx.createdAt!).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${parseFloat(tx.amount).toFixed(2)}</div>
                              <Badge variant={tx.status === "completed" ? "default" : "secondary"} className="text-xs">
                                {tx.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No transactions yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              User not found
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
