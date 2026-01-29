"use client";

import React from "react";
import { TrendingUp, Target, Award, Clock, Activity } from "lucide-react";

const PerformanceWidget: React.FC = () => {
  const performanceData = [
    {
      title: "Response Time",
      value: "2.3 min",
      icon: Clock,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Average response time"
    },
    {
      title: "Patient Satisfaction",
      value: "4.8/5",
      icon: Award,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Based on reviews"
    },
    {
      title: "Completion Rate",
      value: "94%",
      icon: Target,
      gradient: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Appointments completed"
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity className="text-white" size={16} />
          </div>
          <div>
            <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900">Performance</h3>
            <p className="text-[10px] md:text-[12px] text-gray-500">Key performance indicators</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-green-600 text-[10px] md:text-[12px] font-medium">
          <TrendingUp size={14} />
          <span>All metrics up</span>
        </div>
      </div>

      {/* Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {performanceData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className="group relative overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="relative p-3 md:p-4">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${item.iconColor}`} />
                  </div>
                </div>

                <div className="mb-1 md:mb-2">
                  <h2 className="text-[16px] md:text-[18px]   font-bold text-gray-900 mb-0.5 md:mb-1 truncate">
                    {item.value}
                  </h2>
                  <h3 className="text-[10px] md:text-[12px] font-semibold text-gray-700 mb-0.5 md:mb-1 truncate">
                    {item.title}
                  </h3>
                  <p className="text-[10px] md:text-xs text-gray-500 truncate">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-[10px] md:text-[12px] font-semibold text-gray-900 mb-1">
              Overall Performance
            </h4>
            <p className="text-xs text-gray-600">
              Excellent performance this month
            </p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-[14px] md:text-[16px] font-bold text-green-600">Excellent</div>
            <div className="text-xs text-green-600 font-medium flex items-center gap-1">
              <TrendingUp size={12} />
              +12% improvement
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceWidget;
