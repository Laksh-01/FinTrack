// frontend/components/HeroSection.jsx

import React, { useEffect, useRef } from "react";
import { useUser } from '@clerk/clerk-react';
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner"; // Optional toast notifications
import './HeroImage.css';

export const HeroSection = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const hasSynced = useRef(false);

  // Function to sync user with backend
  const syncUserWithBackend = async () => {
    if (!user) {
      console.log("User object not available. Sync aborted.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sync`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
          imageUrl: user.imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend sync failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ User sync successful from HeroSection:', data.user?.email);
      toast.success(`Synced: ${data.user?.email}`);

    } catch (error) {
      console.error('❌ Failed to sync user from HeroSection:', error);
      toast.error("User sync failed.");
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && user && !hasSynced.current) {
      hasSynced.current = true;
      syncUserWithBackend();
    }
  }, [isLoaded, isSignedIn, user]);

  // Scroll animation for image
  const imageRef = useRef(null);
  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

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
  }, []);

  return (
    <section className="pt-40 pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Manage Your Finances <br /> with Intelligence
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          An AI-powered financial management platform that helps you track,
          analyze, and optimize your spending with real-time insights.
        </p>

        {/* <div className="flex justify-center space-x-4">
          <Link to="/v1/dashboard">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>

          <a
            href="/v1/dashboard"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="outline" className="px-8">
              Watch Demo
            </Button> 
           </a>
        </div> */}

        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div ref={imageRef} className="hero-image">
            <img
              src="/banner3.png"
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
