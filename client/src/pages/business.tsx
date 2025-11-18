import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Business() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Business Banking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Comprehensive banking solutions for your business needs.
            </p>
            <div className="text-center py-12">
              <p className="text-lg mb-4">Business Banking services coming soon!</p>
              <Button onClick={() => window.location.href = '/api/login'}>
                Sign In to Access
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
