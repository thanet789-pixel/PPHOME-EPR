"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "md" | "lg" | "xl";
  type?: "modal" | "drawer";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  type = "drawer",
}: ModalProps) {
  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  if (type === "drawer") {
    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Dark blurred backdrop overlay */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        />

        {/* Drawer slide-over container */}
        <div
          className={`relative z-10 w-full ${sizeClasses[size]} h-full bg-zinc-950/95 border-l border-zinc-900 shadow-2xl flex flex-col justify-between py-6 px-6 fade-in-up md:animate-none md:translate-x-0 transition-transform duration-300`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-900/80 pb-4">
            <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-900/30 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Form Scrollable Body */}
          <div className="flex-1 overflow-y-auto py-6 pr-1 pl-1">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Fallback Standard Modal view
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark blurred backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal card */}
      <div
        className={`relative z-10 w-full ${sizeClasses[size]} rounded-2xl glass-panel p-6 shadow-2xl flex flex-col gap-4 fade-in-up`}
      >
        <div className="flex items-center justify-between border-b border-zinc-900/80 pb-3">
          <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-zinc-900/30 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[75vh] py-2">{children}</div>
      </div>
    </div>
  );
}
