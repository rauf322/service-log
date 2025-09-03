import { createFileRoute } from "@tanstack/react-router";
import SavedLogs from "@/components/SavedLogs/SavedLogs";

export const Route = createFileRoute("/saved")({
  component: () => <SavedLogs />,
});
