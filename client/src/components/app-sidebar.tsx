import { Home, CreditCard, ArrowLeftRight, FileText, Settings, LogOut, ShieldCheck, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@shared/schema";
import bankLogo from "@assets/bank-logo.jpg";

import dogAvatar from "@assets/stock_images/cute_cartoon_dog_ava_f554a6f2.jpg";
import catAvatar from "@assets/stock_images/cute_cartoon_cat_ava_1ac2277f.jpg";
import birdAvatar from "@assets/stock_images/cute_cartoon_bird_av_0615cb5c.jpg";
import lionAvatar from "@assets/stock_images/cute_cartoon_lion_av_c9fb81d3.jpg";
import bearAvatar from "@assets/stock_images/cute_cartoon_bear_av_40b41f20.jpg";
import cowAvatar from "@assets/stock_images/cute_cartoon_cow_ava_ce54458e.jpg";
import rabbitAvatar from "@assets/stock_images/cute_cartoon_rabbit__9c34f387.jpg";
import pandaAvatar from "@assets/stock_images/cute_cartoon_panda_a_863bd583.jpg";

const avatarImages: Record<string, string> = {
  dog: dogAvatar,
  cat: catAvatar,
  bird: birdAvatar,
  lion: lionAvatar,
  bear: bearAvatar,
  cow: cowAvatar,
  rabbit: rabbitAvatar,
  panda: pandaAvatar,
};

interface AppSidebarProps {
  user?: User;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const [location] = useLocation();
  const avatarImage = user?.avatar ? avatarImages[user.avatar] || avatarImages.cat : avatarImages.cat;

  const userMenuItems = [
    { title: "Dashboard", url: "/", icon: Home, testId: "link-dashboard", iconColor: "text-blue-500" },
    { title: "My Cards", url: "/cards", icon: CreditCard, testId: "link-cards", iconColor: "text-purple-500" },
    { title: "Transfers", url: "/transfers", icon: ArrowLeftRight, testId: "link-transfers", iconColor: "text-green-500" },
    { title: "Statements", url: "/statements", icon: FileText, testId: "link-statements", iconColor: "text-orange-500" },
    { title: "Settings", url: "/settings", icon: Settings, testId: "link-settings", iconColor: "text-gray-500" },
  ];

  const adminMenuItems = [
    { title: "Admin Dashboard", url: "/admin", icon: ShieldCheck, testId: "link-admin-dashboard", iconColor: "text-blue-500" },
    { title: "Manage Users", url: "/admin/users", icon: Users, testId: "link-admin-users", iconColor: "text-purple-500" },
    { title: "Transactions", url: "/admin/transactions", icon: ArrowLeftRight, testId: "link-admin-transactions", iconColor: "text-green-500" },
    { title: "Access Codes", url: "/admin/access-codes", icon: Shield, testId: "link-admin-access-codes", iconColor: "text-orange-500" },
    { title: "Settings", url: "/settings", icon: Settings, testId: "link-settings", iconColor: "text-gray-500" },
  ];

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <img src={bankLogo} alt="Logo" className="h-8 w-8 rounded" data-testid="logo-icon" />
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight" data-testid="text-brand-name">Fundamental</span>
            <span className="text-sm font-semibold text-muted-foreground leading-tight">Financial Credit</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {!user?.isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Banking</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link href={item.url} data-testid={item.testId}>
                        <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {user?.isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-primary font-semibold">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location === item.url}
                      className={location === item.url ? "bg-primary/15 text-primary font-medium" : ""}
                    >
                      <Link href={item.url} data-testid={item.testId}>
                        <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0" data-testid="avatar-user">
            <img src={avatarImage} alt="User avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => window.location.href = '/api/logout'}
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
