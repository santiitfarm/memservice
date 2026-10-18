import { AiOutlineSearch } from "react-icons/ai";

const DoctorsFilters = ({
  doctors,
  searchTerm,
  setSearchTerm,
  departmentFilter,
  setDepartmentFilter,
  specialty,
  setSpecialty,
}) => {
  const departments = Array.from(new Set(doctors.map((doc) => doc.department)));
  const specialties = Array.from(new Set(doctors.map((doc) => doc.specialty)));

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative border rounded flex items-center px-3 col-span-2">
          <input
            type="text"
            placeholder="Search doctors..."
            className="w-full px-4 py-2 bg-inherit  outline-none dark:text-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AiOutlineSearch className="text-2xl text-gray-400" />
        </div>

        {/* Category Filter */}
        <select
          className="px-4 py-2 border rounded-md bg-inherit focus:outline-none focus:ring-2 capitalize dark:text-gray-400 focus:ring-blue-500"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="All">All Departments</option>
          {departments.map((dep) => (
            <option key={dep} value={dep} className="capitalize">
              {dep}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          className="px-4 py-2 border rounded-md bg-inherit focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-400"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        >
          <option value="All">All Specialty</option>
          {specialties.map((spc) => (
            <option key={spc} value={spc} className="capitalize">
              {spc}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DoctorsFilters;
