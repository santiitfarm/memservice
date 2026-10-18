import Image from "next/image";
function Loading() {
  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <Image src={"/assets/gif/loading.gif"} width={400} height={400} alt="" />
      <p className="text-center text-sky-blue capitalize">
        Please wait while the page is loading
      </p>
    </div>
  );
}

export default Loading;
