import { notFound, permanentRedirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ShowProductImage from "../components/ShowProductImage";
import ShowProductDetails from "../components/ShowProductDetails";
import DesInfoReviews from "../components/DesInfoReviews";
import RelatedProducts from "@/app/components/relatedProducts/RelatedProducts";
import { getSiteBootstrap } from "@/lib/cms";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  try {
    const res = await fetch(`${apiUrl}/api/shop/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: "Product Not Found | Mem Service" };

    const data = await res.json();
    const product = data?.product;
    if (!product) return { title: "Product Not Found | Mem Service" };

    return {
      title: `${product.name} | Mem Service`,
      description:
        product.short_description ||
        `Buy authentic ${product.name} online in Bangladesh. Fast home delivery and best prices at Mem Service.`,
      openGraph: {
        title: product.name,
        description: product.short_description || "",
        images: product.images?.[0] ? [{ url: product.images[0] }] : [],
      },
    };
  } catch (err) {
    return { title: "Mem Service - Online Pharmacy" };
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // Fetch product data and site bootstrap in parallel
  const [productRes, bootstrap] = await Promise.all([
    fetch(`${apiUrl}/api/shop/${slug}`, { next: { revalidate: 60 } }),
    getSiteBootstrap(),
  ]);

  if (!productRes.ok) {
    notFound();
  }

  const data = await productRes.json();
  const product = data?.product;

  if (!product) {
    notFound();
  }

  // 301 Permanent Redirect if accessed by old MongoDB ObjectId and product has a slug
  if (data?.isObjectId && data?.slug && data.slug !== slug) {
    permanentRedirect(`/product/${data.slug}`);
  }

  // Fetch related products
  let relatedProducts = [];
  try {
    const relRes = await fetch(`${apiUrl}/api/relatedproducts?tags=medicine,tablets`, {
      next: { revalidate: 120 },
    });
    if (relRes.ok) {
      const relData = await relRes.json();
      relatedProducts = relData?.related_products || [];
    }
  } catch (e) {}

  // JSON-LD structured data for Google Rich Results
  const effectivePrice = product.discount_price > 0 ? product.discount_price : product.regular_price;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images || [],
    description: product.short_description || `${product.name} available at Mem Service`,
    sku: product.sku || product._id,
    brand: {
      "@type": "Brand",
      name: product.manufacturer_name || product.brand?.title || "Mem Service",
    },
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/product/${product.slug || product._id}`,
      priceCurrency: "BDT",
      price: effectivePrice,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.avgRating || 5,
            reviewCount: product.reviewCount || 1,
          },
        }
      : {}),
  };

  const deliveryZones = bootstrap?.deliveryZones || [];

  return (
    <>
      {/* JSON-LD Structured Metadata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container mx-auto px-3 lg:px-6 py-6 md:py-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary transition-colors">
            Shop
          </Link>
          {product.category?.categoryName && (
            <>
              <span>/</span>
              <Link
                href={`/shop?category=${encodeURIComponent(product.category.slug || product.category.categoryName)}`}
                className="hover:text-primary transition-colors"
              >
                {product.category.categoryName}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Showcase: Gallery on Left (5 cols) & Details on Right (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5 w-full">
            <ShowProductImage data={product.images || []} />
          </div>

          <div className="lg:col-span-7 w-full">
            <ShowProductDetails product={product} deliveryZones={deliveryZones} />
          </div>
        </div>

        {/* Product Tabs: Description, Specifications, and Reviews */}
        <div className="mt-12">
          <DesInfoReviews
            specificationsHtml={product.specificationsHtml}
            specificationsHtmlBangla={product.specificationsHtmlBangla}
            additionalInfo={{
              manufacturer: product.manufacturer_name,
              productType: product.products_type,
              mililiter: product.strength,
            }}
            productId={product._id}
            slug={product.slug}
          />
        </div>

        {/* Related Products Rail */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <RelatedProducts relatedProducts={relatedProducts} />
          </div>
        )}
      </main>
    </>
  );
}
