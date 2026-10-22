import Copyright from "./Copyright";
import MainFooter from "./MainFooter";
import { getSiteBootstrap } from "@/lib/cms";

export default async function Footer() {
  const bootstrap = await getSiteBootstrap();
  const site = bootstrap?.site || {};
  const menus = bootstrap?.menus || {};
  const paymentMethods = bootstrap?.paymentMethods || [];

  return (
    <footer className="mt-14 border-t border-border bg-card text-foreground transition-colors">
      <div className="container mx-auto">
        <MainFooter site={site} menus={menus} />
      </div>
      <div className="bg-deep-sea-blue dark:bg-card/90 border-t border-border/40">
        <Copyright site={site} paymentMethods={paymentMethods} />
      </div>
    </footer>
  );
}
