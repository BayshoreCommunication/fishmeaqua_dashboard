import { Suspense } from "react";
import CustomerEdit from "@/components/customers/CustomerEdit";

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <CustomerEdit />
      </Suspense>
    </div>
  );
};

export default page;
