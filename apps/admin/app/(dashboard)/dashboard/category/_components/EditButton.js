"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import CategoryForm from "./CategoryForm";
import RelativeModal from "../../components/RelativeModal";

export default function EditButton({ category }) {
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
        <RelativeModal setShowForm={toggleModal} title={"Edit Category"}>
          <CategoryForm
            setShowForm={toggleModal}
            isEdit={true}
            category={category}
          />
        </RelativeModal>
      )}
    </div>
  );
}
