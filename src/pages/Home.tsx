
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import GrowShareSection from '@/components/home/GrowShareSection';
import ImpactStatsSection from '@/components/home/ImpactStatsSection';
import CommunityStoriesSection from '@/components/home/CommunityStoriesSection';
import UserWelcome from '@/components/UserWelcome';


const Home = () => {
  return (
    <div className="min-h-screen">
      <UserWelcome className="absolute top-20 right-4 z-10" showBadge={true} />
      <HeroSection />
      <HowItWorksSection />
      <GrowShareSection />
      <ImpactStatsSection />
      <CommunityStoriesSection />
    </div>
  );
};

export default Home;
