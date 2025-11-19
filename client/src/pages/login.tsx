import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, Eye, EyeOff, Lock, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import bankLogo from "@assets/bank-logo.jpg";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/login", { username, password });
      toast({
        title: "Login Successful",
        description: "Welcome to Fundamental Financial Credit",
      });
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <img src={bankLogo} alt="Fundamental Financial Credit" className="h-12 w-12 object-contain bg-white rounded-full p-1" />
            <span className="text-2xl font-bold">Fundamental Financial Credit</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Secure Banking<br />
              At Your Fingertips
            </h1>
            <p className="text-blue-100 text-lg max-w-md">
              Access your accounts securely from anywhere in the world. Managing your finances has never been easier.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">256-bit</div>
              <div className="text-sm text-blue-200">Encryption</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-blue-200">Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold">FDIC</div>
              <div className="text-sm text-blue-200">Insured</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 dark:from-slate-950 dark:via-blue-950/10 dark:to-slate-950">
        <Card className="w-full max-w-md shadow-2xl border-2" data-testid="card-login">
          <CardHeader className="space-y-2 text-center pb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" data-testid="icon-shield" />
            </div>
            <CardTitle className="text-2xl font-bold" data-testid="text-title">
              Sign In to Your Account
            </CardTitle>
            <CardDescription data-testid="text-description">
              Enter your credentials to access your banking dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                    data-testid="input-username"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => toast({
                      title: "Password Reset",
                      description: "Please contact your administrator to reset your password",
                    })}
                    data-testid="button-forgot-password"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isSubmitting}
                    data-testid="input-password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !username || !password}
                data-testid="button-login"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="space-y-4 pt-4 border-t">
                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setLocation('/open-account')}
                  data-testid="button-open-account"
                >
                  Open New Account
                </Button>
              </div>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 flex-shrink-0 text-primary" />
                <p>
                  Your connection is secure. We use bank-grade encryption to protect your information.
                  Never share your password with anyone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
