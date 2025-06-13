import React from 'react';
import { Link } from 'react-router-dom';

function PageNotFound() {
  return (
    <div className="bg-[#0f172a] min-h-screen flex flex-col items-center justify-center text-white">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl mb-8">Oops! Page Not Found.</p>
      <Link to="/" className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-500">
        Go Home
      </Link>
    </div>
  );
}

export default PageNotFound;