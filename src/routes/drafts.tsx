import { createFileRoute } from "@tanstack/react-router";
import DraftManager from "@/components/DraftManager/DraftManager";

export const Route = createFileRoute("/drafts")({
  component: () => <DraftManager />,
});
