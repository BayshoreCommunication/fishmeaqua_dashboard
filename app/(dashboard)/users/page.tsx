import { Suspense } from "react";
import UsersDetailsView from "@/components/users/UsersDetailsView";

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <UsersDetailsView />
      </Suspense>
    </div>
  );
};

export default page;
