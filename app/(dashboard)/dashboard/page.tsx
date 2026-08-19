import { Suspense } from "react";
import DashboardDetailsView from "@/components/dashboard/DashboardDetailsView";

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <DashboardDetailsView />
      </Suspense>
    </div>
  );
};

export default page;
