import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Courses } from "@/components/landing/courses";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  // Force re-render to fix hydration mismatch
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Courses />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
