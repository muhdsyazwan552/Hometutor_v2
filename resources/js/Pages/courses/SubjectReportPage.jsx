import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import SubjectLayout from '@/Layouts/SubjectLayout';

export default function SubjectReportPage() {
  const { props } = usePage();
  const subjectKey = props.subject;

    // State to manage the visibility of the dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Toggle dropdown visibility
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <SubjectLayout subject={subjectKey} activeTab="Report">
         

            {/* Report Content */}
            <div className="py-8 mx-6 mt-6">
                <div className="bg-white rounded-lg shadow px-6 py-8 max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📘 Subjective Analysis</h2>
                    <p className="text-gray-600 mb-6">
                        This report analyses the subjective that you have done earlier and helps to evaluate your progress.
                    </p>

                    {/* Accordion-like section */}
                    <div className="border rounded overflow-hidden">
                        <div className="bg-gray-100 p-4 font-semibold text-gray-700">Progress Details</div>

                        {/* KARANGAN Dropdown */}
                        <div className="border-t">
                            <div className="bg-gray-200 px-4 py-3 font-bold text-gray-800 flex justify-between items-center">
                                <div className='flex' >
                                    <button
                                    onClick={toggleDropdown}
                                    className="text-sky-500 hover:text-sky-700 flex items-center"
                                >
                                    {/* Icon based on dropdown state */}
                                     {isDropdownOpen ? <span>&#8722;</span> : <span>&#43;</span>}
                    {/* &#8722; = Minus, &#43; = Plus */}
              
                                    <span className="ml-2">
                                        {isDropdownOpen ? '' : ''} 
                                    </span>
                                </button>

                                📝 KARANGAN 
                                </div>
                                 
                               
                            </div>
                            {isDropdownOpen && (
                                
                                <div className="divide-y">
                                    <div className="px-4 py-2 flex justify-between bg-gray-200">
                                        <span className="block text-sm font-normal text-gray-600">Subtopic</span>
                                    
                                    <div className='flex gap-10 justify-between items-center px-4'>
                                        <span className="block text-sm font-normal text-gray-600">Total Session</span>
                                        <span className="block text-sm font-normal text-gray-600">Last Session</span>
                                    </div>
                                    </div>

                                    

                                    <div className="px-4 py-2 flex justify-between hover:bg-gray-50">
                                        <span>Keperihalan</span>

                                        <div className='flex gap-6 items-center px-4'>
                                        <span className="text-gray-400">-</span>
                                        <span className="text-gray-400">-</span>
                                    </div>
                                    </div>
                                    <div className="px-4 py-2 flex justify-between hover:bg-gray-50">
                                        <span>Pendapat</span><span className="text-gray-400">-</span>
                                    </div>
                                    <div className="px-4 py-2 flex justify-between hover:bg-gray-50">
                                        <span>Rencana</span><span className="text-gray-400">-</span>
                                    </div>
                                    <div className="px-4 py-2 flex justify-between hover:bg-gray-50">
                                        <span>Fakta</span><span className="text-gray-400">-</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Other sections */}
                        <div className="border-t">
                            <div className="px-4 py-3 font-bold text-gray-800 bg-gray-100">📝 KARANGAN BERPANDUKAN RANGSANGAN</div>
                        </div>
                        <div className="border-t">
                            <div className="px-4 py-3 font-bold text-gray-800 bg-gray-100">📝 KOMPONEN SASTERA</div>
                        </div>
                        <div className="border-t">
                            <div className="px-4 py-3 font-bold text-gray-800 bg-gray-100">📝 RUMUSAN</div>
                        </div>
                        <div className="border-t">
                            <div className="px-4 py-3 font-bold text-gray-800 bg-gray-100">📝 PENGETAHUAN DAN KEMAHIRAN BAHASA</div>
                        </div>
                    </div>
                </div>
            </div>
        </SubjectLayout>
    );
}
