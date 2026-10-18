import Link from "next/link";
// import lucide icon
import { MoveRight } from "lucide-react";
// import components
import ColumnCard from "../productCart/columnsCart/ColumnCard";
function DynamicProductShowcase({
  productData,
  sectionName,
  viewAllUrl,
  shop,
}) {
  return (
    <main className="container mx-auto flex flex-col px-3 lg:px-6 gap-8">
      <div className="flex justify-between">
        <h3 className="text-xl md:text-2xl font-bold text-deep-sea-blue capitalize">
          {sectionName}
        </h3>

        <Link
          href={`/${viewAllUrl}`}
          className="group text-base md:text-lg capitalize flex items-center gap-1 md:gap-2 text-sky-blue "
        >
          {!shop && (
            <>
              <span>view All</span>
              <span className="transition-all duration-300 group-hover:translate-x-2">
                <MoveRight size={16} strokeWidth={2} />
              </span>
            </>
          )}
        </Link>
      </div>
      {/* product Cart */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-6">
        {productData.map((product, ind) => (
          <div key={ind}>
            <ColumnCard productData={product} />
          </div>
        ))}
      </div>
    </main>
  );
}

export default DynamicProductShowcase;
