import { useListTransactions, useDeleteTransaction, getListTransactionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import { PlusIcon, EditIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, FilterIcon, SearchIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";

export default function Transactions() {
  const { data: transactions, isLoading } = useListTransactions();
  const deleteTransaction = useDeleteTransaction();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteTransaction.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        toast({ title: "Transaction deleted" });
      },
      onError: (err) => {
        toast({ title: "Failed to delete transaction", description: err.error, variant: "destructive" });
      },
      onSettled: () => setDeletingId(null)
    });
  };

  const filteredTransactions = transactions?.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Every cent, accounted for.</p>
        </div>
        <Link href="/transactions/new">
          <Button data-testid="button-new-transaction">
            <PlusIcon className="w-4 h-4 mr-2" /> Add Transaction
          </Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search descriptions or categories..." 
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            data-testid="input-search-transactions"
          />
        </div>
        <Button variant="outline" size="icon">
          <FilterIcon className="w-4 h-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="w-32 h-4" />
                      <Skeleton className="w-24 h-3" />
                    </div>
                  </div>
                  <Skeleton className="w-20 h-6" />
                </div>
              ))}
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="divide-y">
              {filteredTransactions.map(t => (
                <div key={t.id} className="p-4 flex items-center justify-between group hover:bg-muted/30 transition-colors" data-testid={`row-transaction-${t.id}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                      {t.type === 'income' ? <ArrowUpIcon className="w-5 h-5" /> : <ArrowDownIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="bg-secondary px-2 py-0.5 rounded text-xs">{t.category}</span>
                        <span>•</span>
                        <span>{formatDate(t.date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={`text-lg font-mono font-bold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-500' : ''}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setLocation(`/transactions/${t.id}`)} data-testid={`button-edit-transaction-${t.id}`}>
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" data-testid={`button-delete-transaction-${t.id}`}>
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(t.id)}
                              disabled={deletingId === t.id}
                            >
                              {deletingId === t.id ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">No transactions found</h3>
              <p className="text-muted-foreground mt-1 mb-4 max-w-sm">
                {searchTerm ? "No transactions match your search." : "Record your first transaction to start tracking."}
              </p>
              {!searchTerm && (
                <Link href="/transactions/new">
                  <Button data-testid="button-empty-state-new-transaction">Add Transaction</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
