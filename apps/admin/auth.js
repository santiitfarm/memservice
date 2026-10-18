// import { MongoDBAdapter } from "@auth/mongodb-adapter";
// import NextAuth from "next-auth";
// import authConfig from "./auth.config";
// import mongoClientPromise from "./database/mongoClientPromise";
// export const { handlers, auth, signIn, signOut } = NextAuth({
//   adapter: MongoDBAdapter(mongoClientPromise, {
//     databaseName: process.env.ENVIRONMENT,
//   }),
//   session: {
//     strategy: "jwt",
//   },
//   ...authConfig,
// });
import bcrypt from "bcryptjs";

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "./app/models/user-model";
import connectMongo from "./services/mongo";
import { createSession } from "./lib/session";
import { rankOf } from "./lib/roles";

// Pre-computed bcrypt hash used for constant-time comparison when user is not found
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8w0xU.9u0QyZ2h4K7w1g8.z8p8J8i6";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const rawEmail = credentials?.email;
        const rawPassword = credentials?.password;
        if (!rawEmail || !rawPassword) {
          return null;
        }

        const email = String(rawEmail).trim().toLowerCase();
        await connectMongo();
        const user = await User.findOne({ email }).lean();

        // Always run bcrypt.compare to maintain constant-time response profile
        const targetHash = user?.password || DUMMY_HASH;
        const passwordOk = await bcrypt.compare(rawPassword, targetHash);

        // Only active staff (manager and above) may use the dashboard.
        const allowed =
          Boolean(user) && passwordOk && user.status === "active" && rankOf(user.role) >= 1;

        if (allowed) {
          const id = String(user._id);
          const name = user.first_name + " " + user.last_name;
          // This cookie is what the API verifies for every staff request.
          await createSession({ id, email: user.email, name, role: user.role });
          return {
            id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            name,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          role: token.role,
          name: token.name,
          phone: token.phone,
        };
      }
      return session;
    },
  },
});
