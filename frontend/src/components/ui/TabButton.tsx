import React from "react";

type Props = {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

export default function TabButton({ active, onClick, children }: Props) {
  return (
    <button
      onClick={onClick}
      className={`h-11 px-4 rounded-xl text-base font-medium transition ${active ? "bg-orange-600 text-white shadow" : "bg-white text-gray-700 hover:bg-gray-100"}`}
    >
      {children}
    </button>
  );
}
