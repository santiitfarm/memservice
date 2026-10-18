import SliderProduct from "../../sliderProduct/SliderProduct";

async function Brand() {
  const response = await fetch(`${process.env.API_URL}/api/product/brand`);
  const data = await response.json();
  const brandData = data?.brands;

  return (
    <div>
      <SliderProduct brandData={brandData} />
    </div>
  );
}

export default Brand;
