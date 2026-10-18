import { useSession } from "next-auth/react";
import FormInput from "./FormInput";

const BillingForm = () => {
  const { data: session, status } = useSession();

  return (
    <div className="lg:w-2/6 flex flex-col lg:flex-row gap-4 rounded-md p-4 border border-gray-200">
      <div className="w-full">
        <h1 className="text-2xl mb-4 text-[#184363] font-bold">
          Billing Method
        </h1>
        {/* Name Input */}
        <FormInput
          label="Your Name"
          type="text"
          id="name"
          name="name"
          placeholder="Your name"
          defaultValue={session?.user?.customer_name}
        />
        {/* Phone Input */}
        <FormInput
          label="Phone Number"
          type="number"
          id="number"
          name="number"
          placeholder="Your number"
          defaultValue={session?.user?.phone_number}
        />
        {/* Email Input */}
        <FormInput
          label="Email address"
          type="email"
          id="email"
          name="email"
          placeholder="Your email address"
          defaultValue={session?.user?.email}
        />
        {/* Address Textarea */}
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-[#56778F]"
          >
            Full address
          </label>
          <textarea
            id="address"
            defaultValue={session?.user?.address}
            name="address"
            placeholder="Enter Address"
            rows="3"
            className="mb-4 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default BillingForm;
