"use client";

import React from "react";
import { TrendingUp, Target, Award, Clock } from "lucide-react";

const PerformanceWidget: React.FC = () => {
  const performanceData = [
    {
      title: "Response Time",
      value: "2.3 min",
      icon: Clock,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Average response time",
      trend: "-15%",
    },
    {
      title: "Patient Satisfaction",
      value: "4.8/5",
      icon: Award,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Based on reviews",
      trend: "+8%",
    },
    {
      title: "Completion Rate",
      value: "94%",
      icon: Target,
      gradient: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Appointments completed",
      trend: "+5%",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Performance Metrics
            </h3>
            <p className="text-sm text-gray-500">
              Your key performance indicators
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <TrendingUp size={16} />
          <span>All metrics up</span>
        </div>
      </div>

      {/* Performance Grid */}
      <div className="space-y-4">
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
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  {item.trend && (
                    <div className="text-sm font-medium flex items-center gap-1 text-green-600">
                      ↗ {item.trend}
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {item.value}
                  </h2>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Overall Performance
            </h4>
            <p className="text-xs text-gray-600">
              Excellent performance this month
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">Excellent</div>
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
