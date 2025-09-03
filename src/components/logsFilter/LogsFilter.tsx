import type { ServiceLog } from "@/types/serviceLog";
import { ServiceType } from "@/types/serviceLog";
import { getMinEndDate, getTodayDate } from "@/utils/dateUtils";
import "./LogsFilter.css";

type Order = "asc" | "desc";

// Simplified - use proper enum
export type FilterState = {
  keySel: keyof ServiceLog | "";
  val: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  order: Order;
  serviceType: ServiceType | ""; // Use enum instead of string
};

// Simplified props - auto-derive options
type LogsFilterProps = {
  filter: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
};

// Auto-generate field types
const getInputType = (key: keyof ServiceLog): 'text' | 'number' | 'date' => {
  if (key === 'odometer' || key === 'engineHours') return 'number';
  if (key === 'startDate' || key === 'endDate') return 'date';
  return 'text';
};

// Auto-generate filterable keys (exclude system fields)
const FILTERABLE_KEYS: Array<keyof ServiceLog> = [
  'providerId', 'serviceOrder', 'carId', 
  'odometer', 'engineHours', 'serviceDescription'
];

export default function LogsFilter({
  filter,
  onChange,
  onReset,
}: LogsFilterProps) {
  const { keySel, val, from, to, order, serviceType } = filter;

  // Auto-derive service type options from enum
  const serviceTypeOptions = Object.values(ServiceType);

  const inputType: "text" | "number" | "date" = keySel 
    ? getInputType(keySel)
    : "text";

  const canToggleOrder = !!keySel || from.length === 10 || to.length === 10;

  return (
    <div className="logs-filter">
      {/* Date range */}
      <div className="logs-filter__row">
        <label className="logs-filter__field">
          <span className="logs-filter__label">From:</span>
          <input
            className="logs-filter__input"
            type="date"
            value={from}
            onChange={(e) => {
              const newFrom = e.target.value;
              const patch: Partial<FilterState> = { from: newFrom };
              if (newFrom) {
                const minEnd = getMinEndDate(newFrom); // ensures +1 day and ≥ today
                if (!to || to < minEnd) patch.to = minEnd; // auto-bump end if needed
              }
              onChange(patch);
            }}
            min={getTodayDate()}
          />
        </label>

        <label className="logs-filter__field">
          <span className="logs-filter__label">To:</span>
          <input
            className="logs-filter__input"
            type="date"
            value={to}
            min={from ? getMinEndDate(from) : getTodayDate()} // end can't be before start+1 or before today
            onChange={(e) => {
              const picked = e.target.value;
              const minEnd = from ? getMinEndDate(from) : getTodayDate();
              onChange({ to: picked && picked < minEnd ? minEnd : picked });
            }}
          />
        </label>

        <button
          type="button"
          className="logs-filter__button logs-filter__button--ghost"
          onClick={() => onChange({ from: "", to: "" })}
        >
          Clear dates
        </button>
      </div>

      {/* Service type */}
      <div className="logs-filter__row">
        <label className="logs-filter__field">
          <span className="logs-filter__label">Service Type:</span>
          <select
            className="logs-filter__select"
            value={serviceType}
            onChange={(e) => onChange({ 
              serviceType: (e.target.value as ServiceType | "") 
            })}
          >
            <option value="">All</option>
            {serviceTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Field + value + order */}
      <div className="logs-filter__row">
        <label className="logs-filter__field">
          <span className="logs-filter__label">Field:</span>
          <select
            className="logs-filter__select"
            value={keySel}
            onChange={(e) =>
              onChange({ keySel: (e.target.value as keyof ServiceLog) || "" })
            }
          >
            <option value="">— None —</option>
            {FILTERABLE_KEYS.map((key) => (
              <option key={String(key)} value={String(key)}>
                {String(key)}
              </option>
            ))}
          </select>
        </label>

        <label className="logs-filter__field">
          <span className="logs-filter__label">Value:</span>
          <input
            className="logs-filter__input"
            type={inputType}
            value={val}
            onChange={(e) => onChange({ val: e.target.value })}
            placeholder={
              keySel
                ? inputType === "number"
                  ? "e.g. 12000"
                  : inputType === "date"
                    ? "e.g. 2025-09-02"
                    : "type to filter…"
                : "pick a field first"
            }
            disabled={!keySel}
          />
        </label>

        <button
          type="button"
          className="logs-filter__button"
          disabled={!canToggleOrder}
          onClick={() => onChange({ order: order === "asc" ? "desc" : "asc" })}
          title="Toggle sort order"
        >
          Order: {order.toUpperCase()}
        </button>

        <button
          type="button"
          className="logs-filter__button logs-filter__button--danger"
          onClick={onReset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}