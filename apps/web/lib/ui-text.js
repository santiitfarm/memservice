/**
 * Bilingual UI Text Dictionary & Localization Helpers
 * Supports English ('en') and Bangla ('bn')
 */

export const UI_DICTIONARY = {
  // Navigation & Branding
  siteName: { en: "Mem Service", bn: "মেম সার্ভিস" },
  home: { en: "Home", bn: "হোম" },
  shop: { en: "Shop", bn: "শপ" },
  consultation: { en: "Doctor Consultation", bn: "ডাক্তার কনসাল্টেশন" },
  offer: { en: "Offers", bn: "অফার" },
  trending: { en: "Trending", bn: "ট্রেন্ডিং" },
  bestSeller: { en: "Best Sellers", bn: "বেস্ট সেলার" },
  trackOrder: { en: "Track Order", bn: "অর্ডার ট্র্যাক" },
  myAccount: { en: "My Account", bn: "আমার অ্যাকাউন্ট" },
  cart: { en: "Cart", bn: "কার্ট" },
  checkout: { en: "Checkout", bn: "চেকআউট" },
  wishlist: { en: "Wishlist", bn: "উইশলিস্ট" },
  searchPlaceholder: { en: "Search medicines, brands, generics...", bn: "ওষুধ, ব্র্যান্ড বা জেনেরিক খুঁজুন..." },
  supportAndOrders: { en: "Support & Orders", bn: "সাপোর্ট ও অর্ডার" },

  // Product & Catalog
  allCategories: { en: "All Categories", bn: "সকল ক্যাটাগরি" },
  allBrands: { en: "All Brands", bn: "সকল ব্র্যান্ড" },
  filterByPrice: { en: "Filter by Price", bn: "মূল্য নির্ধারণ" },
  inStockOnly: { en: "In Stock Only", bn: "শুধুমাত্র স্টকে আছে" },
  addToCart: { en: "Add to Cart", bn: "কার্টে যোগ করুন" },
  buyNow: { en: "Buy Now", bn: "এখনই কিনুন" },
  inStock: { en: "In Stock", bn: "স্টকে আছে" },
  outOfStock: { en: "Out of Stock", bn: "স্টক শেষ" },
  price: { en: "Price", bn: "মূল্য" },
  save: { en: "Save", bn: "সাশ্রয়" },
  prescriptionRequired: { en: "Prescription Required", bn: "প্রেসক্রিপশন প্রয়োজন" },
  specifications: { en: "Specifications", bn: "স্পেসিফিকেশন" },
  description: { en: "Description", bn: "বিবরণ" },
  customerReviews: { en: "Customer Reviews", bn: "গ্রাহক রিভিউ" },

  // Cart & Pricing
  subtotal: { en: "Subtotal", bn: "সাবটোটাল" },
  deliveryCharge: { en: "Delivery Charge", bn: "ডেলিভারি চার্জ" },
  discount: { en: "Discount", bn: "ডিসকাউন্ট" },
  totalAmount: { en: "Total Amount", bn: "সর্বমোট" },
  free: { en: "Free", bn: "ফ্রি" },
  applyCoupon: { en: "Apply Coupon", bn: "কুপন প্রয়োগ করুন" },
  couponCode: { en: "Coupon Code", bn: "কুপন কোড" },
  proceedToCheckout: { en: "Proceed to Checkout", bn: "চেকআউটে যান" },
  emptyCart: { en: "Your Cart is Empty", bn: "আপনার কার্ট খালি" },

  // Checkout & Delivery
  shippingDetails: { en: "Shipping Details", bn: "ডেলিভারি বিবরণ" },
  deliveryArea: { en: "Delivery Area / Zone", bn: "ডেলিভারি জোন" },
  fullName: { en: "Full Name", bn: "পূর্ণ নাম" },
  phone: { en: "Mobile Phone Number", bn: "মোবাইল নম্বর" },
  address: { en: "Full Delivery Address", bn: "সম্পূর্ণ ঠিকানা" },
  paymentMethod: { en: "Payment Method", bn: "পেমেন্ট মাধ্যম" },
  cashOnDelivery: { en: "Cash on Delivery (COD)", bn: "ক্যাশ অন ডেলিভারি" },
  placeOrder: { en: "Place Order", bn: "অর্ডার কনফার্ম করুন" },

  // Common UI Actions
  cancel: { en: "Cancel", bn: "বাতিল" },
  submit: { en: "Submit", bn: "জমা দিন" },
  back: { en: "Back", bn: "ফিরে যান" },
  viewAll: { en: "View All", bn: "সব দেখুন" },
  clearFilters: { en: "Clear Filters", bn: "ফিল্টার মুছুন" },
};

/**
 * Format monetary amount according to active language
 * Example: formatPrice(500, 'bn') => "৳৫০০"
 */
export function formatPrice(amount = 0, lang = "en") {
  const num = Number(amount) || 0;
  if (lang === "bn") {
    const formatted = new Intl.NumberFormat("bn-BD", {
      maximumFractionDigits: 2,
    }).format(num);
    return `৳${formatted}`;
  }
  return `৳${num.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

/**
 * Format numbers using Bengali numerals when active
 * Example: formatNumber(42, 'bn') => "৪২"
 */
export function formatNumber(num = 0, lang = "en") {
  const val = Number(num) || 0;
  if (lang === "bn") {
    return new Intl.NumberFormat("bn-BD").format(val);
  }
  return val.toLocaleString("en-US");
}

/**
 * Retrieve translated string from dictionary
 */
export function getUiText(key, lang = "en") {
  const entry = UI_DICTIONARY[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}
