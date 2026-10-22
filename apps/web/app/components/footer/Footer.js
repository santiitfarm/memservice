import Copyright from "./Copyright";
import MainFooter from "./MainFooter";

function Footer() {
  return (
    <footer className="mt-14 border-t border-border bg-card text-foreground transition-colors">
      <div className="container mx-auto">
        <MainFooter />
      </div>
      <div className="bg-deep-sea-blue dark:bg-card/80 border-t border-border/40">
        <Copyright />
      </div>
    </footer>
  );
}

export default Footer;
