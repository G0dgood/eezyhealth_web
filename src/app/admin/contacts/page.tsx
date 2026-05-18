"use client";

import { useState } from "react";
import {
 Mail,
 Phone,
 Calendar,
 Eye,
 Copy,
 Check,
 AlertCircle,
 MessageSquare,
 ArrowRight
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import Pagination from "@/components/Pagination";
import { NoRecordFound } from "@/components/Options";
import Dropdown from "@/components/Dropdown";
import { ContactDetailsModal } from "@/components/modals";
import Button from "@/components/Button";
import { useGetContactsQuery, useUpdateContactStatusMutation } from "@/store/adminApi";
import { toast } from "sonner";

interface ContactMessage {
 id: string;
 firstname: string;
 lastName: string;
 email: string;
 phoneNumber: string;
 message: string;
 status: string;
 createdAt: any;
}

export default function AdminContactsPage() {
 const [searchQuery, setSearchQuery] = useState("");
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage] = useState(10);
 const [selectedStatus, setSelectedStatus] = useState<string>("");
 const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
 const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

 const [updateContactStatus] = useUpdateContactStatusMutation();

 // Fetch contacts from RTK Query store
 const {
  data: responseData,
  isLoading,
  error,
 } = useGetContactsQuery({
  page: currentPage,
  limit: itemsPerPage,
  status: selectedStatus || undefined,
 });

 const contacts: ContactMessage[] = responseData?.data || [];

 // Filter contacts based on search query (within the current paginated page)
 const paginatedContacts = contacts.filter((contact) => {
  if (!searchQuery) return true;
  const searchLower = searchQuery.toLowerCase();
  const fullName = `${contact.firstname || ""} ${contact.lastName || ""}`.toLowerCase();

  return (
   fullName.includes(searchLower) ||
   (contact.email && contact.email.toLowerCase().includes(searchLower)) ||
   (contact.phoneNumber && contact.phoneNumber.includes(searchLower)) ||
   (contact.message && contact.message.toLowerCase().includes(searchLower))
  );
 });

 const totalFilteredCount = responseData?.pagination?.totalFilteredCount || 0;

 // Formatting date/time helper
 const formatContactDate = (dateVal: any): string => {
  if (!dateVal) return "N/A";

  // Firestore timestamp
  if (typeof dateVal === "object") {
   if (dateVal.seconds !== undefined) {
    return new Date(dateVal.seconds * 1000).toLocaleString();
   }
   if (dateVal._seconds !== undefined) {
    return new Date(dateVal._seconds * 1000).toLocaleString();
   }
  }

  // String ISO date
  if (typeof dateVal === "string") {
   if (dateVal.includes(" at ")) {
    return dateVal;
   }
   try {
    const parsedDate = new Date(dateVal);
    if (!isNaN(parsedDate.getTime())) {
     return parsedDate.toLocaleString();
    }
   } catch (e) {
    // Ignore parsing error
   }
   return dateVal;
  }

  return String(dateVal);
 };



  const getStatusBadge = (status: string) => {
   const isUnread = !status || status.toLowerCase() === "unread";
   return (
    <span
     className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border shadow-sm ${isUnread
       ? "bg-red-600 text-white border-red-700"
       : "bg-[#44CE2D] text-white border-[#38b220]"
      }`}
    >
     <span
      className={`w-1.5 h-1.5 rounded-full bg-white ${isUnread ? "animate-pulse" : ""}`}
     />
     {isUnread ? "Unread" : "Read"}
    </span>
   );
  };

 const handleViewDetails = async (contact: ContactMessage) => {
  setSelectedContact(contact);
  setIsDetailModalOpen(true);

  if (!contact.status || contact.status.toLowerCase() === "unread") {
   try {
    await updateContactStatus({ id: contact.id, status: "read" }).unwrap();
    toast.success("Message marked as read");
   } catch (err) {
    console.error("Failed to mark message as read:", err);
   }
  }
 };

 // Calculate counts for stats cards from backend response
 const totalContacts = responseData?.stats?.total || 0;
 const unreadContacts = responseData?.stats?.unread || 0;
 const readContacts = responseData?.stats?.read || 0;

 return (
  <div>
   <div className="mb-6">
    <Breadcrumb
     items={[
      { label: "Admin", href: "/admin" },
      { label: "Contacts" },
     ]}
    />
   </div>

   <PageHeader
    title="Contact Messages"
    description="Manage and respond to user and patient contact form submissions."
   />

   {/* Filter and Search Bar */}
   <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
    <div className="flex-1 w-full md:max-w-md">
     <SearchInput
      value={searchQuery}
      onChange={(val) => {
       setSearchQuery(val);
       setCurrentPage(1);
      }}
      placeholder="Search by name, email, phone or message..."
     />
    </div>
    <Dropdown
     value={selectedStatus}
     onChange={(value) => {
      setSelectedStatus(value);
      setCurrentPage(1);
     }}
     options={[
      { value: "", label: "All Statuses" },
      { value: "unread", label: "Unread" },
      { value: "read", label: "Read" },
     ]}
     placeholder="Filter by status"
     className="w-full md:w-48"
     variant="default"
    />
   </div>

   {/* Content Table / Loading / Error State */}
   {isLoading ? (
    <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6 space-y-4">
     <div className="h-8 bg-[var(--muted)] animate-pulse rounded w-1/4"></div>
     <div className="h-12 bg-[var(--muted)] animate-pulse rounded"></div>
     <div className="h-12 bg-[var(--muted)] animate-pulse rounded"></div>
     <div className="h-12 bg-[var(--muted)] animate-pulse rounded"></div>
    </div>
   ) : error ? (
    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-6 text-center text-red-600 dark:text-red-400">
     <AlertCircle className="w-12 h-12 mx-auto mb-3" />
     <h3 className="font-semibold text-lg mb-1">Failed to load contacts</h3>
     <p className="text-sm">There was a problem retrieving data from the backend server.</p>
    </div>
   ) : (
    <>
     {/* Summary Stat Cards */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
       <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Total Messages</p>
        <h3 className="text-3xl font-bold mt-1.5 text-[var(--foreground)]">{totalContacts}</h3>
       </div>
       <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
        <MessageSquare className="w-6 h-6" />
       </div>
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden">
       {unreadContacts > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
       )}
       <div>
        <div className="flex items-center gap-2">
         <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Unread Messages</p>
         {unreadContacts > 0 && (
          <span className="flex h-2 w-2 relative">
           <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
           <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
         )}
        </div>
        <h3 className="text-3xl font-bold mt-1.5 text-red-600 dark:text-red-400">{unreadContacts}</h3>
       </div>
       <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400">
        <AlertCircle className="w-6 h-6" />
       </div>
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
       <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Read Messages</p>
        <h3 className="text-3xl font-bold mt-1.5 text-emerald-600 dark:text-emerald-400">{readContacts}</h3>
       </div>
       <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
        <Check className="w-6 h-6" />
       </div>
      </div>
     </div>

     <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
       <table className="min-w-full divide-y divide-[var(--border)]">
        <thead className="bg-[var(--muted)]">
         <tr>
          <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider pl-8">
           Sender
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
           Contact Info
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
           Message
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
           Date Received
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
           Status
          </th>
          <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider pr-6">
           Actions
          </th>
         </tr>
        </thead>
        <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
         {paginatedContacts.length === 0 ? (
          <NoRecordFound colSpan={6} />
         ) : (
          paginatedContacts?.map((contact) => {
           const isUnread = !contact.status || contact.status.toLowerCase() === "unread";
           return (
            <tr
             key={contact.id}
             className={`hover:bg-[var(--muted)]/50 transition-colors duration-150 ${isUnread
               ? "bg-red-50/10 dark:bg-red-950/5"
               : ""
              }`}
            >
             <td className={`px-6 py-4 whitespace-nowrap transition-all duration-150 pl-8 ${isUnread ? "border-l-4 border-red-500" : "border-l-4 border-transparent"}`}>
              <div className="flex items-center space-x-3">
               <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#44CE2D]/10 flex items-center justify-center text-[#44CE2D] font-bold text-sm border border-[#44CE2D]/20">
                 {contact.firstname?.[0]?.toUpperCase() || ""}
                 {contact.lastName?.[0]?.toUpperCase() || ""}
                </div>
                {isUnread && (
                 <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white dark:border-[var(--card)]"></span>
                 </span>
                )}
               </div>
               <div>
                <div className={`text-sm text-[var(--foreground)] ${isUnread ? "font-bold text-red-600 dark:text-red-400" : "font-semibold"}`}>
                 {contact.firstname || ""} {contact.lastName || ""}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                 ID: {contact.id?.substring(0, 8)}...
                </div>
               </div>
              </div>
             </td>
             <td className="px-6 py-4 whitespace-nowrap">
              <div className={`text-sm flex items-center gap-1.5 ${isUnread ? "text-[var(--foreground)] font-semibold" : "text-[var(--muted-foreground)]"}`}>
               <Mail className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
               <span>{contact.email || "N/A"}</span>
              </div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1 flex items-center gap-1.5">
               <Phone className="w-3.5 h-3.5" />
               <span>{contact.phoneNumber || "N/A"}</span>
              </div>
             </td>
             <td className="px-6 py-4">
              <div className={`text-sm max-w-xs truncate ${isUnread ? "font-bold text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
               {contact.message || "No message provided"}
              </div>
             </td>
             <td className="px-6 py-4 whitespace-nowrap">
              <div className={`text-sm flex items-center gap-1.5 ${isUnread ? "text-[var(--foreground)] font-semibold" : "text-[var(--muted-foreground)]"}`}>
               <Calendar className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
               <span>{formatContactDate(contact.createdAt)}</span>
              </div>
             </td>
             <td className="px-6 py-4 whitespace-nowrap">
              {getStatusBadge(contact.status)}
             </td>
             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium pr-6">
              <Button
               onClick={() => handleViewDetails(contact)}
               variant="outline-neutral"
               size="sm"
               className="inline-flex items-center gap-1.5"
              >
               <Eye className="w-4 h-4" />
               <span>View</span>
              </Button>
             </td>
            </tr>
           );
          })
         )}
        </tbody>
       </table>
      </div>

      {/* Pagination */}
      {!isLoading && !error && totalFilteredCount > 0 && (

       <Pagination
        currentPage={currentPage}
        totalCount={totalFilteredCount}
        pageSize={itemsPerPage}
        onPageChange={setCurrentPage}
        itemLabel="messages"
       />
      )}
     </div>
    </>
   )}

   {/* Contact Details Modal */}
   <ContactDetailsModal
    isOpen={isDetailModalOpen}
    onClose={() => setIsDetailModalOpen(false)}
    contact={selectedContact}
   />
  </div>
 );
}
