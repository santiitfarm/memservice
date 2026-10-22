import MainNavigation from "./components/MainNavigation";
import SearchAndSupport from "./components/Search&Support";
import MobileNavBar from "./MobileNavBar";
import { getSiteBootstrap } from "@/lib/cms";

export default async function NavigationBar() {
  const bootstrap = await getSiteBootstrap();
  const site = bootstrap?.site || {};
  const menus = bootstrap?.menus || {};

  let categories = [];
  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const catRes = await fetch(`${apiUrl}/api/category`, { next: { revalidate: 60 } });
    if (catRes.ok) {
      const catData = await catRes.json();
      categories = catData?.categories || [];
    }
  } catch (err) {
    // silently continue with empty categories
  }

  const topBarText = site?.header?.topBarText;

  return (
    <>
      {topBarText && (
        <div className="bg-primary/10 text-primary text-xs font-semibold py-1.5 px-4 text-center border-b border-border/40 hidden sm:block">
          {topBarText}
        </div>
      )}

      <header className="w-full sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border transition-colors">
        <div className="container mx-auto px-3 lg:px-6 py-1">
          <SearchAndSupport site={site} menus={menus} categories={categories} />
          <div className="hidden lg:block pb-3">
            <MainNavigation menus={menus} />
          </div>
        </div>
      </header>

      <div className="lg:hidden w-full fixed bottom-0 bg-card/95 backdrop-blur-md text-card-foreground z-50 p-2 border-t border-border shadow-lg transition-colors">
        <MobileNavBar />
      </div>
    </>
  );
}
