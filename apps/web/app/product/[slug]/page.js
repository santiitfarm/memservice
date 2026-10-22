import Image from "next/image";
import { permanentRedirect } from "next/navigation";
// import components
import RelatedProducts from "@/app/components/relatedProducts/RelatedProducts";
import DesInfoReviews from "../components/DesInfoReviews";
import ShowProductDetails from "../components/ShowProductDetails";
import ShowProductImage from "../components/ShowProductImage";

export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const response = await fetch(
    `${process.env.API_URL}/api/shop/${slug}`
  );
  const data = await response.json();
  const productData = data?.product;
  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  return {
    title: productData?.name || "Product",
    description: productData?.short_description || "",
    url: `${process.env.NEXT_PUBLIC_URL}/product/${data?.slug || slug}`,
    type: "product",
    openGraph: {
      images: [
        {
          url: productData?.images?.[0] || "",
          width: 1200,
          height: 630,
          alt: productData?.name || "Product Image",
        },
        ...previousImages,
      ],
    },
  };
}

async function SingleProductPage({ params }) {
  const { slug } = await params;

  const response = await fetch(
    `${process.env.API_URL}/api/shop/${slug}`
  );
  const data = await response.json();

  // 301 Permanent Redirect if accessed by old MongoDB ObjectId and product has a slug
  if (data?.isObjectId && data?.slug && data.slug !== slug) {
    permanentRedirect(`/product/${data.slug}`);
  }

  const productData = data?.product;

  const relatedProductResponse = await fetch(
    `${process.env.API_URL}/api/relatedproducts?tags=medicine,tablets`
  );
  const relatedProductData = await relatedProductResponse.json();
  const relatedProducts = relatedProductData?.related_products;

  const additionalInfo = {
    productType: productData?.products_type,
    manufacturer: productData?.manufacturer_name,
    mililiter: productData?.strength,
  };

  const bannerRes = await fetch(`${process.env.API_URL}/api/banner`);
  const banner = await bannerRes.json();
  const banners = banner?.banner;
  const bannerData = banners.slice(5, 7);

  return (
    <main className="relative container mx-auto px-3 md:px-6 space-y-10 sm:mt-24 xl:mt-0">
      <section className="w-full h-full flex flex-col md:flex-row gap-6 mb-12">
        <div className="w-full md:w-[77%] h-full space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product Images */}
            <div className="w-full md:w-[45%]">
              <ShowProductImage data={productData?.images} />
            </div>
            {/* Show Product Details */}
            <div className="w-full md:w-[55%]">
              <ShowProductDetails product={productData} url={slug} />
            </div>
          </div>
          {/* Description, Additional Information, and Reviews */}
          <DesInfoReviews
            specificationsHtmlBangla={productData?.specificationsHtmlBangla}
            specificationsHtml={productData?.specificationsHtml}
            additionalInfo={additionalInfo}
            productId={productData?._id}
            slug={productData?.slug || slug}
          />
        </div>
        {/* Aside Banner */}
        <div className="w-full md:w-[23%] space-y-6">
          {bannerData.map((product) => (
            <div key={product._id} className="w-full h-auto">
              <Image
                src={product?.image}
                width={500}
                height={500}
                className="w-full h-auto rounded-md"
                alt={product?.title || "Banner Image"}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Related Products */}
      <RelatedProducts relatedProducts={relatedProducts} />
    </main>
  );
}

export default SingleProductPage;
