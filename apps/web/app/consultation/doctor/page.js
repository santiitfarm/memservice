import DoctorProfile from "../components/DoctorProfile";

const DoctorPage =async () => {
    
    const response = await fetch(`${process.env.API_URL}/api/doctors`)
    const doctors = await response.json()

    return (
        <section className='container mx-auto px-6'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
                {
                    doctors.map((doctor, indx) => (
                        <DoctorProfile doc={doctor} key={indx} />
                    ))
                }
            </div>
        </section>
    );
};

export default DoctorPage;