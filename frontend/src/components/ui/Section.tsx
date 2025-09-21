import React from "react";

type Props = {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
};

export default function Section({ title, right, children }: Props) {
  return (
    <div className="bg-white/70 rounded-2xl shadow p-4 md:p-6 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}
