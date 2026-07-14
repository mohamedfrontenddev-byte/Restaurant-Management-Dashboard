"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import type { z } from "zod";

// Cast wrapper to avoid Resolver generic mismatches when zod schemas
// transform input (e.g. z.coerce) into a different output type.
export function formResolver<T>(schema: z.ZodType<T>): Resolver<T, any, T> {
  return zodResolver(schema) as unknown as Resolver<T, any, T>;
}
