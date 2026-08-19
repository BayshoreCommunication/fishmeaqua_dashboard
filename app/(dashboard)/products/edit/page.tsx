import { Suspense } from "react";
import EditProduct from "@/components/product/EditProduct";

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <EditProduct />
      </Suspense>
    </div>
  );
};

export default page;
