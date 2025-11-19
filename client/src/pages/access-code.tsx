import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AccessCode() {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 12) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 12-digit access code",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/auth/verify-access-code", { code });
      toast({
        title: "Access Granted",
        description: "Your account is now active!",
      });
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Invalid Access Code",
        description: error.message || "The access code you entered is invalid or has expired",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950 p-4">
      <Card className="w-full max-w-md shadow-xl border-2" data-testid="card-access-code">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" data-testid="icon-shield" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-title">Access Code Required</CardTitle>
          <CardDescription data-testid="text-description">
            Please enter the 12-digit access code provided by your administrator to activate your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Access Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456789012"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                maxLength={12}
                className="text-center text-2xl tracking-widest font-mono"
                disabled={isSubmitting}
                data-testid="input-access-code"
              />
              <p className="text-xs text-muted-foreground text-center" data-testid="text-helper">
                Contact your administrator if you haven't received an access code
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || code.length !== 12}
              data-testid="button-verify"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Access Code"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={async () => {
                  await apiRequest("POST", "/api/logout", {});
                  window.location.href = '/login';
                }}
                data-testid="button-logout"
              >
                Log Out
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
