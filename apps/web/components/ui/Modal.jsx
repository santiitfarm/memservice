"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({
  isOpen = false,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-lg",
  showClose = true,
  className = "",
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    modalRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} rounded-xl border border-border bg-card text-card-foreground shadow-2xl z-10 transition-all outline-none animate-in zoom-in-95 duration-200 ${className}`}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              {title && (
                <h3 id="modal-title" className="text-lg font-bold text-foreground">
                  {title}
                </h3>
              )}
              {description && (
                <p id="modal-description" className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </p>
              )}
            </div>

            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
