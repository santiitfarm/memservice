import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, FileText, HelpCircle, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";

  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  try {
    const res = await fetch(`${apiUrl}/api/cms/pages/${encodeURIComponent(slug)}`, {
      headers: { "x-locale": lang, "Accept-Language": lang },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.page) {
        return {
          title: data.page.seo?.title || `${data.page.title} - Mem Service`,
          description: data.page.seo?.description || `Read about ${data.page.title} on Mem Service.`,
        };
      }
    }
  } catch (e) {}

  return {
    title: `${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} - Mem Service`,
  };
}

export default async function CmsContentPage({ params }) {
  const { slug } = await params;
  console.log(">>> CmsContentPage slug:", slug);
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";

  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  let page = null;
  let faqs = [];

  try {
    const [pageRes, faqsRes] = await Promise.all([
      fetch(`${apiUrl}/api/cms/pages/${encodeURIComponent(slug)}`, {
        headers: { "x-locale": lang, "Accept-Language": lang },
        cache: "no-store",
      }),
      slug === "faq" || slug === "faqs"
        ? fetch(`${apiUrl}/api/cms/faqs`, { cache: "no-store" })
        : Promise.resolve(null),
    ]);

    if (pageRes.ok) {
      const data = await pageRes.json();
      page = data?.page || null;
    }

    if (faqsRes && faqsRes.ok) {
      const faqData = await faqsRes.json();
      faqs = Array.isArray(faqData) ? faqData : faqData?.faqs || [];
    }
  } catch (err) {
    console.error(`Failed to fetch CMS page [${slug}]:`, err);
  }

  // If no page found, trigger Next.js not-found
  if (!page && faqs.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <FileText className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-xs text-muted-foreground">
            The requested policy or content page could not be located in our system.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    );
  }

  const title = page?.title || (slug === "faq" ? "Frequently Asked Questions" : slug);
  const content = page?.content || "";
  const updatedAt = page?.updatedAt ? new Date(page.updatedAt) : null;

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Page Header Card */}
        <article className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
          <header className="pb-6 border-b border-border space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Mem Service Official Policy</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              {title}
            </h1>

            {updatedAt && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated: {updatedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </p>
            )}
          </header>

          {/* CMS Rich Content Block */}
          {content && (
            <div
              className="cms-content max-w-none text-sm text-foreground/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}

          {/* Interactive FAQs Accordion (for /faq) */}
          {faqs.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Common Questions & Answers</h2>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <details
                    key={faq._id || idx}
                    className="group border border-border rounded-xl p-4 bg-muted/20 open:bg-muted/40 transition-colors"
                  >
                    <summary className="font-semibold text-sm text-foreground cursor-pointer list-none flex items-center justify-between gap-2">
                      <span>{faq.question}</span>
                      <span className="text-primary font-bold text-lg group-open:rotate-45 transition-transform">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/60">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
