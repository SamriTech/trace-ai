declare module "lucide-react" {
  import * as React from "react";

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    className?: string;
  }

  export type LucideIcon = React.FC<LucideProps>;

  export const Shield: LucideIcon;
  export const Radio: LucideIcon;
  export const Activity: LucideIcon;
  export const PlusCircle: LucideIcon;
  export const Plus: LucideIcon;
  export const Search: LucideIcon;
  export const Video: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const Upload: LucideIcon;
  export const Image: LucideIcon;
  export const X: LucideIcon;
  export const Calendar: LucideIcon;
  export const Clock: LucideIcon;
  export const MapPin: LucideIcon;
  export const Camera: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Check: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Sliders: LucideIcon;
  export const Eye: LucideIcon;
  export const Layers: LucideIcon;
  export const Compass: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const XCircle: LucideIcon;
  export const Maximize2: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Filter: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowDown: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const User: LucideIcon;
  export const Home: LucideIcon;
  export const FolderOpen: LucideIcon;
  export const Map: LucideIcon;
  export const Bell: LucideIcon;
  export const FileText: LucideIcon;
  export const Settings: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Info: LucideIcon;
  export const Navigation: LucideIcon;
  export const Play: LucideIcon;
  export const Pause: LucideIcon;
  export const ZoomIn: LucideIcon;
  export const SkipBack: LucideIcon;
  export const SkipForward: LucideIcon;
}
