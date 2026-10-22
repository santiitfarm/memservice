import CatalogListing from "../shop/_components/CatalogListing";

export const metadata = {
  title: "Exclusive Offers & Health Deals | Mem Service",
  description:
    "Discover the best discounts and promotional deals on medicines, baby care, and wellness essentials in Bangladesh.",
};

export default async function OfferPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const query = new URLSearchParams();
  for (const [key, val] of Object.entries(resolvedParams || {})) {
    if (val) query.set(key, String(val));
  }
  // Enforce offer tag unless user overrides tags
  if (!query.has("tags")) query.set("tags", "offer");
  if (!query.has("limit")) query.set("limit", "24");

  let catalogData = { items: [], total: 0, page: 1, pages: 1, limit: 24, facets: { categories: [], brands: [] } };
  try {
    const res = await fetch(`${apiUrl}/api/catalog/products?${query.toString()}`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      catalogData = await res.json();
    }
  } catch (err) {
    console.error("Offer page catalog fetch error:", err);
  }

  return (
    <main>
      <CatalogListing
        title="Special Offers & Deals"
        subtitle="Exclusive discounts on genuine pharmaceuticals and healthcare products"
        items={catalogData?.items || []}
        total={catalogData?.total || 0}
        page={catalogData?.page || 1}
        pages={catalogData?.pages || 1}
        limit={catalogData?.limit || 24}
        facets={catalogData?.facets || { categories: [], brands: [] }}
      />
    </main>
  );
}
