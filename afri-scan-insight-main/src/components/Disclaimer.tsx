import { AlertCircle } from "lucide-react";

const Disclaimer = () => (
  <div className="flex items-center gap-2.5 bg-accent/60 border border-border rounded-lg px-4 py-2.5">
    <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
    <p className="text-[11px] text-muted-foreground leading-tight">
      <span className="font-semibold">Decision support only.</span> Not a medical diagnosis. All outputs must be interpreted by a qualified healthcare professional.
    </p>
  </div>
);

export default Disclaimer;
