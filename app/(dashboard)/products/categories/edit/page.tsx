import { Suspense } from "react";
import EditCategory from "@/components/category/EditCategory";

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <EditCategory />
      </Suspense>
    </div>
  );
};

export default page;
