// resources/js/Layouts/StudentLayout.jsx
import React from 'react';
import SubjectLayout from './SubjectNavbar';

export default function StudentLayout({ title = "Dashboard", children, bgColor = "bg-white" }) {
  return (
    <div className={`min-h-screen mx-auto max-w-8xl px-6 sm:px-6 lg:px-0 font-sans text-gray-800 ${bgColor}`}>
      <SubjectLayout title={title} />
      <main className="bg-gray-50">{children}</main>
    </div>
  );
}