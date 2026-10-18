"use client";

import { useState } from "react";
import BackButton from "../components/ui/BackButton";
import Banner from "./_components/Banner/Banner";
import BannerForm from "./_components/Banner/BannerForm";
import Modal from "./_components/Modal";
import Slider from "./_components/Slider/Slider";
import SliderForm from "./_components/Slider/SliderForm";

const SliderPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState(""); // To track the type of form to render
  const [formData, setFormData] = useState(null); // To track the data for the form
  const [isEdit, setIsEdit] = useState(false);

  const openModal = (data, type, action) => {
    setIsModalOpen(true);
    setFormData(data);
    setFormType(type); // Set the form type (e.g., "slider" or "offer")
    setIsEdit(action === "edit");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormType(""); // Reset the form type when modal is closed
  };

  return (
    <div className="p-4 w-full">
      <BackButton />
      <div className="my-2">
        {/* Pass the appropriate type to the openModal function */}
        <Slider
          openModal={(data, action) => openModal(data, "slider", action)}
        />
        <Banner
          openModal={(data, action) => openModal(data, "banner", action)}
        />
        {/* <Countdown
          openModal={(data, action) => openModal(data, "countdown", action)}
        />
        <Weekend
          openModal={(data, action) => openModal(data, "weekend", action)}
        />
        <Exclusive
          openModal={(data, action) => openModal(data, "exclusive", action)}
        />
        <Deal openModal={(data, action) => openModal(data, "deal", action)} /> */}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {/* Render the appropriate form based on the formType */}
        {formType === "slider" && (
          <SliderForm onClose={closeModal} slider={formData} isEdit={isEdit} />
        )}

        {formType === "banner" && (
          <BannerForm onClose={closeModal} banner={formData} isEdit={isEdit} />
        )}
        {/* {formType === "deal" && (
          <DealForm onClose={closeModal} deal={formData} isEdit={isEdit} />
        )}

        {formType === "weekend" && (
          <WeekendForm
            onClose={closeModal}
            weekend={formData}
            isEdit={isEdit}
          />
        )}

        {formType === "exclusive" && (
          <ExclusiveForm
            onClose={closeModal}
            exclusive={formData}
            isEdit={isEdit}
          />
        )}

        {formType === "countdown" && (
          <CountdownForm
            onClose={closeModal}
            countdown={formData}
            isEdit={isEdit}
          />
        )} */}
      </Modal>
    </div>
  );
};

export default SliderPage;
