import { Header, Footer } from "@/components/layout/header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-14">{children}</main>
      <Footer />
    </>
  );
}
