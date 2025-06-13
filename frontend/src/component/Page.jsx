import React from 'react'
import Navbar from './Navbar'
import { HeroSection } from './HeroSection'
import { StatsData } from './StatsData';

export const Page = () => {
  return (
    <>
      <Navbar/>
      <HeroSection />
      <StatsData/>
    </>
  );
};
