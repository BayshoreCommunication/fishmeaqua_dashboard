import { Suspense } from "react";
import CategoryDetailsView from "@/components/category/CategoryDetailsView";

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <CategoryDetailsView />
      </Suspense>
    </div>
  );
};

export default page;
