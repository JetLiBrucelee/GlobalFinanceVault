import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";
import bgPattern from "@assets/banking-background.jpg";

export default function AdminLogin() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 z-0" 
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.92)), url(${bgPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      <div className="w-full max-w-md relative z-10">
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/'}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Shield className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-3xl">Admin Access</CardTitle>
            <CardDescription>
              Authorized personnel only
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-center text-destructive">
                This area is restricted to authorized administrators only. 
                All access attempts are logged and monitored.
              </p>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => window.location.href = '/api/login?admin=true'}
              data-testid="button-admin-login"
            >
              <Shield className="h-4 w-4 mr-2" />
              Sign In as Administrator
            </Button>

            <div className="text-center">
              <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Regular user? Sign in here
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
