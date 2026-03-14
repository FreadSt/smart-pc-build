import { Header } from "@/widgets/header";
import { BuilderSidebar } from "@/widgets/sidebar";
import { BuildCanvas } from "@/widgets/build-canvas";
import { PerformancePanel } from "@/widgets/performance-panel";

export function BuilderPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 bg-[var(--background)]">
        <BuilderSidebar />
        <BuildCanvas />
        <PerformancePanel />
      </main>
    </div>
  );
}

