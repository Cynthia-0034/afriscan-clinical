import { Activity, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const AppHeader = () => (
  <header className="bg-card border-b px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-50">
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
        <Activity className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="leading-none">
        <span className="text-sm font-bold tracking-tight text-foreground">AfriScan Assist</span>
        <span className="hidden sm:block text-[10px] text-muted-foreground leading-none mt-0.5">AI-assisted TB triage & clinical support</span>
      </div>
    </Link>
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-accent border border-primary/15 px-3 py-1 rounded-full">
        <Shield className="w-3 h-3" />
        <span className="hidden sm:inline">Prototype</span> Demo Ready
      </div>
    </div>
  </header>
);

export default AppHeader;
