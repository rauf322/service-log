import { useState } from "react";
import { useSavedLogs, useDeleteServiceLog } from "@/hooks/useServiceLogs";
import LogsFilter, {
  type FilterState,
} from "@/components/logsFilter/LogsFilter";
import { useFilteredLogs } from "@/hooks/useFilterLogs";
import { useNavigate } from "@tanstack/react-router";
import type { ServiceLog } from "@/types/serviceLog";
import "./SavedLogs.css";

export default function SavedLogs() {
  const { data: savedLogs, isLoading } = useSavedLogs();
  const deleteLogMutation = useDeleteServiceLog();
  const navigate = useNavigate();

  const handleDeleteLog = (logId: number, serviceOrder: string) => {
    if (confirm(`Delete Service log ${serviceOrder}`)) {
      deleteLogMutation.mutate(logId);
    }
  };

  const handleDeleteAll = () => {
    if (!savedLogs || savedLogs.length === 0) return;

    if (confirm(`Delete all ${savedLogs.length} service logs?`)) {
      Promise.all(
        savedLogs.map((log) => deleteLogMutation.mutateAsync(log.id!)),
      );
    }
  };

  const handleEditLog = (log: ServiceLog) => {
    navigate({ 
      to: '/', 
      search: { edit: log.id?.toString() || '' }
    });
  };

  const [filter, setFilter] = useState<FilterState>({
    keySel: "",
    val: "",
    from: "",
    to: "",
    order: "asc",
    serviceType: "",
  });

  const onChange = (patch: Partial<FilterState>) =>
    setFilter((prev) => ({ ...prev, ...patch }));

  const displayed = useFilteredLogs(savedLogs, filter);

  return (
    <div className="saved-logs">
      <h2>Saved Service Logs</h2>

      <LogsFilter
        filter={filter}
        onChange={onChange}
        onReset={() =>
          setFilter({
            keySel: "",
            val: "",
            from: "",
            to: "",
            order: "asc",
            serviceType: "",
          })
        }
      />

      {isLoading && <p>Loading saved logs...</p>}

      {!isLoading && (!savedLogs || savedLogs.length === 0) && (
        <p>No saved logs yet. Submit a form to create your first log!</p>
      )}

      {!isLoading && savedLogs && savedLogs.length > 0 && (
        <>
          <p>
            Showing {displayed.length} of {savedLogs.length} saved service logs.
          </p>

          {displayed.length === 0 ? (
            <p>No matching logs for the current filters.</p>
          ) : (
            <div className="logs-list">
              {displayed.map((log) => (
                <div
                  key={`${log.serviceOrder}-${log.carId}-${log.startDate}`}
                  className="log-item"
                >
                  <div className="log-actions">
                    <button
                      type="button"
                      className="btn-edit"
                      onClick={() => handleEditLog(log)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => handleDeleteLog(log.id!, log.serviceOrder)}
                      disabled={deleteLogMutation.isPending}
                    >
                      {deleteLogMutation.isPending ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                  <h3>Service Order: {log.serviceOrder}</h3>
                  <p>
                    <strong>Car ID:</strong> {log.carId}
                  </p>
                  <p>
                    <strong>Provider:</strong> {log.providerId}
                  </p>
                  <p>
                    <strong>Type:</strong> {String(log.type)}
                  </p>
                  <p>
                    <strong>Odometer:</strong> {log.odometer} mi
                  </p>
                  <p>
                    <strong>Engine Hours:</strong> {log.engineHours}
                  </p>
                  <p>
                    <strong>Date:</strong> {log.startDate} to {log.endDate}
                  </p>
                  <p>
                    <strong>Description:</strong> {log.serviceDescription}
                  </p>
                </div>
              ))}
              <div className="log-actions">
                <button
                  onClick={handleDeleteAll}
                  className="log-action-btn log-action-btn--delete"
                  disabled={deleteLogMutation.isPending}
                >
                  {deleteLogMutation.isPending
                    ? "Deleting All..."
                    : "🗑️ Delete All"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}