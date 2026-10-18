const FormInput = ({ label, ...props }) => {
  return (
    <div>
      <label
        htmlFor={props.id}
        className="block text-sm font-medium text-[#56778F]"
      >
        {label}
      </label>
      <input
        {...props}
        className="mb-4 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        required
      />
    </div>
  );
};

export default FormInput;
