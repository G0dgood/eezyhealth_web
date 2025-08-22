"use client";

import { Users, Calendar, CreditCard, User } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6 theme-transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-3xl font-bold text-card-blue">232</p>
            </div>
            <div className="w-12 h-12 bg-card-blue/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-card-blue" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 theme-transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Doctors</p>
              <p className="text-3xl font-bold text-card-green">56</p>
            </div>
            <div className="w-12 h-12 bg-card-green/10 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-card-green" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 theme-transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-3xl font-bold text-card-pink">453</p>
            </div>
            <div className="w-12 h-12 bg-card-pink/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-card-pink" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 theme-transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-primary">N230,000</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-card border border-border rounded-lg p-6 theme-transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Today&apos;s Appointment (01-08-2025)
            </h3>
            <button className="px-3 py-1 bg-secondary text-secondary-foreground rounded-lg text-sm">
              Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground">
                    Patient
                  </th>
                  <th className="text-left py-2 text-muted-foreground">
                    Doctor
                  </th>
                  <th className="text-left py-2 text-muted-foreground">Time</th>
                  <th className="text-left py-2 text-muted-foreground">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-2">Tina Simeon</td>
                  <td className="py-2">Dr Mary Paul</td>
                  <td className="py-2">09:00 AM</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-info text-white text-xs rounded-full">
                      Video
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2">Tina Simeon</td>
                  <td className="py-2">Dr Paul moses</td>
                  <td className="py-2">10:30 AM</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-warning text-white text-xs rounded-full">
                      Chat
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Tina Simeon</td>
                  <td className="py-2">Dr Mary Paul</td>
                  <td className="py-2">02:00 PM</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-success text-white text-xs rounded-full">
                      Call
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Doctor Verification Requests */}
        <div className="bg-card border border-border rounded-lg p-6 theme-transition">
          <h3 className="text-lg font-semibold mb-4">
            Doctor Verification Requests
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground">Name</th>
                  <th className="text-left py-2 text-muted-foreground">
                    Specialization
                  </th>
                  <th className="text-left py-2 text-muted-foreground">Date</th>
                  <th className="text-left py-2 text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-2">Dr Mary Paul</td>
                  <td className="py-2">ENT</td>
                  <td className="py-2">24-05-2024</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-status-pending text-white text-xs rounded-full">
                      Pending
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2">Dr Paul moses</td>
                  <td className="py-2">Dermatologist</td>
                  <td className="py-2">24-05-2024</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-status-pending text-white text-xs rounded-full">
                      Pending
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Dr Mary Paul</td>
                  <td className="py-2">Cardiologist</td>
                  <td className="py-2">24-05-2024</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-status-pending text-white text-xs rounded-full">
                      Pending
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Page 1 of 10</span>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 bg-muted text-muted-foreground rounded-lg text-sm disabled:opacity-50"
                disabled>
                Previous
              </button>
              <button className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
