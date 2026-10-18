import Image from "next/image";
import Link from "next/link";
import { MdEmail, MdLocationOn, MdPhone } from "react-icons/md";
import NavSocial from "../NavSocial";
import { footerLinks, SITE } from "./siteInfo";

const contact = [
  { Icon: MdLocationOn, text: SITE.address },
  { Icon: MdPhone, text: SITE.phone, href: SITE.phoneHref },
  { Icon: MdEmail, text: SITE.email, href: `mailto:${SITE.email}` },
];

function MainFooter() {
  return (
    <section className="grid grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 md:px-6 lg:grid-cols-12 lg:gap-8 lg:py-16">
      {/* Brand */}
      <div className="col-span-2 flex flex-col gap-5 lg:col-span-4 lg:pr-8">
        <Link href="/" aria-label={`${SITE.name} home`}>
          <Image
            className="h-auto w-40 object-contain md:w-44"
            src="/assets/logo/logo.png"
            width={400}
            height={400}
            alt={SITE.name}
          />
        </Link>
        <p className="max-w-sm text-sm leading-6 text-neutral-gray">
          {SITE.tagline}
        </p>
        <ul className="flex flex-col gap-3">
          {contact.map(({ Icon, text, href }) => (
            <li key={text} className="flex items-start gap-3 text-sm">
              <Icon className="mt-0.5 shrink-0 text-lg text-sky-blue" />
              {href ? (
                <a
                  href={href}
                  className="transition-colors hover:text-sky-blue"
                >
                  {text}
                </a>
              ) : (
                <span>{text}</span>
              )}
            </li>
          ))}
        </ul>
        <NavSocial />
      </div>

      {/* Link columns */}
      {footerLinks.map((group) => (
        <nav
          key={group.title}
          aria-label={group.title}
          className="col-span-1 lg:col-span-2"
        >
          <h3 className="mb-4 text-base font-semibold text-deep-sea-blue">
            {group.title}
          </h3>
          <ul className="flex flex-col gap-3">
            {group.links.map((link) => (
              <li key={link.url}>
                <Link
                  href={link.url}
                  className="text-sm text-neutral-gray transition-colors duration-200 hover:text-sky-blue"
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

export default MainFooter;
