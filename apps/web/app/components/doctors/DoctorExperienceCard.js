
const DoctorExperienceCard = () => {
    return (
        <div className="p-6 bg-white rounded shadow">
            <h2 className="text-lg font-semibold">
                <span className="font-normal">মুগদা মেডিকেল কলেজ হাসপাতাল, ঢাকা |</span>
                <span className="ml-2">Mugda Medical College Hospital</span>
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                    <h3 className="font-medium">Designation</h3>
                    <p className="text-gray-700">Medical Officer</p>
                </div>
                <div>
                    <h3 className="font-medium">Department</h3>
                    <p className="text-gray-700">COVID & Non-COVID Emergency</p>
                </div>
                <div>
                    <h3 className="font-medium">Employment Period</h3>
                    <p className="text-gray-700">May 1, 2021 - Dec 27, 2021</p>
                </div>
            </div>
            <div className="mt-4">
                <h3 className="font-medium">Period</h3>
                <p className="text-gray-700">7 months</p>
            </div>
        </div>
    );
};

export default DoctorExperienceCard;