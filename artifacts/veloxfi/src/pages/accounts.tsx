import { useListAccounts, useDeleteAccount, getListAccountsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { PlusIcon, EditIcon, TrashIcon, CreditCard, Building, PiggyBank, Briefcase } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const iconMap = {
  checking: Building,
  savings: PiggyBank,
  credit: CreditCard,
  investment: Briefcase,
};

export default function Accounts() {
  const { data: accounts, isLoading } = useListAccounts();
  const deleteAccount = useDeleteAccount();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteAccount.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAccountsQueryKey() });
        toast({ title: "Account deleted" });
      },
      onError: (err) => {
        toast({ title: "Failed to delete account", description: err.error, variant: "destructive" });
      },
      onSettled: () => setDeletingId(null)
    });
  };

  const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.type === 'credit' ? -acc.balance : acc.balance), 0) || 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">Manage your balances across institutions.</p>
        </div>
        <Link href="/accounts/new">
          <Button data-testid="button-new-account">
            <PlusIcon className="w-4 h-4 mr-2" /> Add Account
          </Button>
        </Link>
      </div>

      <Card className="bg-primary text-primary-foreground border-none">
        <CardContent className="p-6">
          <div className="text-sm font-medium opacity-80 uppercase tracking-wider">Net Worth</div>
          <div className="text-4xl font-bold font-mono mt-2 tracking-tighter">
            {isLoading ? <Skeleton className="w-48 h-10 bg-primary-foreground/20" /> : formatCurrency(totalBalance)}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : accounts && accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(account => {
            const Icon = iconMap[account.type as keyof typeof iconMap] || Building;
            return (
              <Card key={account.id} className="group overflow-hidden flex flex-col" data-testid={`card-account-${account.id}`}>
                <div 
                  className="h-2 w-full" 
                  style={{ backgroundColor: account.color || 'hsl(var(--primary))' }} 
                />
                <CardHeader className="pb-2 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-muted rounded-md text-muted-foreground">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setLocation(`/accounts/${account.id}`)} data-testid={`button-edit-account-${account.id}`}>
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" data-testid={`button-delete-account-${account.id}`}>
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {account.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account and all associated transactions.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(account.id)}
                              disabled={deletingId === account.id}
                            >
                              {deletingId === account.id ? "Deleting..." : "Delete Account"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardTitle className="mt-4">{account.name}</CardTitle>
                  <CardDescription className="capitalize text-xs tracking-wider">{account.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold font-mono tracking-tight ${account.type === 'credit' ? 'text-destructive' : ''}`}>
                    {formatCurrency(account.balance, account.currency)}
                  </div>
                  {account.institution && (
                    <div className="text-sm text-muted-foreground mt-1 truncate">
                      {account.institution}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Building className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold">No accounts yet</h3>
            <p className="text-muted-foreground mt-1 mb-4 max-w-sm">
              Add your first bank account, credit card, or investment portfolio to start tracking your net worth.
            </p>
            <Link href="/accounts/new">
              <Button data-testid="button-empty-state-new-account">Add First Account</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
