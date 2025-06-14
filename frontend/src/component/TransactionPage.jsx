import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import AddTransactionForm from './AddTransactionForm';
import { defaultCategories } from '../data/category';
import Navbar from './Navbar';
import { useParams } from 'react-router-dom';

const TransactionPage = () => {
  const { accountId } = useParams(); 
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const [initialData , setInitialData] = useState("");

  const clerkUserId = user?.id;

  const getAccounts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/get-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkUserId }),
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


  const getTransaction = async (accountId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transaction/get-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkUserId , accountId }),
      });

      if (!response.ok) throw new Error('Failed to fetch accounts');

      const result = await response.json();
      setInitialData(result.transaction);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clerkUserId) {
      getAccounts();
    }
  }, [clerkUserId]);

  const editId = accountId;


  
  if (editId) {
    getTransaction(editId);
  }


  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto px-5 mt-20">
<h1 className="text-5xl mb-8 font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
  {editId ? "Edit" : "Add"} Transaction
</h1>

        <AddTransactionForm
          accounts={accounts}
          categories={defaultCategories}
          editMode={!!editId}
          initialData = {initialData}
        />
      </div>
    </div>
  );
};

export default TransactionPage;
