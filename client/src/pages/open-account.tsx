import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, PiggyBank, Building2, ArrowLeft, CheckCircle2 } from "lucide-react";
import bgPattern from "@assets/banking-background.jpg";
import { AddressInput } from "@/components/address-input";

const accountOpeningSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  accountType: z.enum(["checking", "savings", "business"]),
  initialDeposit: z.string().min(1, "Initial deposit is required").default("0"),
  username: z.string().min(4, "Username must be at least 4 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AccountOpeningForm = z.infer<typeof accountOpeningSchema>;

export default function OpenAccount() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [accountDetails, setAccountDetails] = useState<any>(null);

  const form = useForm<AccountOpeningForm>({
    resolver: zodResolver(accountOpeningSchema),
    defaultValues: {
      accountType: "checking",
      initialDeposit: "0",
      username: "",
      password: "",
      confirmPassword: "",
      country: "Australia",
      state: "",
      city: "",
      postalCode: "",
      address: "",
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: AccountOpeningForm) => {
      const response = await apiRequest("POST", "/api/accounts/open", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setAccountDetails(data);
      setIsSuccess(true);
      toast({
        title: "Success!",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AccountOpeningForm) => {
    createAccountMutation.mutate(data);
  };

  const accountTypes = [
    {
      value: "checking",
      label: "Checking Account",
      icon: CreditCard,
      description: "Perfect for everyday banking with unlimited transactions",
      features: ["No monthly fees", "Free debit card", "Online & mobile banking"],
    },
    {
      value: "savings",
      label: "Savings Account",
      icon: PiggyBank,
      description: "Earn competitive interest on your savings",
      features: ["High interest rate", "No minimum balance", "FDIC insured"],
    },
    {
      value: "business",
      label: "Business Account",
      icon: Building2,
      description: "Comprehensive banking for your business needs",
      features: ["Business debit card", "Merchant services", "Cash management"],
    },
  ];

  if (isSuccess && accountDetails) {
    const { accounts = [], username } = accountDetails;
    
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
        
        <Card className="w-full max-w-4xl relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Accounts Created Successfully!</CardTitle>
            <CardDescription>
              Your accounts in all three regions have been set up. Please wait for admin approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                <strong>Pending Approval:</strong> Your account registration is awaiting admin approval. Once approved, you can sign in with your credentials.
              </p>
            </div>

            <div className="grid gap-4 p-6 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="text-lg font-mono font-bold">{username}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {accounts.map((account: any, index: number) => {
                const regionName = account.region === 'AU' ? 'Australia' : account.region === 'US' ? 'United States' : 'New Zealand';
                return (
                  <Card key={index} className="overflow-hidden">
                    <div className="bg-primary/10 px-4 py-2">
                      <h4 className="font-semibold text-center">{regionName}</h4>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Account Number</p>
                        <p className="text-sm font-mono font-bold">{account.accountNumber}</p>
                      </div>
                      
                      {account.bsb && (
                        <div>
                          <p className="text-xs text-muted-foreground">BSB</p>
                          <p className="text-sm font-mono font-bold">{account.bsb}</p>
                        </div>
                      )}
                      
                      {account.routingNumber && (
                        <div>
                          <p className="text-xs text-muted-foreground">Routing Number</p>
                          <p className="text-sm font-mono font-bold">{account.routingNumber}</p>
                        </div>
                      )}
                      
                      {account.branchCode && (
                        <div>
                          <p className="text-xs text-muted-foreground">Branch Code</p>
                          <p className="text-sm font-mono font-bold">{account.branchCode}</p>
                        </div>
                      )}
                      
                      {account.swiftCode && (
                        <div>
                          <p className="text-xs text-muted-foreground">SWIFT Code</p>
                          <p className="text-sm font-mono font-bold">{account.swiftCode}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-muted-foreground">Account Type</p>
                        <p className="text-sm font-semibold capitalize">{account.accountType}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Important:</strong> Please save these account details securely. Once your accounts are approved by an administrator, you can sign in using your username and password.
              </p>
            </div>

            <div className="flex gap-4">
              <Button className="flex-1" onClick={() => window.location.href = '/api/login'}>
                Try Signing In
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-4 md:p-8">
      <div 
        className="fixed inset-0 z-0" 
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.92)), url(${bgPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/'}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Open Your Account</CardTitle>
            <CardDescription>
              Join thousands of satisfied customers banking with Fundamental Financial Credit
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Choose Your Account Type</h3>
                <Form {...form}>
                  <FormField
                    control={form.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid gap-4 md:grid-cols-3"
                          >
                            {accountTypes.map((type) => (
                              <label
                                key={type.value}
                                className={`relative flex cursor-pointer rounded-lg border-2 p-6 hover-elevate ${
                                  field.value === type.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border"
                                }`}
                              >
                                <RadioGroupItem value={type.value} className="sr-only" />
                                <div className="flex flex-col gap-3">
                                  <type.icon className="h-8 w-8 text-primary" />
                                  <h4 className="font-semibold">{type.label}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {type.description}
                                  </p>
                                  <ul className="space-y-1 text-xs">
                                    {type.features.map((feature, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <CheckCircle2 className="h-3 w-3 text-primary mt-0.5" />
                                        <span>{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </label>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button onClick={() => setStep(2)} className="w-full" size="lg">
                    Continue
                  </Button>
                </Form>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Personal Information</h3>
                <Form {...form}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-dob" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <AddressInput
                    country={form.watch("country")}
                    postalCode={form.watch("postalCode")}
                    city={form.watch("city")}
                    state={form.watch("state")}
                    addressLine1={form.watch("address")}
                    onCountryChange={(value) => form.setValue("country", value)}
                    onPostalCodeChange={(value) => form.setValue("postalCode", value)}
                    onCityChange={(value) => form.setValue("city", value)}
                    onStateChange={(value) => form.setValue("state", value)}
                    onAddressLine1Change={(value) => form.setValue("address", value)}
                    showAddress
                    showCountry
                  />

                  <FormField
                    control={form.control}
                    name="initialDeposit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Deposit (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} data-testid="input-deposit" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  </div>
                </Form>
              </div>
            )}

            {step === 3 && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <h3 className="text-xl font-semibold">Create Your Login Credentials</h3>
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} data-testid="input-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} data-testid="input-confirm-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Note:</strong> Your application will create accounts in all three regions (USA, Australia, and New Zealand) automatically. Each account will have unique account numbers and region-specific identifiers.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={createAccountMutation.isPending}
                      data-testid="button-submit-account"
                    >
                      {createAccountMutation.isPending ? "Creating Accounts..." : "Open Accounts"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
