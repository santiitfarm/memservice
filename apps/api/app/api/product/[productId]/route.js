import Category from "@/app/models/category-model";
import Product from "@/app/models/product-model";
import connectMongo from "@/services/mongo";

export async function GET(req, { params }) {
  const id = (await params).productId;
  await connectMongo();
  try {
    const product = await Product.findById(id)
      .populate({
        path: "category",
        model: Category,
        select: "categoryName",
      })
      .populate({
        path: "brand",
        model: Product,
        select: "title",
      })
      .select({ purchase_price: 0 });
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

export async function DELETE(req, { params }) {
  const id = (await params).productId;
  await connectMongo();

  try {
    const product = await Product.findByIdAndUpdate(id, {
      status: "deleted",
    });
    return new Response(JSON.stringify({ success: true, product }), {
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
