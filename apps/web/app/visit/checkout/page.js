import { UserPlus } from "lucide-react";
import Link from "next/link";

const DoctorVisitCheckOuPage = async ({ searchParams }) => {
  const doctor_id = (await searchParams).doctor_id;

  const doctor = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/doctors/${doctor_id}`
  );
  const data = await doctor.json();
  console.log(data);
  //   const submitForm = (e) => {
  //     e.preventDefault();

  //     const name = e.currentTarget.name.value;
  //     const number = e.currentTarget.number.value;

  //     console.log(name);
  //     console.log(number);
  //   };

  // const message = "Hello, I would like to inquire about your services!";
  // const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/${data?.doctor?.contract_number}`;
  // const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <section className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <form>
          <div className="flex items-center mb-4">
            <span className="bg-gray-200 p-2 rounded-full">
              <UserPlus />
            </span>
            <h2 className="text-lg font-medium ml-2">Patient details</h2>
          </div>

          <div className="flex flex-col space-y-2 rounded-lg px-4 py-2 mb-4">
            <input
              type="text"
              name="name"
              id="name"
              required
              placeholder="Enter your name"
              className=" border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 p-1"
            />
            <input
              type="text"
              name="number"
              id="number"
              required
              placeholder="Enter your mobile number"
              className=" border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 p-1"
            />
          </div>

          <p className="text-sm text-gray-500 mb-4">
            You agree to our{" "}
            <Link
              href="/terms-and-conditions"
              className="text-blue-500 underline"
            >
              Terms of Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="text-blue-500 underline">
              Privacy Policy
            </Link>
            .
          </p>

          <Link
            href={whatsappLink}
            // onClick={() => window.open(whatsappLink, "_blank")}
            type="submit"
            className="w-56 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Send Whatsapp message
          </Link>
        </form>
      </div>
    </section>
  );
};

export default DoctorVisitCheckOuPage;
