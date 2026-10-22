import mongoose from "mongoose";

async function run() {
  await mongoose.connect("mongodb://localhost:27017/memservice");
  await mongoose.connection.collection("pages").deleteMany({ slug: "faq" });
  await mongoose.connection.collection("pages").insertOne({
    slug: "faq",
    title: "Frequently Asked Questions (FAQ)",
    titleBn: "সাধারণ প্রশ্নোত্তর (FAQ)",
    content: "<p>Find answers to common questions about ordering medicines, payment methods, delivery zones, returns, and doctor consultations on Mem Service.</p>",
    contentBn: "<p>মেম সার্ভিসের মাধ্যমে ওষুধ অর্ডার, পেমেন্ট পদ্ধতি, ডেলিভারি জোন, রিটার্ন এবং ডাক্তার কনসালটেশন সংক্রান্ত সাধারণ প্রশ্ন ও উত্তরের তালিকা।</p>",
    status: "published",
    seo: {
      title: "Frequently Asked Questions - Mem Service",
      description: "Common questions and answers regarding orders, payments, and delivery at Mem Service.",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log("FAQ page inserted successfully into pages collection");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
