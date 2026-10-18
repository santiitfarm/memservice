"use client";

import { Delete } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import BackButton from "../../components/ui/BackButton";
import ImageUpload from "../../products/new/components/ImageUpload";
import CodeEditor from "../../products/new/components/RichTextEditor";
import {
  useFetchdoctorByIdQuery,
  useUpdateDoctorMutation,
} from "@/store/slices/doctorApi";
import Loading from "../../components/Loading";
import { useEffect } from "react";
import { toast } from "react-toastify";

const SingleDoctorPage = ({ params }) => {
  //   const doctor = {
  //     doc_code: "1010",
  //     image:
  //       "https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/persons/155/profile_photos/WHwgabWELxZILtthsqT7r7PMzeJrpg88s3cIKfUQ.jpg",
  //     name: "Dr. John Smith",
  //     degree: "MD",
  //     department: "Cardiology",
  //     specialty: "MBBS, BCS (Health), MD (Pediatric Hematology & Oncology)",
  //     experience: 15,
  //     hospital_name: "City Heart Center",
  //     bmdc_number: "doc0101",
  //     total_consultation: 5,
  //     available_day: "sat, sun, mon",
  //     available_time: "5:30 pm - 9:00 pm",
  //     consultation_fee: "1500 taka",
  //     follow_up_fee: "1000 taka",
  //     "": "",
  //     info: `Assalamu Alaikum
  // I am Dr. Md. Mehedi Hasan,
  // M.B.B.S. (Dhaka), B.C.S. (Health)
  // M.D. (Pediatric Hematology and Oncology)
  // Child Hematology and Cancer Specialist,
  // Bangabandhu Sheikh Mujib Medical University
  // (PG Hospital), Shahbag, Dhaka.

  // You can get any health related advice and treatment services for your child.

  // ➤Fever,
  // ➤Cold,
  // ➤Cough,
  // ➤Difficult breathing,
  // ➤Pneumonia,
  // ➤Asthma,
  // ➤Skin diseases,itching,
  // ➤Stomach ache,vomiting,diarrhea,constipation,
  // ➤Dislike of food,worm problems,
  // ➤Jaundice,
  // ➤Hepatitis,
  // ➤Physical weakness,malnutrition,
  // ➤Problems in urination,burning in urination,frequent urination,
  // ➤Swelling of eyes,face and body,
  // ➤Anemia,
  // ➤Thalassemia
  // ➤Hemophilia,
  // ➤ITP,
  // ➤Aplastic anemia
  // ➤Seizures,mental development problems in children,
  // ➤Eye and ear problems,
  // ➤Corona in children,
  // ➤Cancer (leukemia, lymphoma, liver/kidney/bone/brain) You can get treatment and advice for various diseases including tumor/cancer

  // ➤Vaccine advice

  // .

  // I wish you and your child good health, thank you.`,
  //   };
  const docid = params.docId;
  const codeRef = useRef();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState();
  const [editedProduct, setEditedProduct] = useState({});
  const { data, isLoading, isSuccess, refetch } =
    useFetchdoctorByIdQuery(docid);
  const [
    updateDoctor,
    {
      isLoading: updateLoading,
      isSuccess: updateSuccess,
      isError: updateError,
    },
  ] = useUpdateDoctorMutation();
  useEffect(() => {
    isSuccess && setEditedProduct(data?.doctor);
  }, [isSuccess, data]);

  useEffect(() => {
    if (updateSuccess) {
      toast.dismiss();
      toast.success("Product updated successfully");
      setIsEditMode(false);
      refetch();
    }
    if (updateError) {
      toast.dismiss();
      toast.error("Error updating product");
    }
    if (updateLoading) {
      toast.dismiss();
      toast.info("Updating product...");
    }
  }, [updateError, updateSuccess, updateLoading]);

  if (isLoading) {
    return <Loading />;
  }
  const doctor = data.doctor;
  const handleInputChange = (field, value) => {
    setEditedProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSave = async () => {
    updateDoctor(editedProduct);
    refetch();
  };
  const onImagesChange = (link) => {
    setEditedProduct((prev) => {
      return { ...prev, image: link[link.length - 1] };
    });
  };
  const renderField = (label, field, type = "text") => {
    return (
      <div>
        <p className="text-gray-600 capitalize">{label}</p>
        {isEditMode ? (
          <input
            type={type}
            value={editedProduct[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 dark:text-gray-500"
          />
        ) : (
          <p className="font-medium dark:text-gray-500">{doctor[field]}</p>
        )}
      </div>
    );
  };

  const renderTextArea = (label, field) => {
    return (
      <>
        <p className="text-gray-600 capitalize">{label}</p>
        {isEditMode ? (
          <textarea
            // value={editedProduct[field].join("\n")}
            rows={4}
            // onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 dark:text-gray-500"
          />
        ) : (
          <p className="font-medium dark:text-gray-500">
            {/* {Array.isArray(editedProduct[field])
                            ? editedProduct[field].join(", ")
                            : editedProduct[field]} */}
          </p>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />

      {/* Top section */}
      <div className="flex justify-between items-center mb-6 sticky top-0 py-10 bg-white dark:bg-gray-900 z-10 pl-4">
        {isEditMode ? (
          <input
            type="text"
            value={doctor?.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="text-3xl font-bold text-gray-900 dark:text-gray-400 border rounded p-1"
          />
        ) : (
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-400">
            {doctor?.name}
          </h1>
        )}

        <div className="flex gap-2 items-center">
          {/* <div className="bg-green-400 font-black text-gray-600 px-4 py-2 rounded-md hover:bg-green-500 transition-colors flex items-center gap-2">
            Total consultation:
            <strong className="">{doctor?.total_consultation}</strong>
          </div> */}
          {isEditMode ? (
            <>
              <button
                onClick={handleSave}
                className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FaSave /> Save
              </button>
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setEditedProduct(data?.doctor);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FaTimes /> Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsOpenModal(true)}
                className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Delete /> Delete Doctor
              </button>
              {/* {isOpenModal && (
                                <DeleteConfirmationModal
                                    item={editedProduct}
                                    onClose={() => setIsOpenModal(false)}
                                    onDelete={() => {
                                        deleteProduct(editedProduct._id);
                                        router.push("/dashboard/products");
                                    }}
                                    type={"Product"}
                                />
                            )} */}
              <button
                onClick={() => setIsEditMode(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaEdit /> Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          {isEditMode ? (
            <ImageUpload
              onImagesChange={onImagesChange}
              images={[editedProduct?.image]}
            />
          ) : (
            <div className="border rounded-lg overflow-hidden mb-4 p-2">
              {doctor?.image && doctor?.image.length > 0 ? (
                <Image
                  src={doctor?.image}
                  alt={doctor?.name}
                  width={600}
                  height={600}
                  className="w-full h-96 object-contain"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  No Image Available
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 gap-2">
            <div className="flex justify-between items-center mb-4 gap-2">
              {renderField("Degree", "degree", "text")}
              {renderField("Department", "department", "text")}
              {renderField("Experience", "experience", "number")}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {renderField("BMDC number", "bmdc_number", "number")}
                {renderField("Doctor code", "doctor_code", "text")}
                {/* {renderField("Joining Date", "joining_date", "")} */}
                {renderField("Specialty", "specialty")}
                {renderField("Hospital Name", "hospital_name")}
                {renderField("Available day", "available_day")}

                {renderField("Consultation fee", "consultation_fee")}
                {renderField("Follow-up fee", "follow_up_fee")}
              </div>

              {/* {renderField("Doctor information", "info")} */}
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Info */}
      <div className="mt-8 bg-white dark:bg-gray-900 shadow rounded-lg p-6">
        <h3 className="text-2xl font-semibold mb-4  dark:text-gray-400 flex justify-between">
          Doctor Specifications
        </h3>
        {renderField("", "doctor_info")}

        {/* {isEditMode ? (
                    <>
                        <CodeEditor
                            ref={codeRef}
                            content={doctor.info}
                        />
                    </>
                ) : (
                    <>
                        <div
                            className="prose max-w-none text-gray-500 dark:text-gray-400"
                            dangerouslySetInnerHTML={{
                                __html:editedProduct.specificationsHtmlBangla,
                            }}
                        />
                    </>
                )} */}
      </div>
    </div>
  );
};

export default SingleDoctorPage;
