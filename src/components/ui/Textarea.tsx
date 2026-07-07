import type { Ref, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { CONTROL_CLASSES } from "./Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
  invalid?: boolean;
}

export function Textarea({ className, invalid, rows = 4, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL_CLASSES,
        "min-h-24 resize-y leading-relaxed",
        invalid && "border-danger focus:border-danger focus:ring-danger/25",
        className,
      )}
      {...rest}
    />
  );
}
