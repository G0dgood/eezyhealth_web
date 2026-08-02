"use client";

import React from "react";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Stethoscope,
  UserPlus,
  MoreVertical,
} from "lucide-react";
import { useGetUsersQuery } from "@/store/authApi";
import Link from "next/link";

interface UserData {
  uid: string;
  email: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  role: "admin" | "doctor" | "nurse" | "patient";
  phone_number?: string;
  isActive?: boolean;
  createdTime?: string;
  photo_url?: string;
}

const AdminUsersWidget: React.FC = () => {
  // Fetch users data from admin users page
  const { data: usersData, isLoading, error } = useGetUsersQuery({});

  // Ensure users is always an array
  let users: UserData[] = [];
  if (Array.isArray(usersData)) {
    users = usersData;
  } else if (
    usersData &&
    typeof usersData === "object" &&
    Array.isArray(usersData.users)
  ) {
    users = usersData.users;
  } else if (
    usersData &&
    typeof usersData === "object" &&
    Array.isArray(usersData.data)
  ) {
    users = usersData.data;
  }

  // Get recent users (last 5)
  const recentUsers = [...users]
    .sort((a: UserData, b: UserData) => {
      const dateA = new Date(a.createdTime || 0).getTime();
      const dateB = new Date(b.createdTime || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  // Calculate user statistics
  const totalUsers = users.length;
  const totalDoctors = users.filter(
    (user: UserData) => user.role === "doctor"
  ).length;
  const totalNurses = users.filter(
    (user: UserData) => user.role === "nurse"
  ).length;
  const totalPatients = users.filter(
    (user: UserData) => user.role === "patient"
  ).length;
  const activeUsers = users.filter(
    (user: UserData) => user.isActive !== false
  ).length;
  const inactiveUsers = users.filter(
    (user: UserData) => user.isActive === false
  ).length;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  const getRoleIcon = (role: string) => {
    const normalizedRole = role.toLowerCase();
    switch (normalizedRole) {
      case "doctor":
        return <Stethoscope size={16} className="text-blue-600" />;
      case "nurse":
        return <UserCheck size={16} className="text-green-600" />;
      case "admin":
        return <Shield size={16} className="text-red-600" />;
      case "patient":
        return <Users size={16} className="text-purple-600" />;
      default:
        return <Users size={16} className="text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    const normalizedRole = role.toLowerCase();
    switch (normalizedRole) {
      case "admin":
        return "bg-red-100 text-red-800 border border-red-300";
      case "doctor":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "nurse":
        return "bg-green-100 text-green-800 border border-green-300";
      case "patient":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getStatusColor = (isActive: boolean | undefined) => {
    return isActive !== false
      ? "bg-green-100 text-green-800 border border-green-300"
      : "bg-red-100 text-red-800 border border-red-300";
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-red-600">
        Error loading users. Please try again.
        <div className="text-xs mt-2 text-gray-500">Error: {String(error)}</div>
      </div>
    );
  }

  if (recentUsers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="text-gray-400" size={32} />
          </div>
          <h3 className="text-[14px] md:text-[16px] font-semibold text-gray-900 mb-2">
            No Users Found
          </h3>
          <p className="text-[10px] md:text-[12px] text-gray-500 text-center mb-4">
            No user records found yet. Users will appear here once they
            register.
          </p>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-[#44CE2D] text-white rounded-lg hover:bg-[#3bb025] transition-colors text-[10px] md:text-[12px] font-medium">
            View All Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900">Recent Users</h3>
            <p className="text-[10px] md:text-[12px] text-gray-500">Latest registered users</p>
          </div>
        </div>
        <Link
          href="/admin/users"
          className="text-blue-600 text-[10px] md:text-[12px] font-medium hover:text-blue-700">
          View All
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="text-center p-2 md:p-3 bg-gray-50 rounded-lg">
          <div className="text-[14px] md:text-[16px] font-bold text-gray-900">{totalUsers}</div>
          <div className="text-[10px] md:text-xs text-gray-600">Total</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-green-50 rounded-lg">
          <div className="text-[14px] md:text-[16px] font-bold text-green-600">
            {totalDoctors}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600">Doctors</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-blue-50 rounded-lg">
          <div className="text-[14px] md:text-[16px] font-bold text-blue-600">{totalNurses}</div>
          <div className="text-[10px] md:text-xs text-gray-600">Nurses</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-purple-50 rounded-lg">
          <div className="text-[14px] md:text-[16px] font-bold text-purple-600">
            {totalPatients}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600">Patients</div>
        </div>
        <div className="text-center p-2 md:p-3 bg-yellow-50 rounded-lg">
          <div className="text-[14px] md:text-[16px] font-bold text-yellow-600">
            {activeUsers}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600">Active</div>
        </div>
      </div>

      {/* Recent Users List */}
      <div className="space-y-4">
        {recentUsers.map((user: UserData) => (
          <div
            key={user.uid}
            className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {getRoleIcon(user.role)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {user.display_name || user.first_name || "Unknown User"}
                  </h4>
                  <p className="text-[10px] md:text-[12px] text-gray-600 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap ml-12 sm:ml-0">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                    user.role
                  )}`}>
                  {user.role}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    user.isActive
                  )}`}>
                  {user.isActive !== false ? "Active" : "Inactive"}
                </span>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {user.phone_number && (
                <div className="flex items-center gap-2 text-[10px] md:text-[12px] text-gray-600">
                  <span className="text-xs">📞</span>
                  <span>{user.phone_number}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[10px] md:text-[12px] text-gray-600">
                <span className="text-xs">📅</span>
                <span>Joined: {formatDate(user.createdTime)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <UserPlus size={14} />
                <span>{user.role}</span>
              </div>
              <Link
                href="/admin/users"
                className="text-blue-600 text-xs font-medium hover:text-blue-700">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10px] md:text-[12px]">
          <span className="text-gray-600">Total Users: {totalUsers}</span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">Doctors: {totalDoctors}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-gray-600">Nurses: {totalNurses}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span className="text-gray-600">Patients: {totalPatients}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersWidget;
