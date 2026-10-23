"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import RelativeModal from "../../components/RelativeModal";
import BrandForm from "./BrandForm";

export default function EditButton({ brand }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <Button
        size="sm"
        variant="outline"
        onClick={toggleModal}
        className="h-7 px-2.5 text-xs font-medium"
      >
        Edit
      </Button>

      {isOpen && (
        <RelativeModal setShowForm={toggleModal} title={"Edit Brand"}>
          <BrandForm setShowForm={toggleModal} isEdit={true} brand={brand} />
        </RelativeModal>
      )}
    </div>
  );
}
