import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export default function PageHeader({ title, description, className = "" }: PageHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
        {title}
      </h1>
      {description && (
        <p className="text-[var(--muted-foreground)]">
          {description}
        </p>
      )}
    </div>
  );
}
