import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

import Dashboard from './component/Dashboard';
import PageNotFound from './component/PageNotFound';

import Navbar from './component/Navbar';
import { Page } from './component/Page';
import './App.css';
import AccountPage from './component/AccountPage';
import TransactionPage from './component/TransactionPage';

import ManageInvestments from './component/ManageInvestments';

function App() {
  const { isSignedIn, isLoaded } = useUser();

  
  if (!isLoaded) {
    return (
      <div className="bg-[#0f172a] min-h-screen flex items-center justify-center text-white">
        Initializing Application...
      </div>
    );
  }

  

  return (
    
   <Routes>
      {/* Serve Page on the root path */}
      <Route path="/" element={<Page />} />

      {/* If needed, you can also serve Page on /app */}
      <Route path="/app/*" element={<Page />} />

      {/* Other routes */}
      <Route path="/v1/dashboard" element={<Dashboard />} />
      <Route path="/transaction/create" element={<TransactionPage />} />
      <Route path="/transaction/edit/:accountId" element={<TransactionPage />} />
      <Route path="/account/:accountId" element={<AccountPage />} />
      <Route path="/manage-investments/:accountId" element={<ManageInvestments />} />

      {/* Fallback for any unknown paths */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>

  );
}

export default App;