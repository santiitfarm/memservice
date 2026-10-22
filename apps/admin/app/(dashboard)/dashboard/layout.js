"use client";

import { store } from "@/store/store";
import { SessionProvider } from "next-auth/react";
import { useState, useLayoutEffect } from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import NavSideBar from "./components/NavSideBar";

const DashboardLayout = ({ children, params }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSmall, setIsSmall] = useState(false);

  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      setIsCollapsed(window.innerWidth < 768);
      setIsSmall(window.innerWidth < 768);

      const handleResize = () => {
        setIsSmall(window.innerWidth < 768);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <SessionProvider>
      <ToastContainer />
      <Provider store={store}>
        <div className="flex min-h-screen bg-background text-foreground relative">
          {/* Sidebar */}
          <NavSideBar
            params={params}
            setIsCollapsed={setIsCollapsed}
            isCollapsed={isCollapsed}
            isSmall={isSmall}
          />

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Header */}
            <Header
              setIsCollapsed={setIsCollapsed}
              isCollapsed={isCollapsed}
            />

            {/* Dashboard Content Container */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-muted/20">
              <div className="max-w-7xl mx-auto w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </Provider>
    </SessionProvider>
  );
};

export default DashboardLayout;
