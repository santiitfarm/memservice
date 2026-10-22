"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { Loader2, X, ChevronRight, Tag } from "lucide-react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  // Debounced search suggestion fetcher
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${apiUrl}/api/catalog/suggest?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.success) {
            setResults(data);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error("Autocomplete error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSelect = () => {
    setIsOpen(false);
  };

  const hasResults =
    results &&
    ((results.products && results.products.length > 0) ||
      (results.categories && results.categories.length > 0) ||
      (results.brands && results.brands.length > 0));

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length > 0) setIsOpen(true);
          }}
          placeholder="Search medicines, healthcare products, brands..."
          className="w-full h-11 md:h-12 pl-4 pr-24 rounded-full border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults(null);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-12 text-muted-foreground hover:text-foreground p-1 transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}

        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1 top-1 bottom-1 w-10 md:w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <CiSearch className="text-xl text-white stroke-1" />
          )}
        </button>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card text-card-foreground border border-border rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-border/60 max-h-[460px] overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-150">
          {loading && !results && (
            <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Searching catalog...</span>
            </div>
          )}

          {!loading && !hasResults && (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No items found for &ldquo;<span className="font-semibold text-foreground">{query}</span>&rdquo;
              </p>
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="mt-3 text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
              >
                Search all catalog products <ChevronRight size={14} />
              </button>
            </div>
          )}

          {hasResults && (
            <>
              {/* Matched Categories & Brands chips */}
              {((results.categories && results.categories.length > 0) ||
                (results.brands && results.brands.length > 0)) && (
                <div className="p-3 bg-muted/30">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                    Categories & Brands
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {results.categories?.map((cat) => (
                      <Link
                        key={cat.id || cat.slug}
                        href={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`}
                        onClick={handleSelect}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-card border border-border hover:border-primary hover:text-primary transition-colors"
                      >
                        <Tag size={11} className="text-primary" />
                        <span>{cat.name}</span>
                      </Link>
                    ))}
                    {results.brands?.map((b) => (
                      <Link
                        key={b.id || b.slug}
                        href={`/shop?brand=${encodeURIComponent(b.slug || b.name)}`}
                        onClick={handleSelect}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-card border border-border hover:border-primary hover:text-primary transition-colors"
                      >
                        <span className="font-semibold text-primary">B:</span>
                        <span>{b.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Products List */}
              {results.products && results.products.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground p-3 pb-1">
                    Products ({results.products.length})
                  </div>
                  <ul className="divide-y divide-border/40">
                    {results.products.map((prod) => {
                      const productHref = prod.slug ? `/product/${prod.slug}` : `/product/${prod.id}`;
                      const isDiscounted = prod.discountPrice > 0 && prod.discountPrice < prod.regularPrice;

                      return (
                        <li key={prod.id}>
                          <Link
                            href={productHref}
                            onClick={handleSelect}
                            className="flex items-center gap-3 p-2.5 hover:bg-muted/60 transition-colors group"
                          >
                            <div className="w-12 h-12 rounded-lg bg-muted/40 p-1 shrink-0 overflow-hidden border border-border/50 flex items-center justify-center">
                              {prod.image ? (
                                <Image
                                  src={prod.image}
                                  alt={prod.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="text-[10px] text-muted-foreground">No img</div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                {prod.name}
                              </p>
                              {prod.manufacturer && (
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {prod.manufacturer}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  ৳{prod.price}
                                </span>
                                {isDiscounted && (
                                  <del className="text-[11px] text-muted-foreground">
                                    ৳{prod.regularPrice}
                                  </del>
                                )}
                                {!prod.inStock && (
                                  <span className="text-[10px] text-rose-500 font-medium ml-auto">
                                    Out of stock
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* View all results button */}
              <div className="p-2.5 bg-muted/20 text-center">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full py-1.5 text-xs font-medium text-primary hover:underline inline-flex items-center justify-center gap-1"
                >
                  View all results for &ldquo;{query}&rdquo;
                  <ChevronRight size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
