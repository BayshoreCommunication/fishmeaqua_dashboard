import LayoutWrapper from "@/components/layout/LayoutWrapper";

// Nested layout within the (dashboard) route group — the root app/layout.tsx
// already provides <html>/<body>, fonts, and metadata. Redeclaring them here
// produced nested <html> elements, which broke static prerendering (build-time
// "Cannot read properties of null (reading 'useContext')" crashes).
//
// Every page under here is an auth-gated client component that fetches its
// own data at request time via server actions — none of it is meant to be
// statically generated at build time. Force dynamic rendering for the whole
// section so `next build` doesn't try (and fail) to prerender each one.
export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
