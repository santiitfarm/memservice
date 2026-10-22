"use client";

import { useState, useMemo } from "react";
import DoctorProfile from "./DoctorProfile";
import { Search, Stethoscope, Filter, X } from "lucide-react";

export default function DoctorDirectory({
  initialDoctors = [],
  categories = [],
  selectedDepartment = "all",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState(selectedDepartment);

  // Normalize departments list
  const deptList = useMemo(() => {
    const set = new Set();
    categories.forEach((c) => {
      const name = c.categoryName || c.name;
      if (name) set.add(name);
    });
    initialDoctors.forEach((d) => {
      if (d.department) set.add(d.department);
    });
    return Array.from(set);
  }, [categories, initialDoctors]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return initialDoctors.filter((doc) => {
      const matchesDept =
        department === "all" ||
        (doc.department || "").toLowerCase() === department.toLowerCase();

      if (!matchesDept) return false;

      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      const nameMatch = (doc.name || "").toLowerCase().includes(q);
      const specMatch = (doc.specialty || "").toLowerCase().includes(q);
      const hospMatch = (doc.hospital_name || "").toLowerCase().includes(q);
      const degreeMatch = (doc.degree || "").toLowerCase().includes(q);

      return nameMatch || specMatch || hospMatch || degreeMatch;
    });
  }, [initialDoctors, department, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctor by name, specialty, or hospital..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Department Select (for mobile/small screens) */}
          <div className="md:hidden flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Departments ({initialDoctors.length})</option>
              {deptList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Department Chips (Desktop / Tablet) */}
        <div className="hidden md:flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setDepartment("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              department === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            All Departments ({initialDoctors.length})
          </button>
          {deptList.map((dept) => {
            const count = initialDoctors.filter(
              (d) => (d.department || "").toLowerCase() === dept.toLowerCase()
            ).length;
            const active = department.toLowerCase() === dept.toLowerCase();
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setDepartment(active ? "all" : dept)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {dept} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <strong className="text-foreground">{filteredDoctors.length}</strong> available{" "}
          {filteredDoctors.length === 1 ? "specialist" : "specialists"}
        </span>
        {(department !== "all" || searchTerm) && (
          <button
            type="button"
            onClick={() => {
              setDepartment("all");
              setSearchTerm("");
            }}
            className="text-primary hover:underline font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Doctor Cards Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-16 px-4 bg-muted/40 rounded-2xl border border-dashed border-border max-w-xl mx-auto">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No Doctors Match Your Search</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Try adjusting your search terms or selecting a different medical department.
          </p>
          <button
            type="button"
            onClick={() => {
              setDepartment("all");
              setSearchTerm("");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm"
          >
            View All Doctors
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <DoctorProfile key={doc._id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
