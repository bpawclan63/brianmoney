import {
    Zap,
    GraduationCap,
    Film,
    Utensils,
    Laptop,
    Gift,
    Heart,
    TrendingUp,
    MoreHorizontal,
    Briefcase,
    ShoppingBag,
    Car,
    HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const iconMap: Record<string, React.ComponentType<any>> = {
    Zap,
    GraduationCap,
    Film,
    Utensils,
    Laptop,
    Gift,
    Heart,
    TrendingUp,
    MoreHorizontal,
    Briefcase,
    ShoppingBag,
    Car,
};

interface CategoryIconProps {
    iconName: string;
    className?: string;
}

export function CategoryIcon({ iconName, className }: CategoryIconProps) {
    const Icon = iconMap[iconName] || HelpCircle;

    return <Icon className={cn("w-6 h-6", className)} />;
}
