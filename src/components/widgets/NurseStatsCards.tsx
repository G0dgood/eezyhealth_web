"use client";

import React from "react";
import { Users, Calendar, Clock, AlertCircle } from "lucide-react";

const NurseStatsCards: React.FC = () => {
  const statsData = [
    {
      title: "Total Patients",
      value: "156",
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Active patients" 
    },
    {
      title: "Today's Appointments",
      value: "12",
      icon: Calendar,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Scheduled today" 
    },
    {
      title: "Pending Tasks",
      value: "8",
      icon: Clock,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      description: "Awaiting completion" 
    },
    {
      title: "Critical Alerts",
      value: "3",
      icon: AlertCircle,
      gradient: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      description: "Require attention" 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="group relative overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Gradient Background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

            {/* Content */}
            <div className="relative p-3 md:p-4">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${stat.iconColor}`} />
                </div>
                
              </div>

              <div className="mb-1 md:mb-2">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-0.5 md:mb-1">
                  {stat.value}
                </h2>
                <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-0.5 md:mb-1">
                  {stat.title}
                </h3>
                <p className="text-[10px] md:text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NurseStatsCards;
