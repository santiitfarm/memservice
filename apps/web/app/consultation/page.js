import Image from "next/image";
import Link from "next/link";

const ConsultationPage = () => {
    const departments = [
        {
            "icons": "https://img.icons8.com/external-tal-revivo-shadow-tal-revivo/96/external-cardiology-department-in-the-hospital-with-a-heart-and-an-oscillating-wave-logotype-hospital-shadow-tal-revivo.png",
            "name": "Cardiology",
            "description": "Focuses on the heart and circulatory system, diagnosing and treating conditions like heart disease, arrhythmias, and hypertension."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Neurology",
            "description": "Specializes in the brain, spinal cord, and nerves, managing conditions such as strokes, epilepsy, and neurodegenerative diseases."
        },
        {
            "icons":"https://img.icons8.com/external-tal-revivo-shadow-tal-revivo/96/external-bone-disorder-orthopedics-department-in-same-hospital-premises-hospital-shadow-tal-revivo.png",
            "name": "Orthopedics",
            "description": "Addresses issues of the musculoskeletal system, including fractures, joint replacements, and spinal deformities."
        },
        {
            "icons":"https://img.icons8.com/external-coco-line-kalash/96/external-pediatrics-human-body-anatomy-coco-line-kalash.png",
            "name": "Pediatrics",
            "description": "Provides comprehensive medical care for children from infancy through adolescence, including growth and development monitoring."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Gynecology-medical-service-beshi-color-kerismaker.png",
            "name": "Gynecology",
            "description": "Focuses on the health of the female reproductive system, addressing issues like menstruation, fertility, and menopause."
        },
        {
            "icons":"https://img.icons8.com/external-flatarticons-blue-flatarticons/65/external-oncology-world-cancer-awareness-flatarticons-blue-flatarticons.png",
            "name": "Oncology",
            "description": "Deals with the prevention, diagnosis, and treatment of cancer through chemotherapy, radiation, and surgical interventions."
        },
        {
            "icons":"https://img.icons8.com/external-flaticons-lineal-color-flat-icons/96/external-endocrinology-anatomy-flaticons-lineal-color-flat-icons-2.png",
            "name": "Endocrinology",
            "description": "Manages diseases related to hormones and endocrine glands, including diabetes, thyroid disorders, and metabolic conditions."
        },
        {
            "icons":"https://img.icons8.com/external-others-pike-picture/96/external-department-gastroenterology-and-hepatology-others-pike-picture.png",
            "name": "Gastroenterology",
            "description": "Specializes in the digestive system, treating conditions such as ulcers, IBS, and liver diseases."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Pulmonology",
            "description": "Focuses on respiratory system diseases, including asthma, COPD, and lung infections like pneumonia."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Nephrology",
            "description": "Treats kidney-related disorders such as chronic kidney disease, kidney stones, and hypertension."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Dermatology",
            "description": "Specializes in the diagnosis and treatment of skin, hair, and nail diseases, including acne, eczema, and psoriasis."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Psychiatry",
            "description": "Focuses on mental health conditions like depression, anxiety, and schizophrenia, offering therapy and medication."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Rheumatology",
            "description": "Deals with autoimmune diseases affecting joints and connective tissues, such as arthritis and lupus."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Ophthalmology",
            "description": "Treats eye-related conditions and disorders, including cataracts, glaucoma, and vision correction."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Otolaryngology (ENT)",
            "description": "Manages diseases of the ear, nose, and throat, including hearing loss, sinusitis, and voice disorders."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Hematology",
            "description": "Focuses on blood-related disorders such as anemia, clotting abnormalities, and leukemia."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Radiology",
            "description": "Uses imaging techniques like X-rays, CT scans, and MRIs for diagnosis and treatment planning."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Anesthesiology",
            "description": "Manages pain relief and anesthesia during surgeries, as well as post-operative care."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Urology",
            "description": "Specializes in the urinary tract and male reproductive system, addressing issues like UTIs, incontinence, and prostate health."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Emergency Medicine",
            "description": "Provides immediate care for acute illnesses, injuries, and life-threatening conditions in emergency settings."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Plastic Surgery",
            "description": "Focuses on reconstructive and cosmetic procedures to restore or enhance appearance and function."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Infectious Diseases",
            "description": "Diagnoses and treats diseases caused by bacteria, viruses, fungi, and parasites, including HIV and tuberculosis."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Allergy and Immunology",
            "description": "Manages allergies, asthma, and immune system disorders through specialized testing and treatments."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Geriatrics",
            "description": "Provides medical care for older adults, addressing age-related conditions like dementia and osteoporosis."
        },
        {
            "icons":"https://img.icons8.com/external-beshi-color-kerismaker/96/external-Neurology-medical-service-beshi-color-kerismaker.png",
            "name": "Pathology",
            "description": "Examines tissues, cells, and bodily fluids to diagnose diseases and guide treatment."
        }
    ];

    return (
        <section className='container mx-auto px-6'>
            <h1 className='text-4xl font-bold mb-8'>Please select your speciality</h1>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
                {
                    departments.map((dep, indx) => (
                        <Link href={`/consultation/${dep?.name.toLowerCase()}`} key={indx} className=" p-4 shadow-lg rounded-lg">
                            <div className="flex gap-5">

                                <Image width="96" height="96" src={dep?.icons} alt="external-cardiology-department-in-the-hospital-with-a-heart-and-an-oscillating-wave-logotype-hospital-shadow-tal-revivo" />

                                <div>
                                    <h1 className="text-gray-900 font-bold text-2xl">{dep?.name}</h1>
                                    <p className="text-[#4B5563] text-sm">{dep?.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))
                }
            </div>
        </section>
    );
};

export default ConsultationPage;