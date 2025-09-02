"use client";

import { useState, useEffect } from "react";
import { Trophy, User, Search, Bell } from "lucide-react";
import Title from "@/components/Title";
import {
  useGetFirebaseDoctorOfTheMonthQuery,
  useTriggerDoctorOfTheMonthMutation,
} from "@/store/api";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NoRecordFound, SVGLoaderFetch } from "@/components/Options";
import { showSuccess, showInfo } from "@/utils/toast";

interface DoctorPerformance {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  cancellationRate: number;
  completedAppointments: number;
  totalAppointments: number;
  documentApprovalRate: number;
  responseTime: number; // in hours
  patientSatisfaction: number;
  performanceScore?: number; // Optional performance score
}

interface DoctorOfTheMonth {
  id: string;
  name: string;
  specialty: string;
  awardMonth: string; // Format: "YYYY-MM"
  displayMonth: string; // Format: "Month YYYY"
  rating: number;
  cancellationRate: number;
  completedAppointments: number;
  isDoctorOfMonth: boolean;
  selectedDate: Timestamp;
  performanceMetrics: {
    totalScore: number;
    appointmentCompletion: number;
    patientSatisfaction: number;
    responseTime: number;
    documentCompliance: number;
  };
}

interface MonthlyDoctorData {
  month: string; // YYYY-MM format
  displayMonth: string; // Month YYYY format
  doctorId: string;
  doctorName: string;
  specialty: string;
  performanceScore: number;
  metrics: {
    rating: number;
    cancellationRate: number;
    completedAppointments: number;
    totalAppointments: number;
    documentApprovalRate: number;
    responseTime: number;
    patientSatisfaction: number;
  };
}

const AdminDoctorOfMonthPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [topPerformers, setTopPerformers] = useState<DoctorPerformance[]>([]);
  const [pastDoctors, setPastDoctors] = useState<DoctorOfTheMonth[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyDoctorData[]>([]);
  const [isLoadingPerformers, setIsLoadingPerformers] = useState(true);
  const [isLoadingPastDoctors, setIsLoadingPastDoctors] = useState(true);
  const [isLoadingMonthlyData, setIsLoadingMonthlyData] = useState(true);
  const [currentMonth, setCurrentMonth] = useState("");
  const [isAutoCreating, setIsAutoCreating] = useState(false);

  // RTK Query hooks for Doctor of The Month
  const {
    data: currentDoctorOfMonth,
    isLoading: isLoadingDoctorOfMonth,
    refetch: refetchDoctorOfMonth,
  } = useGetFirebaseDoctorOfTheMonthQuery(currentMonth);
  const [triggerDoctorOfMonth, { isLoading: isTriggering }] =
    useTriggerDoctorOfTheMonthMutation();

  // Initialize current month
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    setCurrentMonth(`${year}-${month}`);
  }, []);

  // Fetch all doctors performance data for current month
  const fetchDoctorsPerformance = async (month: string) => {
    try {
      setIsLoadingPerformers(true);

      // Query doctors collection for performance data
      const doctorsRef = collection(db, "doctors");
      const q = query(
        doctorsRef,
        where("isActive", "==", true),
        orderBy("rating", "desc"),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const doctorsData: DoctorPerformance[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          doctorsData.push({
            id: doc.id,
            name: data.name || "Unknown Doctor",
            specialty: data.specialty || "General",
            rating: data.rating || 0,
            cancellationRate: data.cancellationRate || 0,
            completedAppointments: data.completedAppointments || 0,
            totalAppointments: data.totalAppointments || 0,
            documentApprovalRate: data.documentApprovalRate || 0,
            responseTime: data.responseTime || 24,
            patientSatisfaction: data.patientSatisfaction || 0,
          });
        }
      });

      setTopPerformers(doctorsData);
    } catch (error) {
      console.error("Error fetching doctors performance:", error);
      setTopPerformers([]);
    } finally {
      setIsLoadingPerformers(false);
    }
  };

  // Fetch historical Doctor of The Month data
  const fetchHistoricalDoctorOfTheMonth = async () => {
    try {
      setIsLoadingPastDoctors(true);

      const doctorOfMonthRef = collection(db, "doctorOfTheMonth");
      const q = query(
        doctorOfMonthRef,
        orderBy("selectedDate", "desc"),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const historicalData: DoctorOfTheMonth[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          historicalData.push({
            id: doc.id,
            name: data.doctorName || "Unknown Doctor",
            specialty: data.specialty || "General",
            awardMonth: data.awardMonth || "",
            displayMonth: data.displayMonth || "",
            rating: data.rating || 0,
            cancellationRate: data.cancellationRate || 0,
            completedAppointments: data.completedAppointments || 0,
            isDoctorOfMonth: data.isDoctorOfMonth || false,
            selectedDate: data.selectedDate || Timestamp.now(),
            performanceMetrics: data.performanceMetrics || {
              totalScore: 0,
              appointmentCompletion: 0,
              patientSatisfaction: 0,
              responseTime: 0,
              documentCompliance: 0,
            },
          });
        }
      });

      setPastDoctors(historicalData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setPastDoctors([]);
    } finally {
      setIsLoadingPastDoctors(false);
    }
  };

  // Fetch monthly aggregated data
  const fetchMonthlyData = async () => {
    try {
      setIsLoadingMonthlyData(true);

      const monthlyRef = collection(db, "doctorOfTheMonth");
      const q = query(monthlyRef, orderBy("awardMonth", "desc"), limit(100));

      const querySnapshot = await getDocs(q);
      const monthlyDataArray: MonthlyDoctorData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          monthlyDataArray.push({
            month: data.awardMonth || "",
            displayMonth: data.displayMonth || "",
            doctorId: data.doctorId || "",
            doctorName: data.doctorName || "Unknown Doctor",
            specialty: data.specialty || "General",
            performanceScore: data.performanceMetrics?.totalScore || 0,
            metrics: {
              rating: data.rating || 0,
              cancellationRate: data.cancellationRate || 0,
              completedAppointments: data.completedAppointments || 0,
              totalAppointments: data.totalAppointments || 0,
              documentApprovalRate: data.documentApprovalRate || 0,
              responseTime: data.responseTime || 0,
              patientSatisfaction: data.patientSatisfaction || 0,
            },
          });
        }
      });

      setMonthlyData(monthlyDataArray);
    } catch (error) {
      console.error("Error fetching monthly data:", error);
      setMonthlyData([]);
    } finally {
      setIsLoadingMonthlyData(false);
    }
  };

  // Check if current month already has a Doctor of The Month
  const checkCurrentMonthSelection = async (month: string) => {
    try {
      const doctorOfMonthRef = collection(db, "doctorOfTheMonth");
      const q = query(
        doctorOfMonthRef,
        where("awardMonth", "==", month),
        where("isDoctorOfMonth", "==", true),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking current month selection:", error);
      return false;
    }
  };

  // Store Doctor of The Month data in Firebase
  const storeDoctorOfTheMonth = async (
    doctor: DoctorPerformance,
    month: string
  ) => {
    try {
      const doctorOfMonthRef = collection(db, "doctorOfTheMonth");

      // First, deactivate any existing Doctor of The Month for this month
      const existingQuery = query(
        doctorOfMonthRef,
        where("awardMonth", "==", month),
        where("isDoctorOfMonth", "==", true)
      );

      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { isDoctorOfMonth: false });
      });

      // Add new Doctor of The Month
      const performanceScore = calculatePerformanceScore(doctor);
      const now = new Date();
      const displayMonth = now.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      const doctorOfMonthData = {
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        awardMonth: month,
        displayMonth: displayMonth,
        rating: doctor.rating,
        cancellationRate: doctor.cancellationRate,
        completedAppointments: doctor.completedAppointments,
        totalAppointments: doctor.totalAppointments,
        documentApprovalRate: doctor.documentApprovalRate,
        responseTime: doctor.responseTime,
        patientSatisfaction: doctor.patientSatisfaction,
        isDoctorOfMonth: true,
        selectedDate: Timestamp.now(),
        performanceMetrics: {
          totalScore: performanceScore,
          appointmentCompletion:
            (doctor.completedAppointments / doctor.totalAppointments) * 100,
          patientSatisfaction: doctor.patientSatisfaction,
          responseTime: doctor.responseTime,
          documentCompliance: doctor.documentApprovalRate,
        },
      };

      await addDoc(doctorOfMonthRef, doctorOfMonthData);

      return true;
    } catch (error) {
      console.error("Error storing Doctor of The Month:", error);
      return false;
    }
  };

  // Initialize data fetching
  useEffect(() => {
    if (currentMonth) {
      fetchDoctorsPerformance(currentMonth);
      fetchHistoricalDoctorOfTheMonth();
      fetchMonthlyData();
    }
  }, [currentMonth]);

  // Auto-create Doctor of The Month if none exists for current month
  useEffect(() => {
    const autoCreateDoctorOfMonth = async () => {
      if (!currentMonth || isLoadingDoctorOfMonth || isLoadingPerformers)
        return;

      try {
        // Check if current month already has a Doctor of The Month
        const hasSelection = await checkCurrentMonthSelection(currentMonth);

        if (
          !hasSelection &&
          topPerformers.length > 0 &&
          !currentDoctorOfMonth
        ) {
          console.log(
            "No Doctor of The Month found for current month. Auto-creating..."
          );
          setIsAutoCreating(true);
          showInfo(
            "Auto-creating Doctor of The Month",
            "No doctor selected for this month. Creating automatically..."
          );

          // Get the top performer automatically
          const topPerformer = getTopPerformersByScore()[0];

          if (topPerformer) {
            const success = await storeDoctorOfTheMonth(
              topPerformer,
              currentMonth
            );

            if (success) {
              await triggerDoctorOfMonth(topPerformer.id).unwrap();
              console.log(
                `Automatically created ${topPerformer.name} as Doctor of The Month for ${currentMonth}`
              );
              showSuccess(
                `${topPerformer.name} has been automatically selected as Doctor of The Month!`
              );

              // Refetch all data
              refetchDoctorOfMonth();
              fetchHistoricalDoctorOfTheMonth();
              fetchMonthlyData();
            }
          }
        }
      } catch (error) {
        console.error("Error in auto-creating Doctor of The Month:", error);
      } finally {
        setIsAutoCreating(false);
      }
    };

    // Only run after we have both currentMonth and topPerformers data, and no current doctor of month
    if (
      currentMonth &&
      !isLoadingPerformers &&
      topPerformers.length > 0 &&
      !currentDoctorOfMonth &&
      !isAutoCreating
    ) {
      autoCreateDoctorOfMonth();
    }
  }, [
    currentMonth,
    topPerformers,
    isLoadingPerformers,
    isLoadingDoctorOfMonth,
    currentDoctorOfMonth,
    isAutoCreating,
  ]);

  const totalPages = Math.max(1, Math.ceil(pastDoctors.length / 10));

  // Calculate comprehensive performance score for Doctor of The Month selection
  const calculatePerformanceScore = (doctor: DoctorPerformance): number => {
    let score = 0;

    // Rating weight: 30%
    score += (doctor.rating / 100) * 30;

    // Completion rate weight: 25%
    const completionRate =
      (doctor.completedAppointments / doctor.totalAppointments) * 100;
    score += (completionRate / 100) * 25;

    // Cancellation rate weight: 20% (lower is better)
    const cancellationScore = Math.max(0, 100 - doctor.cancellationRate * 10);
    score += (cancellationScore / 100) * 20;

    // Document approval rate weight: 15%
    score += (doctor.documentApprovalRate / 100) * 15;

    // Response time weight: 10% (faster is better)
    const responseScore = Math.max(0, 100 - doctor.responseTime * 2);
    score += (responseScore / 100) * 10;

    return Math.round(score * 100) / 100; // Round to 2 decimal places
  };

  // Get top performers sorted by performance score
  const getTopPerformersByScore = (): DoctorPerformance[] => {
    return [...topPerformers]
      .map((doctor) => ({
        ...doctor,
        performanceScore: calculatePerformanceScore(doctor),
      }))
      .sort((a, b) => b.performanceScore - a.performanceScore);
  };

  // Get current leader (top performer)
  const currentLeader = getTopPerformersByScore()[0];

  // Handle Doctor of The Month selection
  const handleSelectDoctorOfMonth = async (doctorId: string) => {
    try {
      const doctor = topPerformers.find((d) => d.id === doctorId);
      if (!doctor) {
        console.error("Doctor not found");
        return;
      }

      // Check if current month already has a selection
      const hasSelection = await checkCurrentMonthSelection(currentMonth);
      if (hasSelection) {
        if (
          !confirm(
            "This month already has a Doctor of The Month. Do you want to replace them?"
          )
        ) {
          return;
        }
      }

      // Store in Firebase
      const success = await storeDoctorOfTheMonth(doctor, currentMonth);

      if (success) {
        // Trigger RTK Query mutation for additional processing
        await triggerDoctorOfMonth(doctorId).unwrap();
        console.log("Doctor of The Month selection completed successfully");

        // Refetch all data
        refetchDoctorOfMonth();
        fetchHistoricalDoctorOfTheMonth();
        fetchMonthlyData();
      }
    } catch (error) {
      console.error("Error in Doctor of The Month selection:", error);
    }
  };

  // Auto-select Doctor of The Month based on performance (monthly automation)
  const handleAutoSelectDoctorOfMonth = async () => {
    try {
      // Check if current month already has a selection
      const hasSelection = await checkCurrentMonthSelection(currentMonth);
      if (hasSelection) {
        if (
          !confirm(
            "This month already has a Doctor of The Month. Do you want to replace them?"
          )
        ) {
          return;
        }
      }

      // Get the top performer automatically
      const topPerformer = getTopPerformersByScore()[0];

      if (topPerformer) {
        const success = await storeDoctorOfTheMonth(topPerformer, currentMonth);

        if (success) {
          await triggerDoctorOfMonth(topPerformer.id).unwrap();
          console.log(
            `Automatically selected ${topPerformer.name} as Doctor of The Month`
          );

          // Refetch all data
          refetchDoctorOfMonth();
          fetchHistoricalDoctorOfTheMonth();
          fetchMonthlyData();
        }
      }
    } catch (error) {
      console.error("Error in auto-selection:", error);
    }
  };

  // Get performance insights for a doctor
  const getPerformanceInsights = (doctor: DoctorPerformance) => {
    const score = calculatePerformanceScore(doctor);
    const insights = [];

    if (score >= 95) {
      insights.push("Excellent performance across all metrics");
    } else if (score >= 90) {
      insights.push("Very good performance with room for improvement");
    } else if (score >= 85) {
      insights.push("Good performance, consider addressing specific areas");
    } else {
      insights.push("Performance needs improvement in several areas");
    }

    if (doctor.cancellationRate > 5) {
      insights.push(
        "High cancellation rate - consider scheduling improvements"
      );
    }

    if (doctor.responseTime > 12) {
      insights.push("Slow response time - consider improving communication");
    }

    return insights;
  };

  // Update top performers with calculated scores
  useEffect(() => {
    if (topPerformers.length > 0) {
      const updatedPerformers = topPerformers.map((doctor) => ({
        ...doctor,
        performanceScore: calculatePerformanceScore(doctor),
      }));
      setTopPerformers(updatedPerformers);
    }
  }, [topPerformers.length]);

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <Title title="Doctor of The Month" />
      </div>

      {/* Current Month Display */}

      {/* Current Leader Card */}
      <div className="flex justify-between items-center p-4 w-full md:w-[521px] h-[104px] bg-[#44CE2D] rounded-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Current Leader</p>
            <p className="text-xl text-white font-bold">
              {isLoadingDoctorOfMonth || isAutoCreating
                ? "Loading..."
                : currentDoctorOfMonth
                ? (currentDoctorOfMonth as unknown as DoctorOfTheMonth)?.name
                : currentLeader?.name || "No data available"}
            </p>
            <p className="text-white/80 text-sm">
              {isLoadingDoctorOfMonth || isAutoCreating
                ? "Loading..."
                : currentDoctorOfMonth
                ? (currentDoctorOfMonth as unknown as DoctorOfTheMonth)
                    ?.specialty
                : currentLeader?.specialty || "No data available"}
            </p>
            {isAutoCreating && (
              <p className="text-white/60 text-xs italic">
                Auto-creating Doctor of The Month...
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl text-white font-bold">
            {isLoadingDoctorOfMonth || isAutoCreating
              ? "..."
              : currentDoctorOfMonth
              ? (currentDoctorOfMonth as unknown as DoctorOfTheMonth)?.rating ||
                0
              : currentLeader?.performanceScore?.toFixed(1) || 0}
          </p>
        </div>
      </div>

      {/* Top Performers and Past Winners Grid */}
      <div className="flex flex-col gap-6">
        {/* Top Performers This Month */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Performers This Month
            </h3>
            <div className="flex items-center space-x-2">
              {isAutoCreating && (
                <span className="text-xs text-[#44CE2D] font-medium">
                  Auto-creating...
                </span>
              )}
              <button
                onClick={handleAutoSelectDoctorOfMonth}
                disabled={
                  isTriggering || topPerformers.length === 0 || isAutoCreating
                }
                className="px-3 py-1 bg-[#44CE2D] text-white rounded-lg text-sm hover:bg-[#3bb025] transition-colors disabled:opacity-50">
                {isTriggering ? "Selecting..." : "Auto-Select"}
              </button>
            </div>
          </div>

          {isLoadingPerformers ? (
            <div className="w-full md:w-[521px] p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#44CE2D] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading top performers...</p>
            </div>
          ) : topPerformers.length === 0 ? (
            <div className="w-full md:w-[521px] p-8 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No performance data available</p>
              <p className="text-sm text-gray-400">
                Performance metrics will appear here once data is available
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {getTopPerformersByScore().map((performer) => (
                <div
                  key={performer.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm w-full md:w-[521px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {performer.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {performer.specialty}
                        </p>
                        <p className="text-xs text-gray-500">
                          Score: {performer.performanceScore?.toFixed(1)} |
                          {performer.completedAppointments}/
                          {performer.totalAppointments} appointments
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-[#44CE2D]">
                        {performer.performanceScore?.toFixed(1) || 0}
                      </span>
                      <button
                        onClick={() => handleSelectDoctorOfMonth(performer.id)}
                        disabled={isTriggering}
                        className="block mt-1 text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50">
                        Select as DoM
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Doctors of The Month Table */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Past Doctors of The Month
          </h3>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DOCTOR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SPECIALTY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MONTH
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RATING
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CANCELLATION RATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      COMPLETED APPOINTMENT
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoadingPastDoctors ? (
                    <SVGLoaderFetch colSpan={7} />
                  ) : pastDoctors?.length === 0 ||
                    pastDoctors?.length === undefined ? (
                    <NoRecordFound colSpan={7} />
                  ) : (
                    pastDoctors.map((doctor, index) => (
                      <tr
                        key={doctor.id || index}
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-gray-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {doctor.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doctor.specialty}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doctor.displayMonth}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doctor.rating}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doctor.cancellationRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doctor.completedAppointments}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors">
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-[#44CE2D] text-white rounded-lg text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDoctorOfMonthPage;
