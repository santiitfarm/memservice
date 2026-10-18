import Link from "next/link";

function NotFound() {
  return (
    <section className="container h-[65vh] mx-auto px-10 flex flex-col items-center justify-center">
      <h1 className="text-7xl md:text-8xl xl:text-9xl font-bold text-sky-blue">
        404
      </h1>
      <p className="text-sm md:text-base text-neutral-gray text-center border-b border-soft-lavender pb-2 md:pb-4">
        This page either doesn’t exist, or it moved somewhere else.
      </p>

      <p className="text-deep-sea-blue text-lg md:text-2xl pt-2 md:pt-4">
        That’s what you can do
      </p>
      <Link
        className="text-sm md:text-base text-sky-blue hover:text-deep-sea-blue border
         border-sky-blue hover:border-deep-sea-blue px-4 py-2 rounded-full mt-2 md:mt-4 capitalize transition-all duration-300"
        href={"/"}
      >
        Go to home page
      </Link>
    </section>
  );
}

export default NotFound;
