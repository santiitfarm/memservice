import Category from "./Category";
import HeroSlider from "./HeroSlider";

async function Hero() {
  const response = await fetch(`${process.env.API_URL}/api/slider`);
  const data = await response.json();
  const sliderData = data?.slider;

  return (
    <main className="w-full h-full container mx-auto px-3 lg:px-6 xl:grid xl:grid-cols-12 gap-6 items-start relative z-10">
      <div className="hidden xl:block xl:col-span-3 relative z-30">
        <Category />
      </div>
      <div className="w-full xl:col-span-9 relative z-10">
        <HeroSlider sliderData={sliderData} />
      </div>
    </main>
  );
}

export default Hero;
