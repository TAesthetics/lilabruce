/**
 * Mobile App Shell for iOS and Android
 * Handles safe areas, native navigation, and mobile-specific UI
 */

import { ReactNode } from "react";
import { isPlatform } from "@capacitor/core";
import { useSafeArea } from "@/lib/mobile/hooks";
import { cn } from "@/lib/utils";

interface MobileAppShellProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  backgroundColor?: string;
}

export function MobileAppShell({
  children,
  header,
  footer,
  backgroundColor = "bg-bg",
}: MobileAppShellProps) {
  const insets = useSafeArea();
  const isNative = isPlatform("hybrid");

  if (!isNative) {
    // Web fallback
    return (
      <div className={cn("flex h-dvh flex-col", backgroundColor)}>
        {header && <div className="border-b border-border">{header}</div>}
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-border">{footer}</div>}
      </div>
    );
  }

  // Native iOS/Android layout
  return (
    <div
      className={cn(
        "flex h-dvh flex-col",
        backgroundColor,
      )}
      style={{
        paddingTop: `${insets.top}px`,
        paddingBottom: `${insets.bottom}px`,
        paddingLeft: `${insets.left}px`,
        paddingRight: `${insets.right}px`,
      }}
    >
      {/* Status bar space already handled by insets.top */}

      {header && (
        <div
          className="border-b border-border bg-elevated"
          style={{
            paddingTop: insets.top > 0 ? "8px" : "4px",
            paddingBottom: "8px",
          }}
        >
          {header}
        </div>
      )}

      {/* Main content - scrollable */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          WebkitOverflowScrolling: "touch", // Momentum scrolling on iOS
        }}
      >
        {children}
      </div>

      {footer && (
        <div
          className="border-t border-border bg-elevated"
          style={{
            paddingBottom: `max(8px, ${insets.bottom}px)`,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * Mobile Header with back button
 */
interface MobileHeaderProps {
  title?: string;
  onBack?: () => void;
  actions?: ReactNode;
}

export function MobileHeader({ title, onBack, actions }: MobileHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg active:bg-elevated"
            aria-label="Back"
          >
            <span className="text-lg">←</span>
          </button>
        )}
        {title && (
          <h1 className="text-lg font-semibold text-fg">{title}</h1>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * Mobile Tab Navigation
 */
interface MobileTab {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

interface MobileTabsProps {
  tabs: MobileTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function MobileTabs({
  tabs,
  activeTab,
  onChange,
}: MobileTabsProps) {
  return (
    <div className="flex border-t border-border bg-elevated">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[11px] font-semibold transition-colors",
            activeTab === tab.id
              ? "text-cyan"
              : "text-muted hover:text-fg",
          )}
        >
          <div className="text-xl">{tab.icon}</div>
          <span>{tab.label}</span>
          {tab.badge ? (
            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] text-bg font-bold">
              {Math.min(tab.badge, 9)}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/**
 * Mobile Card (touch-friendly)
 */
interface MobileCardProps {
  children: ReactNode;
  onTap?: () => void;
  className?: string;
}

export function MobileCard({
  children,
  onTap,
  className,
}: MobileCardProps) {
  return (
    <button
      onClick={onTap}
      disabled={!onTap}
      className={cn(
        "w-full rounded-lg border border-border bg-surface p-4 text-left transition-colors",
        onTap && "active:bg-elevated",
        !onTap && "cursor-default",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * Mobile Input (keyboard-aware)
 */
interface MobileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function MobileInput({
  label,
  error,
  ...props
}: MobileInputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-fg">{label}</label>
      )}
      <input
        {...props}
        className={cn(
          "rounded-lg border bg-surface px-4 py-3 text-base font-sans text-fg outline-none transition-colors",
          error ? "border-danger" : "border-border focus:border-cyan",
        )}
        style={{
          // Prevents zoom on iOS when font-size < 16px
          fontSize: "16px",
        }}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

/**
 * Mobile Button (minimum 44px tap target)
 */
interface MobileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
}

export function MobileButton({
  variant = "primary",
  size = "lg",
  fullWidth = false,
  loading = false,
  children,
  className,
  ...props
}: MobileButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-4 py-3.5 text-base min-h-[44px]", // 44px minimum
  };

  const variantClasses = {
    primary: "bg-cyan text-bg font-semibold active:opacity-80",
    secondary: "bg-elevated text-fg border border-border active:bg-surface",
    danger: "bg-danger text-bg font-semibold active:opacity-80",
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        "w-full rounded-lg font-sans font-medium transition-opacity active:scale-95 disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant],
        !fullWidth && "w-auto",
        className,
      )}
    >
      {loading ? (
        <span className="inline-block animate-spin">⟳</span>
      ) : (
        children
      )}
    </button>
  );
}
