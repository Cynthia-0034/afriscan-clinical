import { RiskLevel } from "@/lib/types";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
}

const RiskBadge = ({ level, size = "sm" }: RiskBadgeProps) => {
  const classMap: Record<RiskLevel, string> = {
    LOW: "risk-badge-low",
    MODERATE: "risk-badge-moderate",
    HIGH: "risk-badge-high",
    UNSUPPORTED: "risk-badge-unsupported",
  };

  const sizeClass =
    size === "lg" ? "text-xs px-3.5 py-1" :
    size === "md" ? "text-[11px] px-3 py-0.5" : "";

  return <span className={`${classMap[level]} ${sizeClass}`}>{level}</span>;
};

export default RiskBadge;
