
const DoctorMoreInfoButton = ({children, name}) => {
    return (
        <button className='text-[#6b7280] flex items-center gap-1 pb-4 border-b-2 border-transparent hover:border-[#4285f4] -mb-6'>{children } {name}</button>
    );
};

export default DoctorMoreInfoButton;