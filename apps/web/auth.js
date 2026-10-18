import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Google,
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null;
        }

        const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
        try {
          const res = await fetch(`${apiUrl}/api/customerProfile/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: credentials.phone,
              password: credentials.password,
            }),
          });
          if (!res.ok) return null;

          const { user, token } = await res.json();
          return {
            email: user.email,
            customer_name: user.customer_name,
            address: user.address,
            phone_number: user.phone_number,
            _id: user._id,
            accessToken: token,
          };
        } catch (error) {
          console.error("Customer login failed:", error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        // Keep the API access token next to (not inside) the public profile.
        const { accessToken, ...profile } = user;
        token.user = profile;
        token.accessToken = accessToken;
      }
      // Handle user updates
      if (trigger === "update" && session?.user) {
        token.user = {
          ...token.user,
          ...session.user,
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = token.user;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
});
