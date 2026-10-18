export default function AutoFillProductForm({ setValue }) {
  const autoFillForm = () => {
    // Sample data for auto-filling the form
    const sampleData = {
      name: "Sample Product",
      manufacturer_name: "Sample Manufacturer",
      brand: "sample-brand-id", // Assuming this is a valid brand ID
      category: "Sample Category",
      products_type: "Sample Type",
      generic_name: "Sample Generic Name",
      strength: "500mg",
      pack_size: "30 tablets",
      color: "White",
      regular_price: "19.99",
      discount_price: "15.99",
      purchase_price: "10.00",
      stock: 100,
      special_tag: "New Arrival",
      tags: "medicine,tablets",
      short_description: "This is a sample product description.",
      product_features: "Feature 1\nFeature 2\nFeature 3",
      additional_info: "Additional information about the product.",
      specificationsHtml: "<p>Detailed specifications of the product.</p>",
      specificationsHtmlBangla: "<p>বাংলায় স্পেসিফিকেশন  লিখুন এখানে ।</p>",
    };

    // Auto-fill the form fields
    Object.entries(sampleData).forEach(([key, value]) => {
      setValue(key, value);
    });

    // Note: You may need to handle the image upload and rich text editor separately
    // as they might require special handling
  };

  return (
    <button
      onClick={autoFillForm}
      className="mb-4 absolute -top-10 right-0 bg-slate-400 hover:bg-slate-500 text-white py-2 px-4 rounded"
    >
      Auto Fill Form
    </button>
  );
}
