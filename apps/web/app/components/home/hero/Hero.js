import Category from "./Category";
import HeroSlider from "./HeroSlider";

export default function Hero({ sliders = [], categories = [] }) {
  return (
    <div className="w-full container mx-auto px-3 lg:px-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start relative">
        {/* Desktop Category Rail (3 cols) */}
        {categories.length > 0 && (
          <aside className="hidden xl:block xl:col-span-3 relative z-30">
            <Category categories={categories} />
          </aside>
        )}

        {/* Hero Banner Slider (9 cols if categories present, 12 cols if not) */}
        <div className={`w-full ${categories.length > 0 ? "xl:col-span-9" : "xl:col-span-12"} relative z-10`}>
          <HeroSlider sliderData={sliders} />
        </div>
      </div>
    </div>
  );
}
