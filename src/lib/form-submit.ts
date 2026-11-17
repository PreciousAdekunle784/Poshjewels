"use client";

import { startTransition } from "react";

/**
 * React resets uncontrolled inputs after a `<form action>` completes, which would wipe what
 * someone typed when validation fails. Submitting through onSubmit keeps their input.
 */
export function keepValues(dispatch: (fd: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
}
