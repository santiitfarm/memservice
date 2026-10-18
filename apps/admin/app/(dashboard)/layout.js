import { auth } from "@/auth";
import "../globals.css";

export const metadata = {
  title: "Admin Dashboard",
  description: "Next gen Admin Dashboard",
};

const RootLayout = async ({ children }) => {
  const session = await auth();
  //console.log(session);
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="https://res.cloudinary.com/dbr3st8vn/image/upload/v1734281211/j1gl0ial8hmmn33cnxto.jpg"
          sizes="any"
        />
      </head>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
