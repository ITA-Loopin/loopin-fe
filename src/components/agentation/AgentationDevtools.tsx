"use client";

import { Agentation } from "agentation";

const isAgentationEnabled =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_AGENTATION_ENABLED === "true";

export function AgentationDevtools() {
  if (!isAgentationEnabled) {
    return null;
  }

  return <Agentation />;
}