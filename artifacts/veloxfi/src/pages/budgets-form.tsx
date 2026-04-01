import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useCreateBudget, 
  useUpdateBudget, 
  getListBudgetsQueryKey,
} from "@workspace/api-client-react";
// Import useGetBudget if it was available, but it seems it wasn't in the provided list.
// We'll just fetch all budgets and find the right one if editing.
import { useListBudgets } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  limit: z.coerce.number().min(0.01, "Limit must be greater than 0"),
  spent: z.coerce.number().default(0), // Normally calculated, but schema requires it
  period: z.enum(["monthly", "weekly"]),
  color: z.string().optional().nullable(),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

const EXPENSE_CATEGORIES = [
  "Housing", "Transportation", "Food", "Utilities", "Insurance", 
  "Medical", "Savings", "Personal", "Entertainment", "Other"
];

export default function BudgetsForm() {
  const { id } = useParams();
  const isEditing = Boolean(id && id !== "new");
  const budgetId = isEditing ? parseInt(id!) : 0;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: budgets, isLoading: isLoadingBudgets } = useListBudgets({ query: { enabled: isEditing }});
  const budget = budgets?.find(b => b.id === budgetId);

  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: "",
      limit: 0,
      spent: 0,
      period: "monthly",
      color: "#00e5ff",
    },
  });

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (budget && isEditing && initializedForId.current !== budgetId) {
      initializedForId.current = budgetId;
      form.reset({
        category: budget.category,
        limit: budget.limit,
        spent: budget.spent,
        period: budget.period as "monthly" | "weekly",
        color: budget.color || "#00e5ff",
      });
    }
  }, [budget, isEditing, budgetId, form]);

  const onSubmit = (data: BudgetFormValues) => {
    if (isEditing) {
      updateBudget.mutate(
        { id: budgetId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListBudgetsQueryKey() });
            toast({ title: "Budget updated successfully" });
            setLocation("/budgets");
          },
          onError: (err) => {
            toast({ title: "Failed to update budget", description: err.error, variant: "destructive" });
          }
        }
      );
    } else {
      createBudget.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListBudgetsQueryKey() });
            toast({ title: "Budget created successfully" });
            setLocation("/budgets");
          },
          onError: (err) => {
            toast({ title: "Failed to create budget", description: err.error, variant: "destructive" });
          }
        }
      );
    }
  };

  const isPending = createBudget.isPending || updateBudget.isPending;

  if (isEditing && isLoadingBudgets) {
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
        <Button variant="ghost" size="icon" onClick={() => setLocation("/budgets")} data-testid="button-back">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight">
            {isEditing ? "Edit Budget" : "Create Budget"}
          </h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-budget-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spending Limit</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                          <Input type="number" step="0.01" className="pl-7 font-mono" {...field} data-testid="input-budget-limit" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-budget-period">
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
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
                          data-testid="input-budget-color"
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
                <Button type="button" variant="outline" onClick={() => setLocation("/budgets")} data-testid="button-cancel-budget">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} data-testid="button-submit-budget">
                  {isPending ? "Saving..." : (isEditing ? "Update Budget" : "Create Budget")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
