const mongoose = require("mongoose");

const medicalCategorySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    description: "Unique identifier for the category",
  },
  categoryName: {
    type: String,
    required: true,
    description: "Name of the medical category",
  },
  specialties: {
    type: [String],
    required: true,
    description: "List of specialties under the category",
  },
});

export const ProductModel =
  mongoose.models.Product || mongoose.model("Product", ProductModel);
