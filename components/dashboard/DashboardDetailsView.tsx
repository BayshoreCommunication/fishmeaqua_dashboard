"use client";

import { BiBarChartAlt2 } from "react-icons/bi";

const DashboardDetailsView = () => {
  return (
    <div className="flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="rounded border border-gray-200 bg-white p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Platform overview
          </p>
        </div>
      </div>

      {/* Empty state — no analytics backend wired up yet */}
      <div className="rounded border border-gray-200 bg-white py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
          <BiBarChartAlt2 size={32} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Analytics coming soon
        </h3>
        <p className="mx-auto max-w-sm text-sm text-gray-500">
          Platform stats and growth charts will appear here once the
          reporting backend is built out.
        </p>
      </div>
    </div>
  );
};

export default DashboardDetailsView;
