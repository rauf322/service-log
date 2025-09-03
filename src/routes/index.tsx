import { createFileRoute } from "@tanstack/react-router";
import ServiceLogForm from "@/components/ServiceLogForm/ServiceLogForm";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { edit?: string } => {
    return {
      edit: typeof search.edit === "string" ? search.edit : undefined,
    };
  },
  component: () => <ServiceLogForm />,
});
