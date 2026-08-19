import { Suspense } from "react";
import SigninPage from "@/components/auth/SigninPage";

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <SigninPage />
      </Suspense>
    </div>
  );
};

export default page;
