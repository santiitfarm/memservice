import CmsContentPage, { generateMetadata as cmsGenerateMetadata } from "../(content)/[slug]/page";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return cmsGenerateMetadata({ params: Promise.resolve({ slug: "terms-and-conditions" }) });
}

export default function TermsAndConditionsPage() {
  return <CmsContentPage params={Promise.resolve({ slug: "terms-and-conditions" })} />;
}