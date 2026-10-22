import { PT_Sans, Hind_Siliguri } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
// import components
import Footer from "@/app/components/footer/Footer";
import NavigationBar from "@/app/components/navigationBar/NavigationBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CartProvider } from "./context/cartContext";
import { WishlistProvider } from "./context/wishlistContext";
import { LanguageProvider } from "./context/LanguageContext";
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";

const geistSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-geist-sans",
});

const banglaFont = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
});

// Pages read live catalog data from the API, so never freeze them at build time.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mem Service - Healthcare & Medicine Delivery in Bangladesh",
  description:
    "Mem Service - authentic medicines, healthcare products and verified doctor appointments delivered across Bangladesh.",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value === "bn" ? "bn" : "en";
  const activeFont = lang === "bn" ? banglaFont : geistSans;

  return (
    <html lang={lang} className={activeFont.className} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var isDark = theme === 'dark' || ((!theme || theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${activeFont.variable} min-h-screen bg-background text-foreground antialiased`}>
        <Suspense>
          <SessionProvider>
            <LanguageProvider initialLang={lang}>
              <CartProvider>
                <WishlistProvider>
                  <NavigationBar />
                  {children}
                  <Footer />
                </WishlistProvider>
              </CartProvider>
            </LanguageProvider>
          </SessionProvider>
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Suspense>
      </body>
    </html>
  );
}
