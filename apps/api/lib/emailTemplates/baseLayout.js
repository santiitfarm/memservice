import connectMongo from "@/services/mongo";
import SiteSettings from "@/app/models/SiteSettings";

let cachedSite = null;
let siteCacheTime = 0;

export async function getCompanyInfo() {
  if (cachedSite && Date.now() - siteCacheTime < 60000) {
    return cachedSite;
  }

  try {
    await connectMongo();
    const site = await SiteSettings.findOne({ key: "site" }).lean();
    if (site) {
      cachedSite = {
        name: site.siteName || "Mem Service",
        tagline: site.tagline || "Healthcare & Medicines in Bangladesh",
        logo: site.logoLight || "https://res.cloudinary.com/dbr3st8vn/image/upload/v1733630577/logo_luatve.png",
        phone: site.contact?.phone || "+8801711655686",
        email: site.contact?.email || "support@memservice.com",
        address: site.contact?.address || "Suite #402, Sena Kalyan Bhaban, Motijheel, Dhaka-1000",
        website: process.env.NEXT_PUBLIC_WEB_URL || "https://memservicebd.com",
      };
      siteCacheTime = Date.now();
      return cachedSite;
    }
  } catch (err) {
    console.warn("getCompanyInfo error:", err.message);
  }

  return {
    name: "Mem Service",
    tagline: "Healthcare & Medicines in Bangladesh",
    logo: "https://res.cloudinary.com/dbr3st8vn/image/upload/v1733630577/logo_luatve.png",
    phone: "+8801711655686",
    email: "support@memservice.com",
    address: "Suite #402, Sena Kalyan Bhaban, Motijheel, Dhaka-1000",
    website: "https://memservicebd.com",
  };
}

export function wrapEmailHtml({ title, preheader = "", contentHtml, company }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    table { border-collapse: collapse; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f4f6f8; padding: 30px 10px; }
    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #184363 0%, #15a9e3 100%); padding: 28px 24px; text-align: center; }
    .logo { max-height: 44px; width: auto; object-contain; }
    .content { padding: 32px 28px; }
    .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; padding: 12px 28px; background-color: #15a9e3; color: #ffffff !important; font-weight: 600; text-decoration: none; border-radius: 8px; margin: 16px 0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .badge-success { background-color: #ecfdf5; color: #059669; }
    .badge-warning { background-color: #fffbeb; color: #d97706; }
    .badge-danger { background-color: #fef2f2; color: #dc2626; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <table class="wrapper" role="presentation">
    <tr>
      <td align="center">
        <table class="main" role="presentation">
          <tr>
            <td class="header">
              <a href="${company.website}" target="_blank">
                <img src="${company.logo}" alt="${company.name}" class="logo" />
              </a>
            </td>
          </tr>
          <tr>
            <td class="content">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #334155;">${company.name} &bull; ${company.tagline}</p>
              <p style="margin: 0 0 8px 0;">${company.address} &bull; Hot-line: <a href="tel:${company.phone}" style="color: #15a9e3; text-decoration: none;">${company.phone}</a></p>
              <p style="margin: 0; color: #94a3b8;">&copy; ${new Date().getFullYear()} ${company.name}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

const baseLayout = {
  getCompanyInfo,
  wrapEmailHtml,
};

export default baseLayout;
