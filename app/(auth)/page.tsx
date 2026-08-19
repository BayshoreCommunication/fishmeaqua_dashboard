import { auth } from "@/auth";

const page = async () => {
  const session = await auth();

  console.log("check session 250255", session);

  // Transform session to match LandingPage's expected type
  const transformedSession = session
    ? {
        user: session.user
          ? {
              id: session.user.id,
              email: session.user.email,
              name: session.user.name === null ? undefined : session.user.name,
            }
          : undefined,
      }
    : null;

  return <div>Test</div>;
};

export default page;
