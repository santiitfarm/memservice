// import components
import MainNavigation from "./components/MainNavigation";
import SearchAndSupport from "./components/Search&Support";
import MobileNavBar from "./MobileNavBar";
// data
const navigationInfo = [
  { name: "Home", url: "/" },
  {
    name: "Shop",
    url: "/shop",
  },
  {
    name: "Consultation",
    url: "/consultation/doctor",
  },
  { name: "Offer", url: "/offer" },
];


function NavigationBar() {
  return (
    <>
      <section className="w-full h-16 sm:h-20 xl:h-full sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border transition-colors">
        <div className="container mx-auto px-3 lg:px-6 mb-2 lg:mb-4 xl:mb-8">
          <div>
            <SearchAndSupport menuData={navigationInfo} />
          </div>
          <div className="hidden lg:block">
            <MainNavigation menuData={navigationInfo} />
          </div>
        </div>
      </section>

      <div className="lg:hidden w-full fixed bottom-0 bg-card text-card-foreground z-50 p-3 border-t border-border shadow-lg transition-colors">
        <MobileNavBar />
      </div>
    </>
  );
}

export default NavigationBar;

