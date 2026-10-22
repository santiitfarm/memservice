import CmsContentPage, { generateMetadata as cmsGenerateMetadata } from "../(content)/[slug]/page";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return cmsGenerateMetadata({ params: Promise.resolve({ slug: "refund-and-return-policy" }) });
}

export default function RefundPolicyPage() {
  return <CmsContentPage params={Promise.resolve({ slug: "refund-and-return-policy" })} />;
}