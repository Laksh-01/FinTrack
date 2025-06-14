import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import CreateAccountDrawer from './CreateAccountDrawer';
import { AccountCard } from './AccountCard';
import { Card, CardContent } from '../../components/ui/card';
import { Plus } from 'lucide-react';
import { toast } from "sonner";
import BudgetProgress from './BudgetProgress';
import { Suspense } from 'react';
import DashboardOverview from './DashboardOverview';

const DashboardPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useUser();
  const [transactions,setTransaction] = useState([]);
  const clerkUserId = user?.id;

  const [budgetInfo, setBudgetInfo] = useState({
    amount: null,
    currentExpenses: null
  });

  const getAccounts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/get-accounts`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ clerkUserId })
      });

      if (!response.ok) throw new Error('Failed to fetch accounts');

      const result = await response.json();
      setAccounts(result.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };



  const getTransactions = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/get-data`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ clerkUserId })
      });

      if (!response.ok) throw new Error('Failed to fetch accounts');
      const result = await response.json();
      setTransaction(result.transactions);

      // setAccounts(result.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultAccount = accounts?.find((acc) => acc.isDefault);
  const id = defaultAccount?.id;

  const handleUpdateDefault = async (accountId) => {
    if (!clerkUserId) return;
    setUpdating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/update-default-accounts`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ accountId, clerkUserId }),
      });

      if (!response.ok) throw new Error('Failed to update default account');

      toast.success("Default account updated successfully!");
      await getAccounts();
    } catch (error) {
      toast.error("Failed to update default account.");
    } finally {
      setUpdating(false);
    }
  };

  const fetchBudget = async () => {
     setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/get-budget`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ clerkUserId, accountId: id }),
      });

      if (!response.ok) throw new Error('Failed to fetch budget');

      const data = await response.json();
    
        setBudgetInfo({
          amount: data.budget?.amount ,
          currentExpenses: data?.currentExpenses
        });
    
    } catch (error) {
      console.error('Error fetching budget:', error);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clerkUserId) {
      getAccounts();
    }
  }, [clerkUserId]);

  useEffect(() => {
    if (clerkUserId && id) {
      fetchBudget();
    }
  }, [clerkUserId, id]);
  useEffect(() => {
    if (clerkUserId ) {
      getTransactions();
    }
  }, [clerkUserId]);

  return (
    <div className='p-5'>
      <div className="flex items-center justify-between mb-5 px-5 mt-23">
        <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
  Dashboard
</h1>

      </div>
      {/* Budget Progress */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetInfo.amount}
          currentExpenses={budgetInfo.currentExpenses}
          onBudgetUpdate={fetchBudget}
          loading={loading}
        />
      )}

      {/* Overview */}
      <Suspense fallback={"Loading Overview..."}>
        <DashboardOverview 
        accounts = {accounts} 
        transactions = {transactions}
        ></DashboardOverview>

      </Suspense>



      {/* Accounts Grid */}

      <div className="px-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer onAccountCreated={getAccounts}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer m-[10px]">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
                <Plus className="h-10 w-10 mb-2" />
                <p className="text-sm font-medium">Add new Account</p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>

          {loading ? (
            <p className="text-muted-foreground">Loading accounts...</p>
          ) : (
            accounts.map((account) => (
              <AccountCard
                className="m-[10px]"
                key={account.id}
                account={account}
                onUpdate={handleUpdateDefault}
                isLoading={updating}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
