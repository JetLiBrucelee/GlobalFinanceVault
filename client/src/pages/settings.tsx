import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Settings</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card data-testid="card-profile">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20" data-testid="avatar-profile">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold" data-testid="text-name">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-muted-foreground" data-testid="text-email">
                {user?.email}
              </p>
              {user?.isAdmin && (
                <Badge className="mt-2" data-testid="badge-admin">Administrator</Badge>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">First Name</p>
              <p className="text-base" data-testid="text-first-name">{user?.firstName || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Name</p>
              <p className="text-base" data-testid="text-last-name">{user?.lastName || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email Address</p>
              <p className="text-base" data-testid="text-email-display">{user?.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p className="text-base" data-testid="text-member-since">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-AU') : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card data-testid="card-security">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Account Status</p>
              <p className="text-sm text-muted-foreground">Your account is currently active</p>
            </div>
            <Badge variant="default" data-testid="badge-status">Active</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline" disabled data-testid="button-2fa">
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card data-testid="card-preferences">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your banking experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates about your account</p>
            </div>
            <Button variant="outline" disabled data-testid="button-notifications">
              Coming Soon
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Transaction Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified of all transactions</p>
            </div>
            <Button variant="outline" disabled data-testid="button-alerts">
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
