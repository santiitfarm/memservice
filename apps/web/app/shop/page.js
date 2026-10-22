import CatalogListing from "./_components/CatalogListing";

export const metadata = {
  title: "Shop Online Medicines & Health Products | Mem Service",
  description:
    "Browse authentic prescription medicines, OTC drugs, health devices, and wellness supplies at Mem Service Bangladesh.",
};

export default async function ShopPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Build query string forwarding all catalog filter params
  const query = new URLSearchParams();
  for (const [key, val] of Object.entries(resolvedParams || {})) {
    if (val) query.set(key, String(val));
  }
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
    console.error("Shop page catalog fetch error:", err);
  }

  return (
    <main>
      <CatalogListing
        title="All Products"
        subtitle="Genuine prescription medicines, vitamins & personal healthcare products"
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
