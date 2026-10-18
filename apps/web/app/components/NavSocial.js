import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa6";
import { SITE } from "./footer/siteInfo";

const items = [
  { label: "Facebook", href: SITE.social.facebook, Icon: FaFacebookF },
  { label: "Instagram", href: SITE.social.instagram, Icon: FaInstagram },
  { label: "YouTube", href: SITE.social.youtube, Icon: FaYoutube },
  { label: "WhatsApp", href: SITE.whatsappHref, Icon: FaWhatsapp },
];

const NavSocial = () => (
  <ul className="flex items-center gap-3">
    {items.map(({ label, href, Icon }) => (
      <li key={label}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-light-mist text-deep-sea-blue transition-colors duration-300 hover:bg-sky-blue hover:text-white"
        >
          <Icon size={16} />
        </a>
      </li>
    ))}
  </ul>
);

export default NavSocial;
