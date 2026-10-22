import Image from "next/image";
import Link from "next/link";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import NavSocial from "../NavSocial";

export default function MainFooter({ site = {}, menus = {} }) {
  const siteName = site?.siteName || "Mem Service";
  const aboutText =
    site?.footer?.about ||
    site?.tagline ||
    "Authentic medicines, healthcare items, and specialist doctor consultations delivered across Bangladesh.";

  const address = site?.contact?.address || "Suite #402, Sena Kalyan Bhaban, Motijheel, Dhaka";
  const phone = site?.contact?.phone || "+8801711655686";
  const email = site?.contact?.email || "support@memservice.com";
  const rawPhone = phone.replace(/[^0-9+]/g, "");

  const contactList = [
    { Icon: MdLocationOn, text: address },
    { Icon: MdPhone, text: phone, href: `tel:${rawPhone}` },
    { Icon: MdEmail, text: email, href: `mailto:${email}` },
  ];

  // Map 4 footer columns from CMS menus
  const fallbackColumns = [
    {
      title: "Shop",
      links: [
        { name: "All Products", url: "/shop" },
        { name: "Best Sellers", url: "/best-seller" },
        { name: "Trending", url: "/trending" },
        { name: "Offers", url: "/offer" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", url: "/about-us" },
        { name: "Doctor Consultation", url: "/consultation/doctor" },
        { name: "FAQ", url: "/faq" },
      ],
    },
    {
      title: "Customer Care",
      links: [
        { name: "My Account", url: "/account" },
        { name: "Track Order", url: "/track" },
        { name: "Cart", url: "/cart" },
        { name: "Wishlist", url: "/wishlist" },
      ],
    },
    {
      title: "Legal & Policies",
      links: [
        { name: "Privacy Policy", url: "/privacy-policy" },
        { name: "Refund & Return Policy", url: "/refund-and-return-policy" },
        { name: "Terms & Conditions", url: "/terms-and-conditions" },
      ],
    },
  ];

  const columnKeys = ["footer-1", "footer-2", "footer-3", "footer-4"];
  const columns = columnKeys.map((key, idx) => {
    const cmsItems = menus?.[key];
    if (Array.isArray(cmsItems) && cmsItems.length > 0) {
      return {
        title: fallbackColumns[idx]?.title || `Information`,
        links: cmsItems,
      };
    }
    return fallbackColumns[idx];
  });

  return (
    <section className="grid grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 md:px-6 lg:grid-cols-12 lg:gap-8 lg:py-16">
      {/* Brand & Contact Section */}
      <div className="col-span-2 flex flex-col gap-5 lg:col-span-4 lg:pr-8">
        <Link href="/" aria-label={`${siteName} Home`} className="flex items-center">
          <Image
            className="h-auto w-36 sm:w-44 object-contain dark:hidden"
            src={site?.logoLight || "/assets/logo/logo.png"}
            width={400}
            height={100}
            alt={siteName}
          />
          <Image
            className="h-auto w-36 sm:w-44 object-contain hidden dark:block"
            src={site?.logoDark || site?.logoLight || "/assets/logo/logo.png"}
            width={400}
            height={100}
            alt={siteName}
          />
        </Link>

        <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-muted-foreground">
          {aboutText}
        </p>

        <ul className="flex flex-col gap-2.5">
          {contactList.map(({ Icon, text, href }) => (
            <li key={text} className="flex items-start gap-2.5 text-xs sm:text-sm">
              <Icon className="mt-0.5 shrink-0 text-base text-primary" />
              {href ? (
                <a
                  href={href}
                  className="transition-colors hover:text-primary text-foreground"
                >
                  {text}
                </a>
              ) : (
                <span className="text-foreground">{text}</span>
              )}
            </li>
          ))}
        </ul>

        <div className="pt-2">
          <NavSocial social={site?.social} whatsapp={site?.contact?.whatsapp || phone} />
        </div>
      </div>

      {/* Dynamic Link columns */}
      {columns.map((group, colIdx) => (
        <nav
          key={colIdx}
          aria-label={group.title}
          className="col-span-1 lg:col-span-2"
        >
          <h3 className="mb-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
            {group.title}
          </h3>
          <ul className="flex flex-col gap-2.5">
            {group.links.map((link, linkIdx) => (
              <li key={linkIdx}>
                <Link
                  href={link.url || "/"}
                  className="text-xs sm:text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </section>
  );
}
