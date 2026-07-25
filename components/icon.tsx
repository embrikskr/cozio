import {
  BookOpen,
  Key,
  Wifi,
  Home,
  Utensils,
  MapPin,
  Car,
  Info,
  Heart,
  Shield,
  Sparkles,
  Tv,
  Thermometer,
  Trash2,
  Phone,
  Calendar,
  FileText,
  Coffee,
  Wine,
  Camera,
  ShoppingBag,
  Ticket,
  Waves,
  Bus,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  key: Key,
  wifi: Wifi,
  home: Home,
  utensils: Utensils,
  "map-pin": MapPin,
  car: Car,
  info: Info,
  heart: Heart,
  shield: Shield,
  sparkles: Sparkles,
  tv: Tv,
  thermometer: Thermometer,
  "trash-2": Trash2,
  phone: Phone,
  calendar: Calendar,
  "file-text": FileText,
  coffee: Coffee,
  wine: Wine,
  camera: Camera,
  "shopping-bag": ShoppingBag,
  ticket: Ticket,
  waves: Waves,
  bus: Bus,
};

export function Icon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Cmp = MAP[name] ?? FileText;
  return <Cmp className={className} style={style} />;
}
