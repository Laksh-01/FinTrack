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
  <Route path="/" element={<Navigate to="/app" replace />} />

  <Route path="/app/*" element={<Page />}>
    <Route path="v1/dashboard" element={<Dashboard />} />
    <Route path="transaction/create" element={<TransactionPage />} />
    <Route path="transaction/edit/:accountId" element={<TransactionPage />} />
    <Route path="account/:accountId" element={<AccountPage />} />
    <Route path="*" element={<PageNotFound />} />
  </Route>

  {/* Fallback route if /app doesn't match */}
  <Route path="*" element={<PageNotFound />} />
</Routes>


  );
}

export default App;