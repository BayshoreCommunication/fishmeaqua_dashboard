import { Suspense } from "react";
import AddProduct from "@/components/product/AddProduct";

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <AddProduct />
      </Suspense>
    </div>
  );
};

export default page;
