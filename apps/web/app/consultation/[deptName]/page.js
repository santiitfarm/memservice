import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import DoctorProfile from "../components/DoctorProfile";

const DepartmentDoctorPage = async ({ params }) => {

    const { deptName } = await params;

    const dept =  capitalizeFirstLetter(deptName);

    const doctors = [
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. John Smith",
            "degree": "MD",
            "department": "Cardiology",
            "specialty": "MBBS, BCS (Health), MD (Pediatric Hematology & Oncology)  MD (Pediatric Hematology & Oncology)  MD (Pediatric Hematology & Oncology)",
            "experience": 15,
            "hospital_name": "City Heart Center"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Emily Johnson",
            "degree": "MBBS, MS",
            "department": "Orthopedics",
            "specialty": "MBBS, BCS (Health), MD (Pediatric Hematology & Oncology)  MD (Pediatric Hematology & Oncology)  MD (Pediatric Hematology & Oncology)",
            "experience": 12,
            "hospital_name": "Bone & Joint Hospital"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Michael Brown",
            "degree": "MD, DM",
            "department": "Neurology",
            "specialty": "MBBS, BCS (Health), MD (Pediatric Hematology & Oncology)  MD (Pediatric Hematology & Oncology)  MD (Pediatric Hematology & Oncology)",
            "experience": 10,
            "hospital_name": "NeuroCare Institute"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Sarah Davis",
            "degree": "MBBS, MD",
            "department": "Pediatrics",
            "specialty": "Neonatal Care",
            "experience": 8,
            "hospital_name": "Children's Specialty Clinic"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. William Wilson",
            "degree": "MD",
            "department": "Oncology",
            "specialty": "MBBS, BCS (Health), MD (Pediatric Hematology & Oncology)  MD (Pediatric Hematology & Oncology)  MD (Pediatric Hematology & Oncology)",
            "experience": 20,
            "hospital_name": "Cancer Care Center"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Jessica Martinez",
            "degree": "MD, MS",
            "department": "Dermatology",
            "specialty": "Cosmetic Dermatology",
            "experience": 7,
            "hospital_name": "Skin & Hair Clinic"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. David Anderson",
            "degree": "MBBS, MS",
            "department": "Surgery",
            "specialty": "Laparoscopic Surgery",
            "experience": 14,
            "hospital_name": "General Hospital"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Lisa Moore",
            "degree": "MD, DM",
            "department": "Endocrinology",
            "specialty": "Diabetes Management",
            "experience": 11,
            "hospital_name": "Hormone Health Center"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. James Taylor",
            "degree": "MBBS, MD",
            "department": "Pulmonology",
            "specialty": "Asthma and COPD Management",
            "experience": 9,
            "hospital_name": "Lung Care Clinic"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Laura White",
            "degree": "MD",
            "department": "Psychiatry",
            "specialty": "Child and Adolescent Psychiatry",
            "experience": 13,
            "hospital_name": "Mental Wellness Center"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Robert Clark",
            "degree": "MBBS, MD",
            "department": "Gastroenterology",
            "specialty": "Liver Disease Management",
            "experience": 17,
            "hospital_name": "Digestive Health Hospital"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Karen Harris",
            "degree": "MD, MS",
            "department": "Gynecology",
            "specialty": "Infertility Treatment",
            "experience": 16,
            "hospital_name": "Women's Health Hospital"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Charles Lewis",
            "degree": "MD",
            "department": "Radiology",
            "specialty": "Interventional Radiology",
            "experience": 12,
            "hospital_name": "Advanced Imaging Center"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Susan Walker",
            "degree": "MBBS, MD",
            "department": "Hematology",
            "specialty": "Blood Clotting Disorders",
            "experience": 6,
            "hospital_name": "Blood & Clot Clinic"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Thomas Hall",
            "degree": "MBBS, MS",
            "department": "Urology",
            "specialty": "Kidney Stone Treatment",
            "experience": 18,
            "hospital_name": "Renal Health Center"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Patricia Allen",
            "degree": "MD",
            "department": "Nephrology",
            "specialty": "Dialysis and Transplant Care",
            "experience": 15,
            "hospital_name": "Kidney Care Clinic"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Christopher Young",
            "degree": "MD",
            "department": "Rheumatology",
            "specialty": "Rheumatoid Arthritis Management",
            "experience": 8,
            "hospital_name": "Joint Health Center"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Amanda Hernandez",
            "degree": "MBBS, MS",
            "department": "Ophthalmology",
            "specialty": "Cataract Surgery",
            "experience": 10,
            "hospital_name": "Vision Care Hospital"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Daniel King",
            "degree": "MD, DM",
            "department": "Allergy and Immunology",
            "specialty": "Food Allergy Treatment",
            "experience": 9,
            "hospital_name": "ImmunoHealth Clinic"
        },
        {
            "image": "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
            "name": "Dr. Barbara Wright",
            "degree": "MD, MS",
            "department": "Emergency Medicine",
            "specialty": "Trauma and Critical Care",
            "experience": 19,
            "hospital_name": "City Emergency Hospital"
        }
    ];

    return (
        <section className='container mx-auto px-6'>
            <h1 className='text-lg text-[#475569] my-4'>{dept} department</h1>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
                {
                    doctors.map((doctor, indx) => (
                        <DoctorProfile doc={doctor} key={indx} />
                    ))
                }
            </div>
        </section>
    );
};

export default DepartmentDoctorPage;