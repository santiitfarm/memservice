const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Cached helper fetching site settings, menus, delivery zones, and enabled payment methods.
 */
export async function getSiteBootstrap() {
  try {
    const res = await fetch(`${API_BASE}/api/cms/bootstrap`, {
      next: { tags: ["cms-bootstrap", "cms-settings", "cms-menus"], revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Bootstrap fetch failed: ${res.status}`);
    }

    const data = await res.json();
    if (!data?.bootstrap) {
      throw new Error("No bootstrap data returned");
    }

    return data.bootstrap;
  } catch (err) {
    console.error("getSiteBootstrap error:", err.message);
    // Return sensible fallback to ensure storefront never crashes
    return {
      site: {
        siteName: "Mem Service",
        tagline: "Genuine Medicines, Healthcare & Consultations Across Bangladesh",
        logoLight: "/assets/logo/logo.png",
        logoDark: "/assets/logo/logo.png",
        contact: {
          phone: "+8801711655686",
          whatsapp: "+8801711655686",
          email: "support@memservice.com",
          address: "Suite #402, Sena Kalyan Bhaban, Motijheel C/A, Dhaka-1000",
          workingHours: "9:00 AM - 10:00 PM (Daily)",
        },
        social: {
          facebook: "https://facebook.com/memservice",
          instagram: "https://instagram.com/memservice",
          youtube: "https://youtube.com/@memservice",
        },
        header: {
          topBarText: "Express delivery inside Dhaka within 24 hours | Call +8801711655686",
          showSearch: true,
          showThemeToggle: true,
        },
        footer: {
          about:
            "Mem Service provides authentic medicines, healthcare items, and telemedicine consultations with licensed physicians throughout Bangladesh.",
          copyrightText: "Mem Service. All rights reserved.",
          showPaymentBadges: true,
        },
      },
      menus: {
        header: [
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          { name: "Consultation", url: "/consultation/doctor" },
          { name: "Offers", url: "/offer" },
        ],
        "footer-1": [
          { name: "All Products", url: "/shop" },
          { name: "Best Sellers", url: "/best-seller" },
          { name: "Trending", url: "/trending" },
          { name: "Offers", url: "/offer" },
        ],
        "footer-2": [
          { name: "About Us", url: "/about-us" },
          { name: "Consultation", url: "/consultation" },
          { name: "FAQ", url: "/faq" },
        ],
        "footer-3": [
          { name: "My Account", url: "/account/login" },
          { name: "Cart", url: "/cart" },
          { name: "Wishlist", url: "/wishlist" },
        ],
        "footer-4": [
          { name: "Privacy Policy", url: "/privacy-policy" },
          { name: "Refund & Return Policy", url: "/refund-and-return-policy" },
          { name: "Terms & Conditions", url: "/terms-and-conditions" },
        ],
        mobile: [
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          { name: "Consultation", url: "/consultation/doctor" },
          { name: "Offers", url: "/offer" },
        ],
      },
      deliveryZones: [],
      paymentMethods: [
        { key: "bkash", name: "bKash", mode: "live" },
        { key: "nagad", name: "Nagad", mode: "live" },
        { key: "cod", name: "Cash on Delivery", mode: "live" },
      ],
    };
  }
}

/**
 * Cached helper fetching homepage layout and content data.
 */
export async function getHomeData() {
  try {
    const res = await fetch(`${API_BASE}/api/cms/home`, {
      next: { tags: ["cms-home", "cms-sliders", "cms-banners"], revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Home data fetch failed: ${res.status}`);
    }

    const data = await res.json();
    return data?.home || null;
  } catch (err) {
    console.error("getHomeData error:", err.message);
    return null;
  }
}

/**
 * Fetch catalog products for product rails.
 */
export async function getCatalogProducts({ sort = "newest", tags = "", limit = 10 } = {}) {
  try {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    if (tags) params.set("tags", tags);
    if (limit) params.set("limit", String(limit));

    const res = await fetch(`${API_BASE}/api/catalog/products?${params.toString()}`, {
      next: { tags: ["catalog-products"], revalidate: 60 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data?.items || [];
  } catch (err) {
    console.error("getCatalogProducts error:", err.message);
    return [];
  }
}

export async function getBestDeals(limit = 6) {
  try {
    const res = await fetch(`${API_BASE}/api/product/best-seller`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.bestSellers) && data.bestSellers.length > 0) {
        return data.bestSellers.slice(0, limit);
      }
    }
  } catch (e) {}
  return getCatalogProducts({ sort: "popular", limit });
}

export async function getTrendingProducts(limit = 6) {
  try {
    const res = await fetch(`${API_BASE}/api/product/trending`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.trending_products) && data.trending_products.length > 0) {
        return data.trending_products.slice(0, limit);
      }
    }
  } catch (e) {}
  return getCatalogProducts({ sort: "popular", limit });
}

export async function getFeaturedProducts(limit = 6) {
  return getCatalogProducts({ sort: "rating", limit });
}

export async function getOfferProducts(limit = 6) {
  try {
    const res = await fetch(`${API_BASE}/api/product/offer`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.offer_products) && data.offer_products.length > 0) {
        return data.offer_products.slice(0, limit);
      }
    }
  } catch (e) {}
  return getCatalogProducts({ sort: "newest", tags: "offer", limit });
}

