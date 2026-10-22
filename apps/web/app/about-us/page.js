import CmsContentPage, { generateMetadata as cmsGenerateMetadata } from "../(content)/[slug]/page";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return cmsGenerateMetadata({ params: Promise.resolve({ slug: "about-us" }) });
}

export default function AboutUsPage() {
  return <CmsContentPage params={Promise.resolve({ slug: "about-us" })} />;
}