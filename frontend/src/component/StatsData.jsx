import React from "react";
import { Link } from "react-router-dom";
// LOGIC FIX: Import SignedIn and SignedOut
import { SignUpButton, SignedIn, SignedOut } from "@clerk/clerk-react";

import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "../data/landing";

import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

export const StatsData = () => { // Renamed component for clarity
  return (
    // Your styling is preserved
    <main className="min-h-screen bg-background text-foreground">
      {/* 1. Hero Section */}
      <section className="py-24 sm:py-32 mt-[-90px]">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-400 sm:text-6xl">
            Take Full Control of Your <span className="text-primary">Finances</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who are already managing their money smarter with FinTrack. Track spending, create budgets, and achieve your financial goals with ease.
          </p>
          <div className="mt-10">
            {/* --- LOGIC FIX START --- */}
            <SignedOut>
              <SignUpButton
                mode="modal"
                afterSignUpUrl="/v1/dashboard"
                afterSignInUrl="/v1/dashboard"
              >
                <Button size="lg" className="animate-bounce cursor-pointer">
                  Start Free Trial
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link to="/v1/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            </SignedIn>
            {/* --- LOGIC FIX END --- */}
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="py-16 mt-[-80px] ">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 divide-gray-200">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center pt-4 md:pt-0 " >
                <div className="text-4xl font-bold text-blue-500 mb-2 ">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4  mt-[-40px] ">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-gray-400 sm:text-4xl">
              Everything you need, all in one place
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our comprehensive suite of tools helps you manage every aspect of your financial life.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <Card key={index} className="p-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 text-center">
                <CardContent className="space-y-4 pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    {feature.icon && <feature.icon className="h-8 w-8 text-primary " />}
                  </div>
                  <h3 className="text-xl font-semibold text-blue-500">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 mt-[-30px]">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-gray-400  sm:text-4xl">
              Getting Started is Simple
            </h2>
          </div>
          <div className="mt-14 max-w-2xl mx-auto">
            <ol className="relative border-l border-gray-200">
              {howItWorksData.map((step, index) => (
                <li key={index} className="mb-12 ml-8">
                  <span className="absolute flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full -left-5 ring-8 ring-background "> {/* Changed ring-white to ring-background */}
                    {step.icon && <step.icon className="w-5 h-5 text-primary" />}
                  </span>
                  <h3 className="mb-1 text-xl font-semibold text-gray-400">{step.title}</h3>
                  <p className="text-base font-normal text-muted-foreground">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/10 mt-[-30px]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-gray-400 sm:text-4xl">
              Loved by Users Worldwide
            </h2>
          </div>
          <div className="mt-16 columns-1 gap-8 sm:columns-2 lg:columns-3">
            {testimonialsData.map((testimonial, index) => (
              <div key={index} className="break-inside-avoid mb-8">
                <Card className="p-6 h-full shadow-lg">
                  <CardContent className="pt-4 flex flex-col h-full">
                    <p className="text-muted-foreground flex-grow italic">"{testimonial.quote}"</p>
                    <div className="flex items-center pt-6 mt-4 border-t">
                      <Avatar>
                        <AvatarImage src={testimonial.avatarUrl || `https://avatar.vercel.sh/${testimonial.name}.png`} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="font-semibold text-foreground">{testimonial.name}</div> {/* Changed text-gray-900 */}
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Final CTA Section */}
      <section className="py-20 ">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-blue-500 sm:text-4xl ">
            Ready to Take Control?
          </h2>
          <p className="text-slate-300 mt-4 mb-8 max-w-2xl mx-auto">
            Start your free trial today. No credit card required. Cancel anytime.
          </p>
          {/* --- LOGIC FIX START --- */}
          <SignedOut>
            <SignUpButton
              mode="modal"
              afterSignUpUrl="/dashboard"
              afterSignInUrl="/dashboard"
            >
              <Button size="lg" className=" hover:bg-gray-400 cursor-pointer">
                Get Started for Free
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link to="/v1/dashboard">
              <Button size="lg">Open Dashboard</Button>
            </Link>
          </SignedIn>
      
        </div>
      </section>
    </main>
  );
};