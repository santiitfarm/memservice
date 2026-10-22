import { PT_Sans } from "next/font/google";
import "./globals.css";
// import components
import Footer from "@/app/components/footer/Footer";
import NavigationBar from "@/app/components/navigationBar/NavigationBar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CartProvider } from "./context/cartContext";
import { WishlistProvider } from "./context/wishlistContext";
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";

const geistSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-geist-sans",
});

// Pages read live catalog data from the API, so never freeze them at build time.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mem Service",
  description:
    "Mem Service - medicines, health products and doctor consultations delivered across Bangladesh.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      <body className={`${geistSans.variable} min-h-screen bg-background text-foreground antialiased`}>
        <Suspense>
          <SessionProvider>
            <CartProvider>
              <WishlistProvider>
                <NavigationBar />
                {children}
                <Footer />
              </WishlistProvider>
            </CartProvider>
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
