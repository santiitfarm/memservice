import Image from "next/image";
import Link from "next/link";
// import components
import SearchCompo from "./Search";

// import react icon
import { Menu, Search } from "lucide-react";
import { PiPhoneCallThin } from "react-icons/pi";
import { X, PhoneCall } from "lucide-react";

// shadcn/ui components
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function SearchAndSupport({ menuData }) {
  const response = await fetch(`${process.env.API_URL}/api/category`);
  const data = await response.json();
  const categoryData = data?.categories;

  return (
    <section className="flex items-center justify-between gap-20">
      {/* Logo Section */}
      <Link href={"/"}>
        <Image
          className="w-full max-h-14 sm:max-h-16 lg:max-h-36 object-contain"
          src={"/assets/logo/logo.png"}
          width={400}
          height={400}
          alt=""
        />
      </Link>
      {/* Search Section */}
      <div className="w-full hidden lg:block">
        <SearchCompo />
      </div>
      {/* Support Section */}
      <div className="">
        <div className="hidden lg:block">
          <div className="flex items-center gap-3 text-2xl text-sk">
            <span>
              <PiPhoneCallThin />
            </span>
            <p className="flex flex-col text-nowrap text-sm text-black">
              <span>Sales & Service Support</span>
              <span>
                <a href="tel:01711-655686">+8801711655686</a>
              </span>
            </p>
          </div>
        </div>

        <div className="relative flex items-center gap-6 lg:hidden">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Search size={25} strokeWidth={1.75} />
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[97%] top-32 bg-transparent border-none p-4 rounded-md block lg:hidden">
              <SearchCompo />
              <AlertDialogFooter>
                <AlertDialogCancel className="absolute text-2xl -top-10 right-0 bg-transparent border-none text-white ">
                  <X size={48} strokeWidth={2} />
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {/*  */}
          <Sheet>
            <SheetTrigger asChild>
              <Menu variant="outline" />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="max-w-[370px] w-full px-0 pt-2 block lg:hidden overflow-scroll "
            >
              <div>
                <Tabs className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent px-3 gap-3 z-[5000000000000]">
                    <TabsTrigger
                      className="w-full h-10 rounded-full text-deep-sea-blue font-bold bg-light-mist data-[state=active]:bg-sky-blue data-[state=active]:text-white leading-5 border-none z-10"
                      value="menu"
                    >
                      Menu
                    </TabsTrigger>
                    <TabsTrigger
                      className="w-full h-10 rounded-full text-deep-sea-blue font-bold bg-light-mist data-[state=active]:bg-sky-blue data-[state=active]:text-white leading-5 border-none z-10"
                      value="shop"
                    >
                      Shop
                    </TabsTrigger>
                  </TabsList>
                  {/* Menu */}
                  <TabsContent value="menu">
                    <div className="flex flex-col gap-4 mt-8 px-4">
                      {menuData.map((navList, ind) => (
                        <Link
                          className="capitalize text-deep-sea-blue text-[15px] font-semibold w-full"
                          href={navList?.url}
                          key={ind}
                        >
                          <SheetClose>{navList?.name}</SheetClose>
                        </Link>
                      ))}
                    </div>
                    <p className="border-t border-neutral-gray opacity-20 my-8" />
                    <div className="flex flex-col items-center gap-4 px-4">
                      <p className="w-full h-[48px] mx-auto flex items-center gap-2 px-2 text-[15px] font-semibold rounded-full justify-center bg-light-mist text-sky-blue capitalize">
                        <PhoneCall size={18} strokeWidth={1.5} />
                        Sales & service support
                      </p>
                      <p className="text-xs text-neutral-gray">
                        Due to the COVID 19 epidemic, orders may be processed
                        with a slight delay
                      </p>
                    </div>
                  </TabsContent>
                  {/* Sop */}
                  <TabsContent value="shop">
                    <div className="flex flex-col gap-4 mt-8 px-4">
                      {categoryData.map((category, ind) => (
                        <Link
                          className="capitalize text-deep-sea-blue text-[15px] font-semibold"
                          href={`shop?categoryName=${category?.categoryName}`}
                          key={ind}
                        >
                          <SheetClose>{category?.categoryName}</SheetClose>
                        </Link>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </section>
  );
}

export default SearchAndSupport;
