"use client";
import { useState, useEffect, useMemo } from "react";
import { Search, Plus, ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";
import Input from "@/components/Input";
import Breadcrumb from "@/components/Breadcrumb";
import AddPatientModal, { PatientFormData } from "@/components/modals/AddPatientModal";
import Link from "next/link";
import { useGetFirebasePatientsQuery } from "@/store/patientApi";
import { NoRecordFound, getStatusBadge } from "@/components/Options";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import Title from "@/components/Title";
import Pagination from "@/components/Pagination";
import { createFirebaseDocument, secondaryAuth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { useApiError } from "@/hooks/useApiError";

export default function AdminPatientsPage() {
 const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
 const [currentPage, setCurrentPage] = useState(1);
 const [searchTerm, setSearchTerm] = useState("");
 const [isCreating, setIsCreating] = useState(false);
 const [formData, setFormData] = useState<PatientFormData>({
  first_name: "",
  last_name: "",
  gender: "",
  dateOfBirth: "",
  phone_number: "",
  email: "",
  password: "",
  confirmPassword: "",
  address: "",
 });

 const handleFormChange = (field: keyof PatientFormData, value: string) => {
  setFormData((prev) => ({
   ...prev,
   [field]: value,
  }));
 };

 const resetForm = () => {
  setFormData({
   first_name: "",
   last_name: "",
   gender: "",
   dateOfBirth: "",
   phone_number: "",
   email: "",
   password: "",
   confirmPassword: "",
   address: "",
  });
 };

 const handleCloseAddModal = () => {
  resetForm();
  setIsAddPatientModalOpen(false);
 };

 const handleSavePatient = async () => {
  if (
   !formData.first_name ||
   !formData.last_name ||
   !formData.email ||
   !formData.phone_number ||
   !formData.dateOfBirth ||
   !formData.gender ||
   !formData.address ||
   !formData.password ||
   !formData.confirmPassword
  ) {
   toast.error("Please fill in all required fields");
   return;
  }

  if (formData.password !== formData.confirmPassword) {
   toast.error("Passwords do not match");
   return;
  }

  setIsCreating(true);
  try {
   const display_name = `${formData.first_name} ${formData.last_name}`.trim();

   // Use secondaryAuth to create user without signing out the current admin
   const userCredential = await createUserWithEmailAndPassword(
    secondaryAuth,
    formData.email,
    formData.password
   );

   // Force sign out the newly created user from the secondary auth instance
   await signOut(secondaryAuth);

   const patientUid = userCredential.user.uid;

   await createFirebaseDocument("users", {
    uid: patientUid,
    email: formData.email,
    display_name,
    first_name: formData.first_name,
    last_name: formData.last_name,
    role: "patient",
    phone_number: formData.phone_number,
    address: formData.address,
    location: formData.address,
    date_of_birth: formData.dateOfBirth,
    photo_url: "",
    isActive: true,
    createdTime: new Date().toISOString(),
    password: formData.password,
    confirmPassword: formData.confirmPassword,
   });

   await createFirebaseDocument("patientProfiles", {
    patientId: patientUid,
    display_name,
    first_name: formData.first_name,
    last_name: formData.last_name,
    email: formData.email,
    phone_number: formData.phone_number,
    address: formData.address,
    location: formData.address,
    date_of_birth: formData.dateOfBirth,
    gender: formData.gender,
    hmo: "",
    medical_history: "",
    photo_url: "",
    isActive: true,
    createdTime: new Date().toISOString(),
   });

   toast.success("Patient created successfully");
   handleCloseAddModal();
   refetch();
  } catch (error) {
   console.error("Error creating patient user:", error);

   const backendError =
    typeof error === "object" && error !== null
     ? // RTK Query style error shapes
     // @ts-expect-error runtime error shape
     error.data?.error ||
     // @ts-expect-error runtime error shape
     error.data?.message ||
     // @ts-expect-error runtime error shape
     error.error ||
     // @ts-expect-error runtime error shape
     error.message
     : undefined;

   toast.error(backendError || "Failed to create patient user. Please try again.");
  } finally {
   setIsCreating(false);
  }
 };

 const [itemsPerPage, setItemsPerPage] = useState(10);

 // Use RTK query to fetch patients
 const {
  data: patientsData,
  isLoading,
  error,
  refetch,
 } = useGetFirebasePatientsQuery({
  page: currentPage,
  limit: itemsPerPage,
  search: searchTerm,
 });

 const paginatedPatients = useMemo(() => {
  return (patientsData || []) as any[];
 }, [patientsData]);

 const totalCount = (patientsData as any)?.totalCount || 0;
 const totalPages = Math.ceil(totalCount / itemsPerPage);

 useApiError(!!error, error, "Failed to load patients");

 // Show info toast when search is performed
 useEffect(() => {
  if (searchTerm && totalCount > 0) {
   toast.info(
    `Found ${totalCount} patients matching "${searchTerm}"`
   );
  } else if (searchTerm && totalCount === 0) {
   toast.warning(`No patients found matching "${searchTerm}"`);
  }
 }, [searchTerm, totalCount]);

 // Show info toast when page changes
 useEffect(() => {
  if (currentPage > 1) {
   toast.info(`Showing page ${currentPage} of ${totalPages}`);
  }
 }, [currentPage, totalPages]);

 return (
  <div>
   {/* Breadcrumb */}
   <Breadcrumb
    items={[
     { label: "Admin", href: "/admin" },
     { label: "Users", href: "/admin/users" },
     { label: "Patients" },
    ]}
   />

   {/* Header */}
   <div className="mb-6">
    <div className="flex items-center space-x-4 mb-4">
     <Link
      href="/admin"
      className="text-gray-600 hover:text-gray-800 cursor-pointer">
      <ArrowLeft className="w-5 h-5" />
     </Link>
     <Title title="Patient Management" />
    </div>

    <div className="flex flex-col space-y-4">
     <div className="flex items-center justify-between">
      <div className="relative flex-1 max-w-md hidden md:block">
       <Input
        type="text"
        placeholder="Search patient"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        startIcon={<Search className="w-5 h-5 text-gray-400" />}
        className="search-input cursor-pointer rounded-md"
        fullWidth
       />
       {searchTerm && (
        <button
         onClick={() => {
          setSearchTerm("");
          toast.info("Search cleared");
         }}
         className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
         title="Clear search"
        >
         <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
         >
          <path
           strokeLinecap="round"
           strokeLinejoin="round"
           strokeWidth={2}
           d="M6 18L18 6M6 6l12 12"
          />
         </svg>
        </button>
       )}
      </div>

      <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
       <button
        onClick={() => setIsAddPatientModalOpen(true)}
        className="bg-[#44CE2D] hover:bg-[#3bb025] text-white px-4 py-2 rounded-lg flex items-center space-x-2 cursor-pointer transition-colors shadow-sm"
       >
        <Plus className="w-4 h-4" />
        <span>Add New Patient</span>
       </button>
      </div>
     </div>

     <div className="md:hidden w-full">
      <div className="relative">
       <Input
        type="text"
        placeholder="Search patient"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        startIcon={<Search className="w-5 h-5 text-gray-400" />}
        className="search-input cursor-pointer rounded-md"
        fullWidth
       />
       {searchTerm && (
        <button
         onClick={() => {
          setSearchTerm("");
          toast.info("Search cleared");
         }}
         className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
         title="Clear search"
        >
         <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
         >
          <path
           strokeLinecap="round"
           strokeLinejoin="round"
           strokeWidth={2}
           d="M6 18L18 6M6 6l12 12"
          />
         </svg>
        </button>
       )}
      </div>
     </div>
    </div>
   </div>

   {/* Patients Table */}
   {isLoading ? (
    <TableSkeleton
     columns={6}
     rows={5}
     headerLabels={[
      "Patient Info",
      "Contact",
      "Demographics",
      "Location",
      "Status",
      "Actions",
     ]}
    />
   ) : (
    <div className="table-container bg-white rounded-lg border border-gray-200 overflow-hidden">
     <div className="overflow-x-auto">
      <table className="min-w-full">
       <thead>
        <tr>
         <th>Patient Info</th>
         <th>Contact</th>
         <th>Demographics</th>
         <th>Location</th>
         <th>Status</th>
         <th>Actions</th>
        </tr>
       </thead>
       <tbody>
        {paginatedPatients?.length === 0 ||
         paginatedPatients?.length === undefined ? (
         <NoRecordFound colSpan={6} />
        ) : (
         paginatedPatients?.map(
          (patient: Record<string, unknown> & { id: string }) => {
           return (
            <tr key={patient.id} className="table-row-hover">
             {/* Patient Info Column */}
             <td>
              <div className="flex items-center">
               <div className="flex-shrink-0 h-10 w-10">
                {patient.photo_url ? (
                 <img
                  src={patient.photo_url as string}
                  alt={
                   (patient.display_name as string) ||
                   "Patient"
                  }
                  className="h-10 w-10 rounded-full object-cover"
                 />
                ) : (
                 <div className="avatar-green h-10 w-10 rounded-full flex items-center justify-center">
                  <span className="text-[10px] md:text-[12px] font-medium">
                   {(
                    (patient.display_name as string) ||
                    (patient.name as string)
                   )
                    ?.charAt(0)
                    ?.toUpperCase() || "P"}
                  </span>
                 </div>
                )}
               </div>
               <div className="ml-4">
                <div className="text-[10px] md:text-[12px] font-medium text-gray-900">
                 {(patient.display_name as string) ||
                  (patient.name as string) ||
                  "N/A"}
                </div>
                <div className="text-[10px] md:text-[12px] text-gray-500">
                 ID: {patient.id.slice(0, 8)}...
                </div>
               </div>
              </div>
             </td>

             {/* Contact Column */}
             <td>
              <div className="text-[10px] md:text-[12px] text-gray-900">
               {(patient.email as string) || "N/A"}
              </div>
              <div className="text-[10px] md:text-[12px] text-gray-500">
               {(patient.phone_number as string) || "N/A"}
              </div>
             </td>

             {/* Demographics Column */}
             <td>
              <div className="text-[10px] md:text-[12px] text-gray-900">
               Age:{" "}
               {(() => {
                const birthDate =
                 patient.date_of_birth || patient.dateOfBirth;
                if (!birthDate) return "N/A";
                try {
                 const birthDateObj = new Date(
                  birthDate as string
                 );
                 const today = new Date();
                 let age =
                  today.getFullYear() -
                  birthDateObj.getFullYear();
                 const monthDiff =
                  today.getMonth() - birthDateObj.getMonth();
                 if (
                  monthDiff < 0 ||
                  (monthDiff === 0 &&
                   today.getDate() < birthDateObj.getDate())
                 ) {
                  age--;
                 }
                 return age.toString();
                } catch (error) {
                 return "N/A";
                }
               })()}
              </div>
              <div className="text-[10px] md:text-[12px] text-gray-500 capitalize">
               {(patient.gender as string) || "N/A"}
              </div>
             </td>

             {/* Location Column */}
             <td>
              <div className="text-[10px] md:text-[12px] text-gray-900">
               {(patient.address as string) || "N/A"}
              </div>
              <div className="text-[10px] md:text-[12px] text-gray-500">
               {(patient.city as string) || "N/A"}
              </div>
             </td>

             {/* Status Column */}
             <td>
              <span
               className={getStatusBadge(
                ((patient.status as string) || "Active").toLowerCase() !==
                 "inactive"
               )}
              >
               {(patient.status as string) || "Active"}
              </span>
             </td>

             {/* Actions Column */}
             <td>
              <div className="flex items-center space-x-3">
               <Link
                href={`/admin/users/patients/appointments?patient=${encodeURIComponent(
                 (patient?.display_name as string) ||
                 (patient?.name as string) ||
                 patient?.id
                )}&patientId=${patient?.uid || patient?.id}`}
                onClick={() =>
                 toast.info(
                  `Viewing appointments for ${(patient?.display_name as string) ||
                  (patient.name as string) ||
                  "patient"
                  }`
                 )
                }
                className="link-green flex items-center space-x-1"
               >
                <User className="w-4 h-4" />
                <span>Appointments</span>
               </Link>
              </div>
             </td>
            </tr>
           );
          }
         )
        )}
       </tbody>
      </table>
     </div>
     {/* Pagination */}
     <Pagination
      currentPage={currentPage}
      totalCount={totalCount}
      pageSize={itemsPerPage}
      onPageChange={setCurrentPage}
      onPageSizeChange={(size) => {
       setItemsPerPage(size);
       setCurrentPage(1);
      }}
      itemLabel="patients"
      className="border-t border-gray-200"
     />
    </div>
   )}

   {/* Add New Patient Modal */}
   <AddPatientModal
    isOpen={isAddPatientModalOpen}
    onClose={handleCloseAddModal}
    isCreating={isCreating}
    formData={formData}
    onChange={handleFormChange}
    onSave={handleSavePatient}
   />
  </div>
 );
}
