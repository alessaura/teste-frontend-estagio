"use client";
import React from "react";

interface SubmitButtonProps {
  title: string;
  className?: string;
  disabled?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  title,
  className = "",
  disabled = false,
}) => {
  const baseClasses =
    "w-full py-3 px-4 bg-primary-purple text-white font-medium rounded-lg hover:bg-secondary-purple transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-purple/20";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      type="submit"
      disabled={disabled}
      className={`${baseClasses} ${disabledClasses} ${className}`}
    >
      {title}
    </button>
  );
};

export default SubmitButton;
