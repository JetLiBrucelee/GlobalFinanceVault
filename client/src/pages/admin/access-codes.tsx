import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AccessCode } from "@shared/schema";

export default function AdminAccessCodes() {
  const { toast } = useToast();

  const { data: accessCodes, isLoading } = useQuery<AccessCode[]>({
    queryKey: ["/api/admin/access-codes"],
  });

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/access-codes/generate", {});
    },
    onSuccess: (data: any) => {
      toast({
        title: "Access Code Generated",
        description: `Code: ${data.code}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/access-codes"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: "Access code copied to clipboard",
    });
  };

  const getStatusInfo = (accessCode: AccessCode) => {
    if (accessCode.isUsed) {
      return { label: "Used", variant: "default" as const };
    }
    const isExpired = new Date(accessCode.expiresAt) < new Date();
    if (isExpired) {
      return { label: "Expired", variant: "destructive" as const };
    }
    return { label: "Active", variant: "secondary" as const };
  };

  const activeCount = accessCodes?.filter(c => 
    !c.isUsed && new Date(c.expiresAt) > new Date()
  ).length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Access Code Management</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Generate and manage user access codes
          </p>
        </div>
        <Button
          onClick={() => generateCodeMutation.mutate()}
          disabled={generateCodeMutation.isPending}
          data-testid="button-generate"
        >
          <Plus className="mr-2 h-4 w-4" />
          Generate New Code
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card data-testid="card-total">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total">
                {accessCodes?.length || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-active">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-active">
                {activeCount}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-used">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-used">
                {accessCodes?.filter(c => c.isUsed).length || 0}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Access Codes Table */}
      <Card data-testid="card-codes">
        <CardHeader>
          <CardTitle>All Access Codes</CardTitle>
          <CardDescription>
            Manage and monitor access codes for user login
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : accessCodes && accessCodes.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessCodes.map((accessCode, index) => {
                    const status = getStatusInfo(accessCode);
                    return (
                      <TableRow key={accessCode.id} data-testid={`row-code-${index}`}>
                        <TableCell className="font-mono text-lg tracking-wider" data-testid={`cell-code-${index}`}>
                          {accessCode.code}
                        </TableCell>
                        <TableCell data-testid={`cell-status-${index}`}>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground" data-testid={`cell-created-${index}`}>
                          {new Date(accessCode.createdAt!).toLocaleDateString('en-AU')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground" data-testid={`cell-expires-${index}`}>
                          {new Date(accessCode.expiresAt).toLocaleDateString('en-AU')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground" data-testid={`cell-used-${index}`}>
                          {accessCode.usedAt 
                            ? new Date(accessCode.usedAt).toLocaleDateString('en-AU')
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(accessCode.code)}
                            data-testid={`button-copy-${index}`}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4" data-testid="text-no-codes">
                No access codes generated yet
              </p>
              <Button
                onClick={() => generateCodeMutation.mutate()}
                disabled={generateCodeMutation.isPending}
                data-testid="button-generate-empty"
              >
                <Plus className="mr-2 h-4 w-4" />
                Generate First Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card data-testid="card-info">
        <CardHeader>
          <CardTitle>About Access Codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">What are Access Codes?</h4>
            <p className="text-sm text-muted-foreground">
              Access codes are single-use verification codes that users must enter after logging in 
              to activate their account. This provides an additional layer of security and control 
              over who can access the banking system.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">How to Use</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Generate a new access code by clicking the "Generate New Code" button</li>
              <li>Share the code with the user who needs to activate their account</li>
              <li>Codes expire after 7 days and can only be used once</li>
              <li>Users must enter the code after logging in to complete their registration</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
