import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Brain,
  Clock,
  Code2,
  Database,
  FlaskConical,
  GitBranch,
  Layers,
  ListChecks,
  Network,
  Palette,
  Play,
  Rocket,
  Scale,
  Send,
  Server,
} from "lucide-react";

export const docsHomeIcon: LucideIcon = BookOpen;

export const docPageIcons: Record<string, LucideIcon> = {
  "getting-started": Rocket,
  overview: BookOpen,
  "how-it-works": GitBranch,
  judges: Scale,
  "walrus-memory": Database,
  "how-walrus-memory-is-used": Network,
  "how-memory-improves-agent": Brain,
  deployment: Server,
  "cron-job": Clock,
  "telegram-bot": Send,
  "api-reference": Code2,
  architecture: Layers,
  "demo-guide": Play,
  testing: FlaskConical,
  "test-coverage": BarChart3,
  "product-design": Palette,
  implementation: ListChecks,
  risks: AlertTriangle,
};

export function getDocPageIcon(slug: string): LucideIcon {
  return docPageIcons[slug] ?? BookOpen;
}
