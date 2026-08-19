import { Suspense } from "react";
import AddCategory from "@/components/category/AddCategory";

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <AddCategory />
      </Suspense>
    </div>
  );
};

export default page;
