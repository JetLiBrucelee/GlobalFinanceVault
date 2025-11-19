import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import dogAvatar from "@assets/stock_images/cute_cartoon_dog_ava_f554a6f2.jpg";
import catAvatar from "@assets/stock_images/cute_cartoon_cat_ava_1ac2277f.jpg";
import birdAvatar from "@assets/stock_images/colorful_parrot_bird_b2ee6c60.jpg";
import lionAvatar from "@assets/stock_images/majestic_male_lion_f_96255fb6.jpg";
import bearAvatar from "@assets/stock_images/cute_cartoon_bear_av_40b41f20.jpg";
import cowAvatar from "@assets/stock_images/brown_and_white_cow__0d8da049.jpg";
import rabbitAvatar from "@assets/stock_images/cute_cartoon_rabbit__9c34f387.jpg";
import pandaAvatar from "@assets/stock_images/cute_cartoon_panda_a_863bd583.jpg";
import foxAvatar from "@assets/stock_images/cute_cartoon_fox_ava_7f79586d.jpg";
import tigerAvatar from "@assets/stock_images/orange_tiger_face_po_078de77a.jpg";
import penguinAvatar from "@assets/stock_images/cute_cartoon_penguin_0157b1f2.jpg";
import koalaAvatar from "@assets/stock_images/cute_cartoon_koala_a_927f9c54.jpg";
import elephantAvatar from "@assets/stock_images/gray_elephant_face_c_63f27bd2.jpg";

const avatarImages: Record<string, string> = {
  dog: dogAvatar,
  cat: catAvatar,
  bird: birdAvatar,
  lion: lionAvatar,
  bear: bearAvatar,
  cow: cowAvatar,
  rabbit: rabbitAvatar,
  panda: pandaAvatar,
  fox: foxAvatar,
  tiger: tigerAvatar,
  penguin: penguinAvatar,
  koala: koalaAvatar,
  elephant: elephantAvatar,
};

const avatarNames: Record<string, string> = {
  dog: "Dog",
  cat: "Cat",
  bird: "Bird",
  lion: "Lion",
  bear: "Bear",
  cow: "Cow",
  rabbit: "Rabbit",
  panda: "Panda",
  fox: "Fox",
  tiger: "Tiger",
  penguin: "Penguin",
  koala: "Koala",
  elephant: "Elephant",
};

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'cat');
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

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
      setShowAvatarDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update avatar",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
      return await apiRequest("PATCH", '/api/user/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    updateAvatarMutation.mutate(avatar);
  };

  const handleProfileUpdate = () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and last name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate({ firstName: firstName.trim(), lastName: lastName.trim() });
  };

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
            <div 
              className="h-20 w-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center cursor-pointer hover-elevate active-elevate-2"
              data-testid="avatar-profile"
              onClick={() => setShowAvatarDialog(true)}
            >
              <img 
                src={avatarImages[user?.avatar || 'cat']} 
                alt="Profile avatar" 
                className="w-full h-full object-cover"
              />
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

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  data-testid="input-last-name"
                />
              </div>
            </div>
            <Button
              onClick={handleProfileUpdate}
              disabled={updateProfileMutation.isPending || (firstName === user?.firstName && lastName === user?.lastName)}
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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

      {/* Avatar Selection Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose Your Avatar</DialogTitle>
            <DialogDescription>
              Select an avatar to personalize your profile
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
            {Object.entries(avatarImages).map(([key, imageSrc]) => (
              <button
                key={key}
                onClick={() => handleAvatarSelect(key)}
                disabled={updateAvatarMutation.isPending}
                className={`relative rounded-lg overflow-hidden border-2 transition-all hover-elevate active-elevate-2 ${
                  selectedAvatar === key 
                    ? 'border-primary ring-2 ring-primary ring-offset-2' 
                    : 'border-border'
                }`}
                data-testid={`button-avatar-${key}`}
              >
                <div className="aspect-square bg-muted">
                  <img 
                    src={imageSrc} 
                    alt={avatarNames[key]} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm py-2 text-center">
                  <span className="text-sm font-medium">{avatarNames[key]}</span>
                </div>
                {selectedAvatar === key && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAvatarDialog(false)} data-testid="button-cancel-avatar">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
