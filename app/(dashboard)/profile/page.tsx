import { Suspense } from "react";
import ProfilesDetails from "@/components/profiles/ProfilesDetails";

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <ProfilesDetails />
      </Suspense>
    </div>
  );
};

export default page;
