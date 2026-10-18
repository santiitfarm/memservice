// import components
import RowCart from "../../productCart/rowCart/RowCart";

// data
const productData = [
  {
    image: "https://imgur.com/xnzEmIi.jpg",
    name: "Vitamin C 500mg Sugarless Tab X",
    oldPrice: "44.00",
    currentPrice: "75.00",
  },
  {
    image: "https://imgur.com/ljO3Szy.jpg",
    name: "Promethazine",
    oldPrice: "44.00",
    currentPrice: "75.00",
  },
  {
    image: "https://imgur.com/6fSLHpH.jpg",
    name: "Elastoplast Sensitive XXL Dressings",
    oldPrice: "44.00",
    currentPrice: "75.00",
  },
  {
    image: "https://imgur.com/GpJLOYq.jpg",
    name: "Pantoprazole",
    oldPrice: "44.00",
    currentPrice: "75.00",
  },
  {
    image: "https://imgur.com/ljO3Szy.jpg",
    name: "Promethazine",
    oldPrice: "44.00",
    currentPrice: "75.00",
  },
  {
    image: "https://imgur.com/GpJLOYq.jpg",
    name: "Pantoprazole",
    oldPrice: "44.00",
    currentPrice: "75.00",
  },
  {
    image: "https://imgur.com/xnzEmIi.jpg",
    name: "Vitamin C 500mg Sugarless Tab X",
    oldPrice: "44.00",
    currentPrice: "75.00",
  },
  {
    image: "https://imgur.com/ljO3Szy.jpg",
    name: "Promethazine",
    oldPrice: "44.00",
    currentPrice: "75.00",
  },
  {
    image: "https://imgur.com/GpJLOYq.jpg",
    name: "Pantoprazole",
    oldPrice: "44.00",
    currentPrice: "75.00",
  },
  {
    image: "https://imgur.com/6fSLHpH.jpg",
    name: "Elastoplast Sensitive XXL Dressings",
    oldPrice: "44.00",
    currentPrice: "75.00",
  },
  {
    image: "https://imgur.com/GpJLOYq.jpg",
    name: "Pantoprazole",
    oldPrice: "44.00",
    currentPrice: "75.00",
  },
  {
    image: "https://imgur.com/ljO3Szy.jpg",
    name: "Promethazine",
    oldPrice: "44.00",
    currentPrice: "75.00",
  },
];

async function MoreToLove() {
  const response = await fetch(`${process.env.API_URL}/api/product/trending`);
  const data = await response.json();
  const productData = data?.trending_products;

  return (
    <main className="container mx-auto px-3 lg:px-6">
      <h3 className="text-xl md:text-2xl font-bold text-deep-sea-blue capitalize text-center">
        More to love
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 lg:mt-14 lg:gap-4 ">
        {productData.slice(0, 12).map((product, ind) => (
          <div key={ind}>
            <RowCart productData={product} />
          </div>
        ))}
      </div>
    </main>
  );
}

export default MoreToLove;
