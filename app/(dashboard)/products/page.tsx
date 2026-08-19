import ProductList from "@/components/product/ProductList";
import { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <ProductList />
      </Suspense>
    </div>
  );
};

export default page;
