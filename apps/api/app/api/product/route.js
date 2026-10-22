import Product from "@/app/models/product-model";
import connectMongo from "@/services/mongo";

export async function POST(req) {
  await connectMongo();
  const body = await req.json();
  try {
    if (!body.slug && body.name) {
      const { generateUniqueSlug } = await import("@/lib/slug");
      body.slug = await generateUniqueSlug(Product, body.name);
    }
    const product = await Product.create(body);
    return new Response(JSON.stringify({ success: true, product: product }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

export async function PUT(req) {
  await connectMongo();
  const body = await req.json();
  try {
    if (body.name && !body.slug) {
      const { generateUniqueSlug } = await import("@/lib/slug");
      body.slug = await generateUniqueSlug(Product, body.name, body._id);
    }
    const product = await Product.findByIdAndUpdate(body._id, body, {
      new: true,
    });
    return new Response(JSON.stringify({ success: true, product: product }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
export async function GET(req) {
  await connectMongo();
  try {
    const products = await Product.find({ status: { $ne: "deleted" } })
      .sort({ createdAt: -1 })
      .select({ purchase_price: 0 });
    return new Response(JSON.stringify({ success: true, products: products }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
