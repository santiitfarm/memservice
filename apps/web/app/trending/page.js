import CatalogListing from "../shop/_components/CatalogListing";

export const metadata = {
  title: "Trending Health & Medicine Products | Mem Service",
  description:
    "See what customers across Bangladesh are buying most. Genuine trending medicines, wellness gear, and vitamins.",
};

export default async function TrendingPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const query = new URLSearchParams();
  for (const [key, val] of Object.entries(resolvedParams || {})) {
    if (val) query.set(key, String(val));
  }
  if (!query.has("sort")) query.set("sort", "popular");
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
    console.error("Trending page catalog fetch error:", err);
  }

  return (
    <main>
      <CatalogListing
        title="Trending Products"
        subtitle="Most popular items frequently ordered by patients and customers"
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
