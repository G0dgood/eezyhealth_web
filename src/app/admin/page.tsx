"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
 arrayMove,
 SortableContext,
 useSortable,
 verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import { FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { Edit, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Skeleton from "react-loading-skeleton";
import { EditModeContext } from "@/contexts/EditModeContext";
import Button from "@/components/Button";
// Import admin-specific widgets
import {
 AdminStatsCards,
 AdminBookingsWidget,
 AdminUsersWidget,
 AdminPaymentsWidget,
 AdminCalendarWidget,
} from "@/components/widgets";
import ConfirmModal from "@/components/widgets/ConfirmModal";

const getStorageKey = (userId: string) =>
 `admin_dashboard_widget_meta_${userId}`;

const widgetMap = {
 AdminStatsCards,
 AdminBookingsWidget,
 AdminUsersWidget,
 AdminPaymentsWidget,
 AdminCalendarWidget,
};

type Zone = "left" | "right";
type WidgetType = keyof typeof widgetMap;

interface WidgetMeta {
 id: string;
 zone: Zone;
 type: WidgetType;
 visible: boolean;
}

const AdminDashboard = () => {
 const [widgets, setWidgets] = useState<WidgetMeta[]>([]);
 const { isEditing, setIsEditing } = React.useContext(EditModeContext);
 const [confirmModal, setConfirmModal] = useState<{
  isOpen: boolean;
  widgetId: string | null;
  widgetType: string | null;
 }>({
  isOpen: false,
  widgetId: null,
  widgetType: null,
 });

 const { user, userInfo } = useAuth();
 const { theme } = useTheme();
 const isDarkMode = theme === "dark";

 const availableWidgetTypes = useMemo(() => {
  return Object.keys(widgetMap) as WidgetType[];
 }, []);

 useEffect(() => {
  if (typeof window === "undefined" || !user?.uid) return;

  const storageKey = getStorageKey(user.uid);
  const saved = localStorage.getItem(storageKey);

  if (saved) {
   try {
    const parsed: WidgetMeta[] = JSON.parse(saved);
    const filtered = parsed.filter((w) =>
     availableWidgetTypes.includes(w.type)
    );
    if (filtered.length > 0) {
     setWidgets(filtered);
     return;
    }
   } catch { }
  }

  const defaultWidgets: WidgetMeta[] = [
   {
    id: uuidv4(),
    zone: "left" as Zone,
    type: "AdminStatsCards" as WidgetType,
    visible: true,
   },
   {
    id: uuidv4(),
    zone: "left" as Zone,
    type: "AdminBookingsWidget" as WidgetType,
    visible: true,
   },
   {
    id: uuidv4(),
    zone: "left" as Zone,
    type: "AdminUsersWidget" as WidgetType,
    visible: true,
   },
   {
    id: uuidv4(),
    zone: "left" as Zone,
    type: "AdminPaymentsWidget" as WidgetType,
    visible: true,
   },
   {
    id: uuidv4(),
    zone: "right" as Zone,
    type: "AdminCalendarWidget" as WidgetType,
    visible: true,
   },
  ].filter((w) => availableWidgetTypes.includes(w.type));

  setWidgets(defaultWidgets);
 }, [availableWidgetTypes, user?.uid]);

 useEffect(() => {
  if (typeof window === "undefined" || !user?.uid) return;
  const storageKey = getStorageKey(user.uid);
  localStorage.setItem(storageKey, JSON.stringify(widgets));
 }, [widgets, user?.uid]);

 const addWidget = (type: WidgetType, zone: Zone) => {
  if (!availableWidgetTypes.includes(type)) {
   toast.error(`You do not have permission to add ${type}`);
   return;
  }
  if (widgets.some((w) => w.type === type)) {
   toast.warning(`"${type}" widget is already added.`);
   return;
  }
  setWidgets((prev) => [
   ...prev,
   { id: uuidv4(), zone, type, visible: true },
  ]);
 };

 const removeWidget = (id: string) => {
  const widgetToRemove = widgets.find((w) => w.id === id);

  if (widgetToRemove) {
   setConfirmModal({
    isOpen: true,
    widgetId: id,
    widgetType: widgetToRemove.type,
   });
  } else {
   toast.error("Widget not found");
  }
 };

 const handleConfirmRemove = () => {
  if (confirmModal.widgetId) {
   const widgetToRemove = widgets.find(
    (w) => w.id === confirmModal.widgetId
   );
   if (widgetToRemove) {
    setWidgets((prev) => {
     const newWidgets = prev.filter((w) => w.id !== confirmModal.widgetId);
     return newWidgets;
    });
    toast.success(`${widgetToRemove.type} widget removed successfully`);
   }
  }
  setConfirmModal({ isOpen: false, widgetId: null, widgetType: null });
 };

 const closeConfirmModal = () => {
  setConfirmModal({ isOpen: false, widgetId: null, widgetType: null });
 };

 const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const oldIndex = widgets.findIndex((w) => w.id === String(active.id));
  const newIndex = widgets.findIndex((w) => w.id === String(over.id));

  if (oldIndex === -1 || newIndex === -1) {
   return;
  }

  if (widgets[oldIndex].zone !== widgets[newIndex].zone) {
   return;
  }

  const zone = widgets[oldIndex].zone;
  const zoneWidgets = [...widgets.filter((w) => w.zone === zone)];
  const oldLocalIndex = zoneWidgets.findIndex(
   (w) => w.id === String(active.id)
  );
  const newLocalIndex = zoneWidgets.findIndex(
   (w) => w.id === String(over.id)
  );

  const reordered = arrayMove(zoneWidgets, oldLocalIndex, newLocalIndex);
  const other = widgets.filter((w) => w.zone !== zone);
  const newWidgets = [...other, ...reordered];
  setWidgets(newWidgets);
 };

 const handleSave = () => {
  if (user?.uid) {
   const storageKey = getStorageKey(user.uid);

   try {
    localStorage.setItem(storageKey, JSON.stringify(widgets));

    const saved = localStorage.getItem(storageKey);

    toast.success("Layout saved!");
   } catch (error) {
    toast.error("Failed to save layout");
   }
  } else {
   toast.error("Unable to save layout - user not found");
  }
  setIsEditing(false);
 };

 const clearStorage = () => {
  if (user?.uid) {
   const storageKey = getStorageKey(user.uid);
   localStorage.removeItem(storageKey);
   toast.success("Storage cleared");
  }
 };

 const SortableWidget = ({
  id,
  children,
  onRemove,
  isEditing,
 }: {
  id: string;
  children: React.ReactNode;
  onRemove: (id: string) => void;
  isEditing: boolean;
 }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
   useSortable({ id, disabled: !isEditing });
  const style = {
   transform: CSS.Transform.toString(transform),
   transition,
   position: "relative" as const,
   border: isEditing ? "1px dashed #0070f3" : undefined,
   padding: "12px",
   backgroundColor: isDarkMode ? "var(--dark-bg-secondary)" : "#fff",
   marginBottom: "20px",
   boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
   e.preventDefault();
   e.stopPropagation();
   onRemove(id);
  };

  return (
   <div ref={setNodeRef} style={style}>
    {isEditing && (
     <div
      style={{
       position: "absolute",
       top: "8px",
       right: "8px",
       zIndex: 50,
      }}
     >
      <Button
       onClick={handleRemoveClick}
       onMouseDown={(e) => e.stopPropagation()}
       onMouseUp={(e) => e.stopPropagation()}
       className={`rounded-full p-2 shadow-lg border hover:bg-red-50 transition-colors duration-200 ${isDarkMode
        ? "bg-[var(--dark-bg-secondary)] border-red-300 hover:bg-red-900/20 text-red-400"
        : "bg-white border-red-200 text-red-600 hover:text-red-800"
        }`}
       aria-label="Remove widget"
       title="Remove widget"
       style={{ pointerEvents: "auto" }}
       icon={<FaTimes size={14} />}
       iconOnly
       variant="ghost"
      />
     </div>
    )}
    <div {...attributes} {...(isEditing ? listeners : undefined)}>
     {children}
    </div>
   </div>
  );
 };

 const renderZone = (zone: Zone) => {
  const zoneWidgets = widgets.filter((w) => w.zone === zone && w.visible);
  return (
   <SortableContext
    items={zoneWidgets.map((w) => w.id)}
    strategy={verticalListSortingStrategy}
   >
    {zoneWidgets.map((w) => {
     const Component = widgetMap[w.type];
     if (!Component) return null;
     return (
      <SortableWidget
       key={w.id}
       id={w.id}
       isEditing={isEditing}
       onRemove={removeWidget}
      >
       <Component />
      </SortableWidget>
     );
    })}
   </SortableContext>
  );
 };

 // Show NoRecordFound if there is no user
 if (!user) {
  return (
   <div className="flex flex-col justify-center items-center h-[400px]">
    <div className="text-center">
     <AlertCircle size={75} color={"#a4a9b2"} />
     <p className="text-gray-500 mt-4">No user data available</p>
    </div>
   </div>
  );
 }

 // Show loading skeleton when user data is loading
 const isDashboardLoading = !user;

 if (isDashboardLoading) {
  return (
   <div>
    <div className="flex justify-between items-center mb-6">
     <div className="flex items-center gap-2">
      <Skeleton height={30} width={200} />
     </div>
     <Skeleton height={40} width={120} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 h-auto md:h-[calc(100vh-200px)]">
     <div className="col-span-1 md:col-span-4 border-[#E5E7EB] dark:border-[var(--dark-border)] rounded min-h-[400px] md:overflow-y-auto dashboard-left-zone">
      <div className="space-y-4">
       {[1, 2, 3, 4].map((i) => (
        <div
         key={i}
         className={`p-6 rounded-lg border shadow-sm ${isDarkMode
          ? "bg-[var(--dark-bg-secondary)] border-[var(--dark-border)]"
          : "bg-white border-[#E5E7EB]"
          }`}
        >
         <div className="animate-pulse">
          <div
           className={`h-4 rounded w-1/3 mb-4 ${isDarkMode
            ? "bg-[var(--dark-bg-tertiary)]"
            : "bg-gray-200"
            }`}
          ></div>
          <div className="space-y-3">
           <div
            className={`h-8 rounded ${isDarkMode
             ? "bg-[var(--dark-bg-tertiary)]"
             : "bg-gray-200"
             }`}
           ></div>
           <div
            className={`h-8 rounded ${isDarkMode
             ? "bg-[var(--dark-bg-tertiary)]"
             : "bg-gray-200"
             }`}
           ></div>
           <div
            className={`h-8 rounded w-2/3 ${isDarkMode
             ? "bg-[var(--dark-bg-tertiary)]"
             : "bg-gray-200"
             }`}
           ></div>
          </div>
         </div>
        </div>
       ))}
      </div>
     </div>
     <div className="col-span-1 md:col-span-2 border-[#E5E7EB] dark:border-[var(--dark-border)] rounded min-h-[400px] md:overflow-y-auto dashboard-right-zone">
      <div className="space-y-4">
       {[1, 2].map((i) => (
        <div
         key={i}
         className={`p-6 rounded-lg border shadow-sm ${isDarkMode
          ? "bg-[var(--dark-bg-secondary)] border-[var(--dark-border)]"
          : "bg-white border-[#E5E7EB]"
          }`}
        >
         <div className="animate-pulse">
          <div
           className={`h-4 rounded w-1/2 mb-4 ${isDarkMode
            ? "bg-[var(--dark-bg-tertiary)]"
            : "bg-gray-200"
            }`}
          ></div>
          <div className="space-y-3">
           <div
            className={`h-6 rounded ${isDarkMode
             ? "bg-[var(--dark-bg-tertiary)]"
             : "bg-gray-200"
             }`}
           ></div>
           <div
            className={`h-6 rounded ${isDarkMode
             ? "bg-[var(--dark-bg-tertiary)]"
             : "bg-gray-200"
             }`}
           ></div>
           <div
            className={`h-6 rounded ${isDarkMode
             ? "bg-[var(--dark-bg-tertiary)]"
             : "bg-gray-200"
             }`}
           ></div>
           <div
            className={`h-6 rounded w-3/4 ${isDarkMode
             ? "bg-[var(--dark-bg-tertiary)]"
             : "bg-gray-200"
             }`}
           ></div>
          </div>
         </div>
        </div>
       ))}
      </div>
     </div>
    </div>
   </div>
  );
 }

 return (
  <div>
   {isEditing && (
    <div className="flex flex-wrap gap-3 mb-4">
     <Button
      onClick={handleSave}
      className="!bg-green-600 !text-white"
     >
      Save
     </Button>
     <Button
      onClick={() => setIsEditing(false)}
      className="!bg-red-600 !text-white"
     >
      Cancel
     </Button>
     <Button
      onClick={clearStorage}
      className="!bg-yellow-600 !text-white"
     >
      Clear Storage (Debug)
     </Button>

     {availableWidgetTypes.map((type) => (
      <Button
       key={type}
       onClick={() =>
        addWidget(
         type,
         type === "AdminCalendarWidget" ? "right" : "left"
        )
       }
       className="!bg-blue-600 !text-white"
      >
       + Add {type}
      </Button>
     ))}
    </div>
   )}

   <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 h-auto md:h-[calc(100vh-100px)]">
     <div
      className={`col-span-1 md:col-span-4 rounded min-h-[400px] md:overflow-y-auto dashboard-left-zone ${isDarkMode ? "border-[var(--dark-border)]" : "border-[#E5E7EB]"
       }`}
     >
      {renderZone("left")}
     </div>
     <div
      className={`col-span-1 md:col-span-2 rounded min-h-[400px] md:overflow-y-auto dashboard-right-zone ${isDarkMode ? "border-[var(--dark-border)]" : "border-[#E5E7EB]"
       }`}
     >
      {renderZone("right")}
     </div>
    </div>
   </DndContext>

   {/* Confirmation Modal */}
   <ConfirmModal
    isOpen={confirmModal.isOpen}
    onClose={closeConfirmModal}
    onConfirm={handleConfirmRemove}
    title="Remove Widget"
    message={`Are you sure you want to remove the ${confirmModal.widgetType} widget? This action cannot be undone.`}
    confirmText="Remove Widget"
    cancelText="Keep Widget"
   />
  </div>
 );
};

export default AdminDashboard;
