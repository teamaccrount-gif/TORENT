import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import type { Role } from '../../types';

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "bg-green-100 text-green-800 border-green-200",
        warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  variant?: any;
}

function Badge({ className, variant, ...props }: BadgeProps) {
  // Map legacy variants to shadcn variants
  let mappedVariant: any = variant;
  if (variant === 'primary') mappedVariant = 'secondary';
  if (variant === 'danger') mappedVariant = 'outline';
  if (variant === 'default') mappedVariant = 'outline';
  // success and warning are handled by the variants above

  return (
    <div className={cn(badgeVariants({ variant: mappedVariant }), className)} {...props} />
  )
}

// Helper component specifically for Role
export const RoleBadge: React.FC<{ role: Role | { name: string } }> = ({ role }) => {
  const roleFormat = {
    'SUPER_ADMIN': { label: 'Super Admin', variant: 'danger' as const },
    'ADMIN': { label: 'Admin', variant: 'danger' as const },
    'MANAGER': { label: 'Manager', variant: 'primary' as const },
    'ENGINEER': { label: 'Engineer', variant: 'warning' as const },
    'OPERATOR': { label: 'Operator', variant: 'success' as const },
  };

  const roleName = typeof role === 'object' && role !== null ? (role as any).name : role;
  const normalizedRole = String(roleName || '').toUpperCase().replace(/ /g, '_');
  
  const fallback = {
    label: roleName ? String(roleName).replace(/[_-]/g, ' ') : 'Unknown Role',
    variant: 'default' as const,
  };
  const { label, variant } = (roleFormat as any)[normalizedRole] ?? fallback;
  return <Badge variant={variant}>{label}</Badge>;
};

// Helper component specifically for Status (Active/Inactive)
export const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return isActive ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="default">Inactive</Badge>
  );
};

export { Badge, badgeVariants }
