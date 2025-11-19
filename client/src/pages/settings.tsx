import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Cat, Dog, Bird } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const avatarIcons: Record<string, typeof Cat> = {
  cat: Cat,
  dog: Dog,
  duck: Bird,
};

const avatarNames: Record<string, string> = {
  cat: "Cat",
  dog: "Dog",
  duck: "Duck",
};

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'cat');

  const updateAvatarMutation = useMutation({
    mutationFn: async (avatar: string) => {
      return await apiRequest("PATCH", '/api/user/avatar', { avatar });
    },
    onSuccess: () => {
      toast({
        title: "Avatar Updated",
        description: "Your profile avatar has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update avatar",
        variant: "destructive",
      });
    },
  });

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    updateAvatarMutation.mutate(avatar);
  };

  const AvatarIcon = avatarIcons[selectedAvatar];

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
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center" data-testid="avatar-profile">
              <AvatarIcon className="h-12 w-12 text-primary" />
            </div>
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

          <div className="space-y-3">
            <p className="font-medium">Profile Avatar</p>
            <div className="flex gap-3">
              {Object.entries(avatarIcons).map(([key, Icon]) => (
                <Button
                  key={key}
                  variant={selectedAvatar === key ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleAvatarSelect(key)}
                  disabled={updateAvatarMutation.isPending}
                  data-testid={`button-avatar-${key}`}
                  className="flex flex-col gap-2 h-auto p-4"
                >
                  <Icon className="h-8 w-8" />
                  <span className="text-xs">{avatarNames[key]}</span>
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Choose your profile avatar. Changes apply immediately.
            </p>
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
