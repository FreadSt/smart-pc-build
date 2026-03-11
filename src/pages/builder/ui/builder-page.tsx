import { Header } from "@/widgets/header/ui/header";
import { BuilderSidebar } from "@/widgets/sidebar/ui/builder-sidebar";
import { BuildCanvas } from "@/widgets/build-canvas/ui/build-canvas";
import { PerformancePanel } from "@/widgets/performance-panel/ui/performance-panel";

export default function BuilderPage() {
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

