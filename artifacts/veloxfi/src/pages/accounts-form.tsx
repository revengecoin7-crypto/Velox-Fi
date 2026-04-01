import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateAccount, useUpdateAccount, useGetAccount, getListAccountsQueryKey, getGetAccountQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["checking", "savings", "credit", "investment"]),
  balance: z.coerce.number().default(0),
  currency: z.string().min(1, "Currency is required").default("USD"),
  institution: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export default function AccountsForm() {
  const { id } = useParams();
  const isEditing = Boolean(id && id !== "new");
  const accountId = isEditing ? parseInt(id!) : 0;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  
  const { data: account, isLoading: isLoadingAccount } = useGetAccount(accountId, { 
    query: { enabled: isEditing, queryKey: getGetAccountQueryKey(accountId) } 
  });

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "checking",
      balance: 0,
      currency: "USD",
      institution: "",
      color: "#00e5ff", // matches primary hsl
    },
  });

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (account && isEditing && initializedForId.current !== accountId) {
      initializedForId.current = accountId;
      form.reset({
        name: account.name,
        type: account.type as "checking" | "savings" | "credit" | "investment",
        balance: account.balance,
        currency: account.currency,
        institution: account.institution || "",
        color: account.color || "#00e5ff",
      });
    }
  }, [account, isEditing, accountId, form]);

  const onSubmit = (data: AccountFormValues) => {
    if (isEditing) {
      updateAccount.mutate(
        { id: accountId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetAccountQueryKey(accountId) });
            toast({ title: "Account updated successfully" });
            setLocation("/accounts");
          },
          onError: (err) => {
            toast({ title: "Failed to update account", description: err.error, variant: "destructive" });
          }
        }
      );
    } else {
      createAccount.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
            toast({ title: "Account created successfully" });
            setLocation("/accounts");
          },
          onError: (err) => {
            toast({ title: "Failed to create account", description: err.error, variant: "destructive" });
          }
        }
      );
    }
  };

  const isPending = createAccount.isPending || updateAccount.isPending;

  if (isEditing && isLoadingAccount) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-48 h-8" />
        <Card><CardContent className="p-6"><Skeleton className="w-full h-64" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/accounts")} data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight">
            {isEditing ? "Edit Account" : "Add Account"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update your account details." : "Connect a new financial account."}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Chase Checking" {...field} data-testid="input-account-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-account-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                          <SelectItem value="credit">Credit Card</SelectItem>
                          <SelectItem value="investment">Investment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Balance</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} data-testid="input-account-balance" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Chase, Vanguard" {...field} value={field.value || ""} data-testid="input-account-institution" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-account-currency" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accent Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          {...field} 
                          value={field.value || "#00e5ff"} 
                          className="w-12 h-10 p-1 cursor-pointer"
                          data-testid="input-account-color"
                        />
                        <Input 
                          type="text" 
                          {...field} 
                          value={field.value || "#00e5ff"} 
                          className="flex-1 font-mono uppercase"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setLocation("/accounts")} data-testid="button-cancel-account">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} data-testid="button-submit-account">
                  {isPending ? "Saving..." : (isEditing ? "Update Account" : "Add Account")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
