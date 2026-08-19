import { Suspense } from "react";
import GeneralSettings from "@/components/settings/GeneralSettings";

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <GeneralSettings />
      </Suspense>
    </div>
  );
};

export default page;
