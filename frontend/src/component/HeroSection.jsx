// frontend/components/HeroSection.jsx

import React, { useEffect, useRef } from "react";
import { useUser } from '@clerk/clerk-react'; // Make sure SignInButton is imported if you change "Get Started" later
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";

import './HeroImage.css';

export const HeroSection = () => {

  const { isLoaded, isSignedIn, user } = useUser();
  const hasSynced = useRef(false); // Prevents sending the API call multiple times

  
  useEffect(() => {
    // This is the function that will call our backend API
    const syncUserWithBackend = async () => {
      // Safety check: ensure the 'user' object exists before trying to access its properties.
      if (!user) {
        console.log("User object is not available. Sync aborted.");
        return;
      }

      try {
        console.log("Attempting to sync user with backend from HeroSection...");
        
        // Ensure your backend server is running and accessible at this URL
        // Make sure this URL matches your backend route exactly (e.g., /api/users/sync)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/sync`, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkUserId: user.id, // Use user.id for the Clerk User ID
            email: user.primaryEmailAddress?.emailAddress, // Use optional chaining for safety
            name: user.fullName,
            imageUrl: user.imageUrl,
          }),
        });

        if (!response.ok) {
          throw new Error(`Backend sync failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ User sync successful from HeroSection:', data.user?.email);

      } catch (error) {
        console.error('❌ Failed to sync user from HeroSection:', error);
      }
    };

    // This is the condition that triggers the API call
    // We check if Clerk is loaded, the user is signed in, AND the 'user' object is available.
    if (isLoaded && isSignedIn && user && !hasSynced.current) {
      // Mark as "sync attempted" for this session
      hasSynced.current = true;
      // Call the function to send details to the database
      syncUserWithBackend();
    }

  }, [isLoaded, isSignedIn, user]); // Re-run this effect when the user's auth state changes


  // Scroll effect logic
  const imageRef = useRef(null);
  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return; // Guard clause if ref isn't set yet

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // This scroll effect only needs to run once on mount

  return (
    <section className=" pt-40 pb-20 px-4">
      <div className="container mx-auto text-center ">
        <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
  Manage Your Finances <br /> with Intelligence
</h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          An AI-powered financial management platform that helps you track,
          analyze, and optimize your spending with real-time insights.
        </p>
        <div className="flex justify-center space-x-4">
          {/* 
            Consider changing this button based on login state for better UX.
            If the user is logged out, it should be a SignInButton.
            If logged in, it can link to the dashboard.
            Your Navbar likely already handles this, which is good.
          */}
          <Link to="/dashboard">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
          <a href="" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="px-8">
              Watch Demo
            </Button>
          </a>
        </div>
        <div className="hero-image-wrapper mt-5 md:mt-0 ">
          <div ref={imageRef} className="hero-image">
            <img
              src="/banner3.png" // Changed path for public folder
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
};