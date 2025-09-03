import { useMemo } from "react";
import type { ServiceLog } from "@/types/serviceLog";
import type { FilterState } from "@/components/logsFilter/LogsFilter";

/**
 * Filters logs based on date range overlap
 */
const filterByDateRange = (
  logs: ServiceLog[],
  from: string,
  to: string,
): ServiceLog[] => {
  const hasFrom = from.trim().length === 10;
  const hasTo = to.trim().length === 10;

  if (!hasFrom && !hasTo) return logs;

  const lo = hasFrom ? from : "0000-01-01";
  const hi = hasTo ? to : "9999-12-31";

  return logs.filter((log) => log.endDate >= lo && log.startDate <= hi);
};

/**
 * Filters logs by service type
 */
const filterByServiceType = (
  logs: ServiceLog[],
  serviceType: string,
): ServiceLog[] => {
  if (!serviceType) return logs;
  return logs.filter((log) => String(log.type) === serviceType);
};

/**
 * Filters logs by field value (text or number search)
 */
const filterByFieldValue = (
  logs: ServiceLog[],
  keySel: keyof ServiceLog | "",
  val: string,
): ServiceLog[] => {
  const trimmed = val.trim();
  if (!keySel || !trimmed) return logs;

  const searchValue = trimmed.toLowerCase();

  return logs.filter((log) => {
    const field = log[keySel];
    if (field == null) return false;

    // Handle number fields
    if (typeof field === "number") {
      const searchNumber = Number(searchValue);
      return !Number.isNaN(searchNumber) && field === searchNumber;
    }

    // Handle string fields
    return String(field).toLowerCase().includes(searchValue);
  });
};

/**
 * Sorts logs by specified key and direction
 */
const sortLogs = (
  logs: ServiceLog[],
  sortKey: keyof ServiceLog | null,
  order: "asc" | "desc",
): ServiceLog[] => {
  if (!sortKey) return logs;

  const direction = order === "asc" ? 1 : -1;

  return [...logs].sort((a, b) => {
    const valueA = a[sortKey];
    const valueB = b[sortKey];

    // Handle number comparison
    if (typeof valueA === "number" && typeof valueB === "number") {
      return (valueA - valueB) * direction;
    }

    // Handle string comparison
    return String(valueA).localeCompare(String(valueB)) * direction;
  });
};

/**
 * Determines the sort key based on filter state
 */
const getSortKey = (
  keySel: keyof ServiceLog | "",
  from: string,
  to: string,
): keyof ServiceLog | null => {
  if (keySel) return keySel;

  const hasDateFilter = from.trim().length === 10 || to.trim().length === 10;
  return hasDateFilter ? "startDate" : null;
};

/**
 * React hook that filters and sorts service logs with memoization
 */
export const useFilteredLogs = (
  logs: ServiceLog[] | undefined,
  filter: FilterState,
) => {
  return useMemo(() => {
    if (!logs) return [];

    const { keySel, val, from, to, order, serviceType } = filter;

    // Apply filters in sequence
    let filteredLogs = logs;
    filteredLogs = filterByDateRange(filteredLogs, from, to);
    filteredLogs = filterByServiceType(filteredLogs, serviceType);
    filteredLogs = filterByFieldValue(filteredLogs, keySel, val);

    // Apply sorting
    const sortKey = getSortKey(keySel, from, to);
    filteredLogs = sortLogs(filteredLogs, sortKey, order);

    return filteredLogs;
  }, [logs, filter]);
};
