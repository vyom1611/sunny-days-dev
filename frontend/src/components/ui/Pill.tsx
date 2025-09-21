import React from "react";

type Props = {
  children: React.ReactNode;
  active?: boolean;
};

export default function Pill({ children, active }: Props) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${active ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-700"}`}>
      {children}
    </span>
  );
}
