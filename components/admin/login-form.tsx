"use client";

import { useActionState, useId } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { loginAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(loginAction, {});
  const passwordId = useId();

  return (
    <form action={formAction} className="mt-7">
      <label htmlFor={passwordId} className="block text-[0.8125rem] font-semibold text-chalk">
        Admin password
      </label>
      <input
        id={passwordId}
        name="password"
        type="password"
        autoComplete="current-password"
        required
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? `${passwordId}-error` : undefined}
        className="mt-1.5 h-12 w-full rounded-[3px] border border-crease bg-ink px-3.5 text-[1rem] text-chalk"
      />

      {state.error && (
        <p
          id={`${passwordId}-error`}
          role="alert"
          className="mt-3 flex items-start gap-2 text-[0.8125rem] text-leather-soft"
        >
          <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="mt-5 w-full">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Checking...
          </>
        ) : (
          "Log in"
        )}
      </Button>
    </form>
  );
}
