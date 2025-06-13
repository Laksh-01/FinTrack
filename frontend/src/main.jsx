import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // <-- IMPORT THIS
import './index.css';
import App from './App.jsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { ThemeProvider } from '../components/theme-provider.jsx'; // Assuming this path is correct
import {} from '../components/ui/sonner.jsx';
import { Toaster } from 'sonner';


// It's better to get this from environment variables for security and flexibility
// const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const PUBLISHABLE_KEY = "pk_test_ZGlzdGluY3QtbGFkeWJpcmQtNTYuY2xlcmsuYWNjb3VudHMuZGV2JA"; // Your hardcoded key

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    <Router>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/app"
        appearance={{
          baseTheme: 'dark', 
        }}
      >
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <App /> 
          <Toaster richColors/>
        </ThemeProvider>
      </ClerkProvider>
    </Router>
  </StrictMode>
);