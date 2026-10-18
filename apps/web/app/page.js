// import components
import MoreToLove from "@/app/components/home/moreToLove/MoreToLove";
import Banner1 from "./components/banner/Banner1";
import Banner2 from "./components/banner/Banner2";
import BestDeals from "./components/home/bestDeals/BestDeals";
import FeaturedProducts from "./components/home/featuredProducts/FeaturedProducts";
import Hero from "./components/home/hero/Hero";
import Brand from "./components/home/brand/Brand";
import Newsletter from "./components/newsletter/Newsletter";

export default function Home() {
  return (
    <main className="flex flex-col gap-8 md:gap-10 xl:gap-12">
      <Hero />
      <Brand />
      <BestDeals />
      <Banner1 />
      <FeaturedProducts />
      <Banner2 />
      <MoreToLove />
      <div className="bg-sky-blue ">
        <Newsletter />
      </div>
    </main>
  );
}
