import DoctorExperienceCard from "./DoctorExperienceCard";

const DoctorExperience = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <DoctorExperienceCard />
            <DoctorExperienceCard />
            <DoctorExperienceCard />
            <DoctorExperienceCard />
            <DoctorExperienceCard />
        </div>

    );
};

export default DoctorExperience;