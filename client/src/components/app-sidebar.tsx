import { Home, CreditCard, ArrowLeftRight, FileText, Settings, LogOut, ShieldCheck, Users, Cat, Dog, Bird, BadgePlus, Beef, Rabbit } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@shared/schema";
import { SiPandas } from "react-icons/si";
import bankLogo from "@assets/bank-logo.jpg";

const avatarIcons: Record<string, any> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  lion: BadgePlus,
  bear: Beef,
  cow: Beef,
  rabbit: Rabbit,
  panda: SiPandas,
};

interface AppSidebarProps {
  user?: User;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const [location] = useLocation();
  const AvatarIcon = user?.avatar ? avatarIcons[user.avatar] || Cat : Cat;

  const userMenuItems = [
    { title: "Dashboard", url: "/", icon: Home, testId: "link-dashboard" },
    { title: "My Cards", url: "/cards", icon: CreditCard, testId: "link-cards" },
    { title: "Transfers", url: "/transfers", icon: ArrowLeftRight, testId: "link-transfers" },
    { title: "Statements", url: "/statements", icon: FileText, testId: "link-statements" },
    { title: "Settings", url: "/settings", icon: Settings, testId: "link-settings" },
  ];

  const adminMenuItems = [
    { title: "Admin Dashboard", url: "/admin", icon: ShieldCheck, testId: "link-admin-dashboard" },
    { title: "Manage Users", url: "/admin/users", icon: Users, testId: "link-admin-users" },
    { title: "Transactions", url: "/admin/transactions", icon: ArrowLeftRight, testId: "link-admin-transactions" },
    { title: "Access Codes", url: "/admin/access-codes", icon: Shield, testId: "link-admin-access-codes" },
    { title: "Settings", url: "/settings", icon: Settings, testId: "link-settings" },
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
                        <item.icon className="h-4 w-4" />
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
                        <item.icon className="h-4 w-4" />
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
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0" data-testid="avatar-user">
            <AvatarIcon className="h-6 w-6 text-primary" />
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
