import SliderProduct from "../../sliderProduct/SliderProduct";

async function Brand() {
  let brandData = [];
  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const response = await fetch(`${apiUrl}/api/product/brand`);
    if (response.ok) {
      const data = await response.json();
      brandData = Array.isArray(data?.brands) ? data.brands : [];
    }
  } catch (err) {
    console.error("Failed to fetch brands:", err);
  }

  return (
    <div>
      <SliderProduct brandData={brandData} />
    </div>
  );
}

export default Brand;
