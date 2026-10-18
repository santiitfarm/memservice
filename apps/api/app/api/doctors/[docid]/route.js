import Category from "@/app/models/category-model";
import Doctor from "@/app/models/doctor-model";
import Product from "@/app/models/product-model";
import connectMongo from "@/services/mongo";

export async function GET(req, { params }) {
  const id = (await params).docid;
  await connectMongo();
  try {
    const doctor = await Doctor.findById(id);

    return new Response(JSON.stringify({ success: true, doctor: doctor }), {
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
