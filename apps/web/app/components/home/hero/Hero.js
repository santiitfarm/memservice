import Category from "./Category";
import HeroSlider from "./HeroSlider";

async function Hero() {
  const response = await fetch(`${process.env.API_URL}/api/slider`);
  const data = await response.json();
  const sliderData = data?.slider;

  return (
    <main className="w-full h-full container mx-auto px-3 lg:px-6 flex gap-6">
      <div className="w-1/5 h-full hidden xl:block">
        <Category />
      </div>
      <div className="w-full xl:w-[80%] h-full">
        <HeroSlider sliderData={sliderData} />
      </div>
    </main>
  );
}

export default Hero;
