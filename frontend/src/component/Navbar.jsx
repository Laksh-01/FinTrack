import React, { useEffect } from "react";
import { Button } from "../../components/ui/button";
import { PenBox, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";

const REDIRECT_URL = import.meta.env.VITE_REDIRECT_URL;

const Header = () => {

  const { isLoaded, user } = useUser();
  return (
    <header className="fixed top-0 w-full bg-black-100 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
       

      <a href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
  FinTrack
</a>



        <div className="hidden md:flex items-center space-x-8">
          <SignedOut>
            <a href="#features" className="text-2xl font-bold text-pink-400 hover:text-pink-300 transition-colors">
              Features
            </a>
            <a href="#testimonials" className="text-2xl font-bold text-pink-400 hover:text-pink-300 transition-colors">
              Testimonials
            </a>
          </SignedOut>
        </div>

        <div className="flex items-center space-x-4">
          <SignedIn redirectUrl={REDIRECT_URL}>
            <Link to="/app/v1/dashboard">
              <Button variant="outline">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link to="/transaction/create">
              <Button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
  <PenBox size={18} className="text-purple-500" />
  <span className="hidden md:inline bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold text-1xl">
    Add Transaction
  </span>
</Button>

            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton redirectUrl={REDIRECT_URL}>
              <Button variant="outline" >Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
