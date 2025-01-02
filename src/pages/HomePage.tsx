import React from 'react';
import { Hero } from '../components/Hero';
import { FeaturedTeachers } from '../components/FeaturedTeachers';

export function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedTeachers />
    </>
  );
}