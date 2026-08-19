import { Suspense } from "react";
import RolesPermissionsView from "@/components/settings/RolesPermissionsView";

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <RolesPermissionsView />
      </Suspense>
    </div>
  );
};

export default page;
