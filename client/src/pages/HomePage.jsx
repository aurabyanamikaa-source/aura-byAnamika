import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { selectSettings } from '../store/slices/settingsSlice';
import api from '../services/api';

import HeroSection from '../components/home/HeroSection';
import CategoriesSection from '../components/home/CategoriesSection';
import FeaturedProductsSection from '../components/home/FeaturedProductsSection';
import {
  AdSection, MostSellingSection, FlashSaleSection,
  ReviewsSection, NewsletterSection, BlogSection, GallerySection
} from '../components/home/HomeSections';

const SECTION_MAP = {
  hero: HeroSection,
  categories: CategoriesSection,
  products: FeaturedProductsSection,
  ad: AdSection,
  mostSelling: MostSellingSection,
  flashSale: FlashSaleSection,
  reviews: ReviewsSection,
  newsletter: NewsletterSection,
  blog: BlogSection,
  gallery: GallerySection,
};

export default function HomePage() {
  const settings = useSelector(selectSettings);
  const [sections, setSections] = useState([
    { key: 'hero', isEnabled: true, order: 0, config: {} },
    { key: 'categories', isEnabled: true, order: 1, config: {} },
    { key: 'products', isEnabled: true, order: 2, config: {} },
    { key: 'ad', isEnabled: true, order: 3, config: {} },
    { key: 'mostSelling', isEnabled: true, order: 4, config: {} },
    { key: 'flashSale', isEnabled: true, order: 5, config: {} },
    { key: 'reviews', isEnabled: true, order: 6, config: {} },
    { key: 'newsletter', isEnabled: true, order: 7, config: {} },
    { key: 'blog', isEnabled: true, order: 8, config: {} },
    { key: 'gallery', isEnabled: true, order: 9, config: {} },
  ]);

  useEffect(() => {
    api.get('/homepage').then(r => {
      if (r.data.data?.length) {
        setSections(r.data.data.sort((a, b) => a.order - b.order));
      }
    }).catch(() => {});
  }, []);

  return (
    <>
      <Helmet>
        <title>{settings.meta_title || `${settings.store_name} - Premium Fashion & Apparel`}</title>
        <meta name="description" content={settings.meta_description || 'Shop the latest fashion trends.'} />
        <meta property="og:title" content={settings.meta_title || settings.store_name} />
        <meta property="og:description" content={settings.meta_description} />
      </Helmet>

      {sections
        .filter(s => s.isEnabled)
        .sort((a, b) => a.order - b.order)
        .map(section => {
          const Component = SECTION_MAP[section.key];
          if (!Component) return null;
          return <Component key={section.key} config={section.config || {}} />;
        })
      }
    </>
  );
}
