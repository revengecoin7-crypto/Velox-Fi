import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useCreateTransaction, 
  useUpdateTransaction, 
  useGetTransaction, 
  useListAccounts,
  getListTransactionsQueryKey, 
  getGetTransactionQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const transactionSchema = z.object({
  accountId: z.coerce.number().min(1, "Account is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional().nullable(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

const EXPENSE_CATEGORIES = [
  "Housing", "Transportation", "Food", "Utilities", "Insurance", 
  "Medical", "Savings", "Personal", "Entertainment", "Other"
];

const INCOME_CATEGORIES = [
  "Salary", "Freelance", "Investment", "Gift", "Other"
];

export default function TransactionsForm() {
  const { id } = useParams();
  const isEditing = Boolean(id && id !== "new");
  const transactionId = isEditing ? parseInt(id!) : 0;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading: isLoadingAccounts } = useListAccounts();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  
  const { data: transaction, isLoading: isLoadingTransaction } = useGetTransaction(transactionId, { 
    query: { enabled: isEditing, queryKey: getGetTransactionQueryKey(transactionId) } 
  });

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: 0,
      amount: 0,
      type: "expense",
      category: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const selectedType = form.watch("type");
  const categories = selectedType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (transaction && isEditing && initializedForId.current !== transactionId) {
      initializedForId.current = transactionId;
      form.reset({
        accountId: transaction.accountId,
        amount: transaction.amount,
        type: transaction.type as "income" | "expense",
        category: transaction.category,
        description: transaction.description,
        date: transaction.date.split('T')[0],
        notes: transaction.notes || "",
      });
    }
  }, [transaction, isEditing, transactionId, form]);

  useEffect(() => {
    // If no account is selected and accounts are loaded, select the first one
    if (!form.getValues("accountId") && accounts && accounts.length > 0 && !isEditing) {
      form.setValue("accountId", accounts[0].id);
    }
  }, [accounts, form, isEditing]);

  const onSubmit = (data: TransactionFormValues) => {
    if (isEditing) {
      updateTransaction.mutate(
        { id: transactionId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetTransactionQueryKey(transactionId) });
            toast({ title: "Transaction updated successfully" });
            setLocation("/transactions");
          },
          onError: (err) => {
            toast({ title: "Failed to update transaction", description: err.error, variant: "destructive" });
          }
        }
      );
    } else {
      createTransaction.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
            toast({ title: "Transaction created successfully" });
            setLocation("/transactions");
          },
          onError: (err) => {
            toast({ title: "Failed to create transaction", description: err.error, variant: "destructive" });
          }
        }
      );
    }
  };

  const isPending = createTransaction.isPending || updateTransaction.isPending;

  if ((isEditing && isLoadingTransaction) || isLoadingAccounts) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-48 h-8" />
        <Card><CardContent className="p-6"><Skeleton className="w-full h-96" /></CardContent></Card>
      </div>
    );
  }

  if (accounts && accounts.length === 0) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold">No Accounts Found</h2>
        <p className="text-muted-foreground">You need to create an account before you can add transactions.</p>
        <Button onClick={() => setLocation("/accounts/new")}>Create Account</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/transactions")} data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight">
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select 
                        onValueChange={(val) => {
                          field.onChange(val);
                          // Reset category when type changes
                          form.setValue("category", "");
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-transaction-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                          <Input type="number" step="0.01" className="pl-7 text-lg font-mono" {...field} data-testid="input-transaction-amount" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Grocery Store" {...field} data-testid="input-transaction-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account</FormLabel>
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger data-testid="select-transaction-account">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts?.map(acc => (
                            <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-transaction-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-transaction-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any extra details here..." {...field} value={field.value || ""} data-testid="input-transaction-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setLocation("/transactions")} data-testid="button-cancel-transaction">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} data-testid="button-submit-transaction">
                  {isPending ? "Saving..." : (isEditing ? "Update Transaction" : "Add Transaction")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
