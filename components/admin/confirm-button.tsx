"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Submits a form action only after an explicit confirmation. Radix supplies the
 * focus trap and Escape handling, so the confirm step is keyboard-usable.
 */
export function ConfirmButton({
  action,
  hidden,
  label,
  title,
  description,
  confirmLabel,
  variant = "danger",
  size = "sm",
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden?: Record<string, string>;
  label: React.ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant={variant} size={size}>
          {label}
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-50 bg-black/75" />
        <Dialog.Content className="dialog-panel fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto border-t border-crease bg-ink-raised p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[24rem] sm:max-w-[calc(100vw-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[4px] sm:border sm:p-6">
          <Dialog.Title className="display-tight text-lg text-chalk">{title}</Dialog.Title>
          <Dialog.Description className="mt-2.5 text-[0.875rem] leading-relaxed text-chalk-dim">
            {description}
          </Dialog.Description>

          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <Button variant="subtle" size="md">
                Cancel
              </Button>
            </Dialog.Close>
            <form
              action={action}
              onSubmit={() => setOpen(false)}
              className="contents"
            >
              {Object.entries(hidden ?? {}).map(([name, value]) => (
                <input key={name} type="hidden" name={name} value={value} />
              ))}
              <Button type="submit" variant={variant} size="md">
                {confirmLabel}
              </Button>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
