import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
nextEnv.loadEnvConfig(path.resolve(__dirname, ".."));

async function main() {
  const uri = process.env.MONGODB_CONNECTION_STRING;
  if (!uri) throw new Error("Missing MONGODB_CONNECTION_STRING");

  await mongoose.connect(uri);
  const brandsCol = mongoose.connection.collection("brands");
  const now = new Date();

  const seedBrands = [
    {
      title: "ACI Consumer Brands",
      slug: "aci-consumer-brands",
      logo: "/assets/brands/aci.svg",
      order: 1,
      status: "active",
      featured: true,
      updatedAt: now,
    },
    {
      title: "Square Toiletries Ltd.",
      slug: "square-toiletries-ltd",
      logo: "/assets/brands/square.svg",
      order: 2,
      status: "active",
      featured: true,
      updatedAt: now,
    },
    {
      title: "SMC Enterprise Limited",
      slug: "smc-enterprise-limited",
      logo: "/assets/brands/ziska.svg",
      order: 3,
      status: "active",
      featured: true,
      updatedAt: now,
    },
    {
      title: "Ibn Sina",
      slug: "ibn-sina",
      logo: "/assets/brands/ibnsina.svg",
      order: 4,
      status: "active",
      featured: true,
      updatedAt: now,
    },
    {
      title: "Mundipharma (BD) Pvt. Ltd.",
      slug: "mundipharma-bd-pvt-ltd",
      logo: "/assets/brands/biopharma.svg",
      order: 5,
      status: "active",
      featured: true,
      updatedAt: now,
    },
    {
      title: "Incepta Pharmaceuticals Ltd.",
      slug: "incepta-pharmaceuticals-ltd",
      logo: "/assets/brands/incepta.svg",
      order: 6,
      status: "active",
      featured: true,
      updatedAt: now,
    },
    {
      title: "Beximco Pharmaceuticals Ltd.",
      slug: "beximco-pharmaceuticals-ltd",
      logo: "/assets/brands/beximco.svg",
      order: 7,
      status: "active",
      featured: true,
      updatedAt: now,
    },
    {
      title: "Renata Limited",
      slug: "renata-limited",
      logo: "/assets/brands/renata.svg",
      order: 8,
      status: "active",
      featured: true,
      updatedAt: now,
    },
  ];

  for (const b of seedBrands) {
    await brandsCol.updateOne(
      { title: b.title },
      { $set: b, $setOnInsert: { createdAt: now, __v: 0 } },
      { upsert: true }
    );
  }

  // Remove the old dummy brands without logos or update them
  await brandsCol.deleteMany({
    title: { $in: ["PharmaTech", "Wellness Pharma", "CareMed"] },
  });

  const all = await brandsCol.find({ status: "active" }).sort({ order: 1 }).toArray();
  console.log("Total active brands now:", all.length);
  all.forEach((b) => console.log(b.order, b.title, b.logo));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
