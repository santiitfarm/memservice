import { getIntegration } from "../resolver.js";

const FETCH_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export const meta = {
  key: "google_oauth",
  name: "Google OAuth",
  category: "auth",
  type: "oauth",
  logo: "/assets/logo/google.png",
};

/**
 * Verifies a Google ID Token against Google's tokeninfo endpoint.
 * @param {string} idToken
 * @returns {Promise<{ email: string, name: string, picture: string, sub: string }>}
 */
export async function verifyIdToken(idToken) {
  if (!idToken) throw new Error("Missing Google idToken");

  const integration = await getIntegration("google_oauth");
  const expectedClientId =
    integration?.config?.clientId ||
    process.env.AUTH_GOOGLE_ID ||
    process.env.GOOGLE_CLIENT_ID;

  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
  const res = await fetchWithTimeout(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.error_description || !data.email) {
    throw new Error(data.error_description || "Invalid Google ID token");
  }

  if (expectedClientId && data.aud !== expectedClientId) {
    throw new Error("Google token audience mismatch");
  }

  return {
    email: data.email.toLowerCase(),
    name: data.name || data.given_name || "Customer",
    picture: data.picture || "",
    sub: data.sub,
  };
}

export async function test() {
  try {
    const res = await fetchWithTimeout(
      "https://accounts.google.com/.well-known/openid-configuration",
      { method: "GET" }
    );
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.issuer) {
      return {
        ok: true,
        message: "Google OpenID Discovery Document reached successfully",
      };
    }
    return {
      ok: false,
      error: `Failed to reach Google OpenID discovery (HTTP ${res.status})`,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

const googleAuthAdapter = {
  meta,
  verifyIdToken,
  test,
};

export default googleAuthAdapter;
