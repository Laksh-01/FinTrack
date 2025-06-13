// frontend/pages/Dashboard.jsx

import React, { useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';

import Navbar from './Navbar';
import DashboardPage from './DashboardPage';

function Dashboard() {
  return (
    <>
      <Navbar />
      <DashboardPage />
    </>
  );
}

export default Dashboard;