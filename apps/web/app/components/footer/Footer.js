import Copyright from "./Copyright";
import MainFooter from "./MainFooter";

function Footer() {
  return (
    <footer className="mt-14 border-t border-light-mist bg-white text-deep-sea-blue">
      <div className="container mx-auto">
        <MainFooter />
      </div>
      <div className="bg-deep-sea-blue">
        <Copyright />
      </div>
    </footer>
  );
}

export default Footer;
