import { auth } from "@/auth";
import AccountSetting from "./_components/AccountSetting";
import OrderHistory from "./_components/OrderHistory";
import PersonalInfo from "./_components/PersonalInfo";
import PrivacySection from "./_components/PrivacySection";
import AuthPortal from "./_components/AuthPortal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account - Mem Service",
  description: "Manage your profile, order history, default shipping address, and privacy requests.",
};

export default async function AccountPage() {
  const session = await auth();

  // If user is not authenticated, render the Auth Portal directly
  if (!session || (!session.accessToken && !session.user)) {
    return <AuthPortal initialMode="login" />;
  }

  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  let user = null;

  if (session.accessToken) {
    try {
      const response = await fetch(`${apiUrl}/api/customerProfile`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        user = data.customers?.[0] || null;
      }
    } catch (err) {
      console.error("Failed to fetch customer profile:", err);
    }
  }

  // Graceful fallback to session.user if fresh API profile lookup isn't available
  if (!user && session.user) {
    user = {
      _id: session.user._id || session.user.id,
      customer_name: session.user.customer_name || session.user.name || "Customer",
      email: session.user.email || "",
      phone_number: session.user.phone_number || "",
      address: session.user.address || "",
      orders: [],
    };
  }

  // If still no user, render Auth Portal
  if (!user) {
    return <AuthPortal initialMode="login" />;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Customer Account Portal
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Welcome back, <strong>{user.customer_name}</strong>. Manage your orders, delivery address, and preferences.
          </p>
        </div>

        <PersonalInfo user={user} />
        <OrderHistory user={user} />
        <PrivacySection />
        <AccountSetting user={user} />
      </div>
    </div>
  );
}
