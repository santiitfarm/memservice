import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube, FaLinkedinIn, FaTiktok } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";

export default function NavSocial({ social = {}, whatsapp = "" }) {
  const items = [
    { label: "Facebook", href: social?.facebook, Icon: FaFacebookF },
    { label: "Instagram", href: social?.instagram, Icon: FaInstagram },
    { label: "YouTube", href: social?.youtube, Icon: FaYoutube },
    { label: "TikTok", href: social?.tiktok, Icon: FaTiktok },
    { label: "Twitter", href: social?.x, Icon: FaXTwitter },
    { label: "LinkedIn", href: social?.linkedin, Icon: FaLinkedinIn },
    {
      label: "WhatsApp",
      href: whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}` : null,
      Icon: FaWhatsapp,
    },
  ].filter((item) => Boolean(item.href));

  if (items.length === 0) return null;

  return (
    <ul className="flex items-center gap-2.5 flex-wrap">
      {items.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:scale-105"
          >
            <Icon size={15} />
          </a>
        </li>
      ))}
    </ul>
  );
}
