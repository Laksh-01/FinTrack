import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Navbar from '../component/Navbar';
import TransactionTable from './TransactionTable';
import PageNotFound from './PageNotFound';
import PaginationControls from '../component/PaginationControls';
import { useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { BarLoader } from 'react-spinners';
import AccountChart from './AccountChart';

const AccountPage = () => {
  const { accountId } = useParams();
  const [accountData, setAccountData] = useState(null); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accountDataAll, setAccountDataAll] = useState(null);
  const [paginationData, setPaginationData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20; 

  const { user } = useUser();
  const clerkUserId = user?.id;

  const getAccountData = useCallback(async (pageToFetch) => {
    if (!clerkUserId || !accountId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/get-accounts-with-Transaction?page=${pageToFetch}&pageSize=${pageSize}`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ clerkUserId, accountId }),
      });

      if (response.status === 404) throw new Error('Account not found');
      if (!response.ok) throw new Error('Failed to fetch account data.');

      const result = await response.json();
      if (result.success) {
        setAccountData(result.data);
        setPaginationData(result.pagination);
      } else {
        throw new Error(result.error || 'An unknown error occurred.');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [clerkUserId, accountId, pageSize]);

  const getAccountAllData = useCallback(async () => {
    if (!clerkUserId || !accountId) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/get-accounts-with-Transaction-all`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ clerkUserId, accountId }),
      });

      if (response.status === 404) throw new Error('Account not found');
      if (!response.ok) throw new Error('Failed to fetch account data.');

      const result = await response.json();
      if (result.success) {
        setAccountDataAll(result.data);
      } else {
        throw new Error(result.error || 'An unknown error occurred.');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      console.error(err);
    }
  }, [clerkUserId, accountId]);

  useEffect(() => {
    getAccountData(currentPage);
    getAccountAllData();
  }, [currentPage, getAccountData, getAccountAllData]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= paginationData.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const refreshData = () => {
  if (currentPage !== 1) {
    setCurrentPage(1);
  } else {
    getAccountData(1);
    getAccountAllData();
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BarLoader color="#9333ea" />
      </div>
    );
  }

  if (error || !accountData) {
    return <PageNotFound message={error || "Could not load account data."} />;
  }

  return (
    <div>
      <Navbar />
      <div className="space-y-8 px-5 pt-30 pb-20">
        <div className="flex gap-4 items-end justify-between">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">
              {accountData.name}
            </h1>
            <p className="text-muted-foreground">
              {accountData.type.charAt(0).toUpperCase() + accountData.type.slice(1).toLowerCase()} Account
            </p>
          </div>
          <div className="text-right pb-2">
            <div className="text-xl sm:text-2xl font-bold">
              ₹{parseFloat(accountData.balance).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">
              {accountData._count.transactions} Total Transactions
            </p>
          </div>
        </div>

        <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}>
          <AccountChart transactions={accountDataAll?.transactions || []}  onDataChange={refreshData} />
        </Suspense>

        <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}>
          <TransactionTable 
            transactions={accountData.transactions || []} 
            onDataChange={refreshData}
          />
        </Suspense>

        {paginationData?.totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={paginationData.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default AccountPage;
