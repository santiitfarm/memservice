import { Suspense } from "react";
import Hero from "./components/home/hero/Hero";
import SliderProduct from "./components/sliderProduct/SliderProduct";
import CategoryGrid from "./components/home/categoryGrid/CategoryGrid";
import Banner1 from "./components/banner/Banner1";
import Banner2 from "./components/banner/Banner2";
import ProductRail, { ProductRailSkeleton } from "./components/home/ProductRail";
import TestimonialsSlider from "./components/home/testimonials/TestimonialsSlider";
import Newsletter from "./components/newsletter/Newsletter";
import {
  getHomeData,
  getBestDeals,
  getTrendingProducts,
  getFeaturedProducts,
  getOfferProducts,
} from "@/lib/cms";

// Server-rendered home page with live CMS layout
export default async function HomePage() {
  const [homeData, bestDeals, trending, featured, offers] = await Promise.all([
    getHomeData(),
    getBestDeals(6),
    getTrendingProducts(6),
    getFeaturedProducts(6),
    getOfferProducts(6),
  ]);

  const rawSections = homeData?.layout || [];
  const enabledSections = rawSections
    .filter((sec) => sec.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Render a specific section based on type/key
  const renderSection = (section, index) => {
    const key = section.key || `${section.type}-${index}`;

    switch (section.type) {
      case "hero_slider":
        return (
          <Hero
            key={key}
            sliders={homeData?.sliders || []}
            categories={homeData?.categories || []}
          />
        );

      case "brand_carousel":
        return (
          <SliderProduct
            key={key}
            brandData={homeData?.brands || []}
          />
        );

      case "category_grid":
        return (
          <CategoryGrid
            key={key}
            categories={homeData?.categories || []}
          />
        );

      case "flash_deals":
        return (
          <Suspense key={key} fallback={<ProductRailSkeleton />}>
            <ProductRail
              title={section.title || "Best Deals of the Week"}
              subtitle={section.subtitle || "Limited time discounts on top pharmaceuticals"}
              viewAllUrl="/best-seller"
              products={bestDeals}
            />
          </Suspense>
        );

      case "banner_grid":
        // Distinguish between home-grid-1 and home-grid-2 based on config or key
        if (section.key === "home-grid-2" || section.config?.group === "home-grid-2") {
          return <Banner2 key={key} banners={homeData?.banners || []} />;
        }
        return <Banner1 key={key} banners={homeData?.banners || []} />;

      case "product_rail":
        // Determine whether this rail is Trending, Featured, or Offers
        const railKey = (section.key || "").toLowerCase();
        let railProducts = trending;
        let viewAll = "/trending";
        let defaultTitle = "Trending Products";

        if (railKey.includes("featured") || section.config?.sort === "rating") {
          railProducts = featured;
          viewAll = "/shop?sort=popular";
          defaultTitle = "Featured Healthcare Products";
        } else if (railKey.includes("offer") || section.config?.tags === "offer") {
          railProducts = offers;
          viewAll = "/offer";
          defaultTitle = "Special Promotional Offers";
        }

        return (
          <Suspense key={key} fallback={<ProductRailSkeleton />}>
            <ProductRail
              title={section.title || defaultTitle}
              subtitle={section.subtitle}
              viewAllUrl={viewAll}
              products={railProducts}
            />
          </Suspense>
        );

      case "testimonials":
        return (
          <TestimonialsSlider
            key={key}
            testimonials={homeData?.testimonials || []}
          />
        );

      case "features_ribbon":
      case "newsletter":
        return (
          <div key={key} className="bg-primary">
            <Newsletter />
          </div>
        );

      default:
        return null;
    }
  };

  // If DB contains configured sections, render them in exact order
  if (enabledSections.length > 0) {
    return (
      <main className="flex flex-col gap-10 md:gap-14 xl:gap-16 pt-4 sm:pt-6">
        {enabledSections.map((sec, idx) => renderSection(sec, idx))}

        {/* Ensure newsletter is always rendered at bottom if not in layout */}
        {!enabledSections.some((s) => s.type === "newsletter" || s.type === "features_ribbon") && (
          <div className="bg-primary">
            <Newsletter />
          </div>
        )}
      </main>
    );
  }

  // Fallback default home section order when layout is not yet customized
  return (
    <main className="flex flex-col gap-10 md:gap-14 xl:gap-16 pt-4 sm:pt-6">
      {/* 1. Hero pure image slider + category rail */}
      <Hero
        sliders={homeData?.sliders || []}
        categories={homeData?.categories || []}
      />

      {/* 2. Shop by Brand Swiper Carousel */}
      <SliderProduct brandData={homeData?.brands || []} />

      {/* 3. Dynamic Categories Grid */}
      <CategoryGrid categories={homeData?.categories || []} />

      {/* 4. Best Deals Product Rail */}
      <Suspense fallback={<ProductRailSkeleton />}>
        <ProductRail
          title="Best Deals of the Week"
          subtitle="Top discounts on prescription and OTC medicines"
          viewAllUrl="/best-seller"
          products={bestDeals}
        />
      </Suspense>

      {/* 5. Banner Grid 1 */}
      <Banner1 banners={homeData?.banners || []} />

      {/* 6. Trending Products Rail */}
      <Suspense fallback={<ProductRailSkeleton />}>
        <ProductRail
          title="Trending Products"
          subtitle="Frequently purchased by customers this week"
          viewAllUrl="/trending"
          products={trending}
        />
      </Suspense>

      {/* 7. Banner Grid 2 */}
      <Banner2 banners={homeData?.banners || []} />

      {/* 8. Offers & Featured Rail */}
      <Suspense fallback={<ProductRailSkeleton />}>
        <ProductRail
          title="Featured Offers & Essentials"
          subtitle="Handpicked quality healthcare items"
          viewAllUrl="/offer"
          products={offers.length > 0 ? offers : featured}
        />
      </Suspense>

      {/* 9. Verified Customer Testimonials */}
      <TestimonialsSlider testimonials={homeData?.testimonials || []} />

      {/* 10. Newsletter */}
      <div className="bg-primary">
        <Newsletter />
      </div>
    </main>
  );
}
