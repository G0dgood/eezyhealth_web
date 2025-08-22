"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Grid3X3,
  Users,
  Calendar,
  CalendarX,
  Shield,
  Stethoscope,
  CreditCard,
  Upload,
  Settings,
  ChevronDown,
  Bell,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import Modal from "@/components/modals/Modal";

interface Specialization {
  id: string;
  name: string;
  description: string;
  doctorCount: number;
  borderColor: string;
}

export default function AdminSpecializationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState({
    name: "",
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  // Sample specialization data
  const specializations: Specialization[] = [
    {
      id: "1",
      name: "Optician",
      description:
        "Specializes in eye care, vision correction, and the diagnosis and treatment of eye diseases. Provides comprehensive eye examinations and prescribes corrective lenses.",
      doctorCount: 10,
      borderColor: "border-blue-300",
    },
    {
      id: "2",
      name: "Dermatologist",
      description:
        "Expert in diagnosing and treating skin, hair, and nail conditions. Provides medical and surgical treatments for various dermatological issues.",
      doctorCount: 10,
      borderColor: "border-pink-300",
    },
    {
      id: "3",
      name: "Cardiologist",
      description:
        "Specializes in heart and cardiovascular system disorders. Diagnoses and treats heart diseases, heart failure, and other cardiac conditions.",
      doctorCount: 10,
      borderColor: "border-blue-300",
    },
    {
      id: "4",
      name: "Pediatrician",
      description:
        "Provides medical care for infants, children, and adolescents. Specializes in child development, growth monitoring, and pediatric diseases.",
      doctorCount: 10,
      borderColor: "border-blue-300",
    },
    {
      id: "5",
      name: "Dentist",
      description:
        "Specializes in oral health, dental hygiene, and treatment of dental diseases. Provides preventive care, fillings, and dental procedures.",
      doctorCount: 10,
      borderColor: "border-pink-300",
    },
    {
      id: "6",
      name: "Gynecologist",
      description:
        "Expert in women's reproductive health, pregnancy, and childbirth. Provides comprehensive gynecological care and obstetric services.",
      doctorCount: 10,
      borderColor: "border-blue-300",
    },
  ];

  const filteredSpecializations = specializations.filter(
    (specialization) =>
      specialization.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialization.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const handleCreateSpecialty = () => {
    if (newSpecialty.name && newSpecialty.description) {
      // Here you would typically make an API call to create the specialty
      console.log("Creating new specialty:", newSpecialty);
      setNewSpecialty({ name: "", description: "" });
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div>
      <div>
        <div className="flex-1">
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: "Admin", href: "/admin" },
                { label: "Specialization" },
              ]}
            />
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Specialization
            </h1>
          </div>

          {/* Search and Create Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="relative max-w-md">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Create New Specialty</span>
            </button>
          </div>

          {/* Specialization Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredSpecializations.map((specialization) => (
              <div
                key={specialization.id}
                className={`bg-white rounded-lg border-2 ${specialization.borderColor} p-6 shadow-sm relative`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {specialization.name}
                    </h3>
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {specialization.doctorCount}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {specialization.description}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}>
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Specialty Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Specialty"
        size="md">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialty
            </label>
            <input
              type="text"
              placeholder="Specialty"
              value={newSpecialty.name}
              onChange={(e) =>
                setNewSpecialty({ ...newSpecialty, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              placeholder="Specialty Description"
              value={newSpecialty.description}
              onChange={(e) =>
                setNewSpecialty({
                  ...newSpecialty,
                  description: e.target.value,
                })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCreateSpecialty}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Create
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
