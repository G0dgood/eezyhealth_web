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
      description: "Active patients",
      trend: "+12%",
    },
    {
      title: "Today's Appointments",
      value: "12",
      icon: Calendar,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Scheduled today",
      trend: "+3",
    },
    {
      title: "Pending Tasks",
      value: "8",
      icon: Clock,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      description: "Awaiting completion",
      trend: "-2",
    },
    {
      title: "Critical Alerts",
      value: "3",
      icon: AlertCircle,
      gradient: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      description: "Require attention",
      trend: "0",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                {stat.trend && (
                  <div className="text-sm font-medium flex items-center gap-1 text-green-600">
                    {stat.trend.startsWith("+")
                      ? "↗"
                      : stat.trend.startsWith("-")
                      ? "↘"
                      : "→"}{" "}
                    {stat.trend}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </h2>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  {stat.title}
                </h3>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NurseStatsCards;
