import { ServiceLog, ServiceType } from "@/types/serviceLog";
import { useSelector, useDispatch } from "react-redux";
import {
  updateFormField,
  clearForm,
} from "@/store/features/serviceForm/index.ts";
import {
  saveDraftToStorage,
  loadDraftsFromStorage,
} from "@/store/features/drafts/index.ts";
import { RootState, AppDispatch } from "@/store/index.ts";
import { useAddServiceLog, useUpdateServiceLog, useSavedLogs } from "@/hooks/useServiceLogs";
import { getTodayDate, getMinEndDate } from "@/utils/dateUtils";
import { useEffect, useCallback, useState } from "react";
import Toast, { ToastType } from "@/components/Toast/Toast";
import { useSearch, useNavigate } from "@tanstack/react-router";
import "./ServiceLogForm.css";

function ServiceLogForm() {
  const formData = useSelector(
    (state: RootState) => state.serviceForm.currentForm,
  );
  const draftState = useSelector((state: RootState) => state.drafts);
  const dispatch = useDispatch<AppDispatch>();
  const addLogMutation = useAddServiceLog();
  const updateLogMutation = useUpdateServiceLog();
  const { data: savedLogs } = useSavedLogs();
  const navigate = useNavigate();
  
  // Get edit parameter from URL
  const { edit: editId } = useSearch({ from: '/' });
  
  // Determine if we're in edit mode
  const isEditMode = !!editId;
  const editingLog = isEditMode && savedLogs 
    ? savedLogs.find(log => log.id?.toString() === editId)
    : null;

  // Draft dialog state
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftName, setDraftName] = useState("");

  // Toast state
  type ToastData = { id: string; message: string; type: ToastType };
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleFieldChange = useCallback(
    (field: keyof ServiceLog, value: string | number) => {
      dispatch(updateFormField({ field, value }));
    },
    [dispatch],
  );

  const handleStartDateChange = (value: string) => {
    handleFieldChange("startDate", value);
    const newMinEndDate = getMinEndDate(value);
    if (formData.endDate && formData.endDate < newMinEndDate) {
      handleFieldChange("endDate", newMinEndDate);
    } else if (!formData.endDate) {
      // Set default end date if empty
      handleFieldChange("endDate", newMinEndDate);
    }
  };

  // Calculate minimum end date based on current start date
  const minEndDate = getMinEndDate(formData.startDate);

  // Set default end date when start date is available but end date is empty
  useEffect(() => {
    if (formData.startDate && !formData.endDate) {
      const defaultEndDate = getMinEndDate(formData.startDate);
      handleFieldChange("endDate", defaultEndDate);
    }
  }, [formData.startDate, formData.endDate, handleFieldChange]);

  // Load drafts on component mount
  useEffect(() => {
    dispatch(loadDraftsFromStorage());
  }, [dispatch]);

  // Populate form when in edit mode
  useEffect(() => {
    if (isEditMode && editingLog) {
      // Populate form with existing log data
      Object.entries(editingLog).forEach(([key, value]) => {
        if (key !== 'id') {
          dispatch(updateFormField({ field: key as keyof ServiceLog, value }));
        }
      });
    }
  }, [isEditMode, editingLog, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditMode && editingLog) {
      // Update existing log
      const updatedLog = { ...formData, id: editingLog.id };
      updateLogMutation.mutate(updatedLog, {
        onSuccess: () => {
          dispatch(clearForm());
          showToast("Service log updated successfully!", "success");
          navigate({ to: '/saved' });
        },
        onError: (error) => {
          showToast(`Failed to update service log: ${error.message}`, "error");
        },
      });
    } else {
      // Create new log
      addLogMutation.mutate(formData, {
        onSuccess: () => {
          dispatch(clearForm());
          showToast("Service log submitted successfully!", "success");
        },
        onError: (error) => {
          showToast(`Failed to submit service log: ${error.message}`, "error");
        },
      });
    }
  };

  const handleClear = () => {
    dispatch(clearForm());
  };

  const handleSaveAsDraft = () => {
    setShowDraftDialog(true);
  };

  const handleConfirmSaveDraft = () => {
    if (draftName.trim()) {
      dispatch(saveDraftToStorage({ title: draftName.trim(), formData }));
      setShowDraftDialog(false);
      setDraftName("");
      showToast("Draft saved successfully!", "success");
    }
  };

  const handleCancelSaveDraft = () => {
    setShowDraftDialog(false);
    setDraftName("");
  };

  const handleCancelEdit = () => {
    dispatch(clearForm());
    navigate({ to: '/saved' });
  };

  return (
    <div>
      <h1 className="service-form__title">
        {isEditMode ? "Edit Service Log" : "Service Log Form"}
      </h1>
      <form className="service-form" onSubmit={handleSubmit}>
        <div className="service-form__row">
          <div className="service-form__group">
            <label className="service-form__label" htmlFor="providerId">
              Provider ID:
            </label>
            <input
              className="service-form__input"
              type="text"
              id="providerId"
              value={formData.providerId}
              onChange={(e) => handleFieldChange("providerId", e.target.value)}
              required
            />
          </div>

          <div className="service-form__group">
            <label className="service-form__label" htmlFor="serviceOrder">
              Service Order:
            </label>
            <input
              className="service-form__input"
              type="text"
              id="serviceOrder"
              value={formData.serviceOrder}
              onChange={(e) =>
                handleFieldChange("serviceOrder", e.target.value)
              }
              required
            />
          </div>
        </div>

        <div className="service-form__group">
          <label className="service-form__label" htmlFor="carId">
            Car ID:
          </label>
          <input
            className="service-form__input"
            type="text"
            id="carId"
            value={formData.carId}
            onChange={(e) => handleFieldChange("carId", e.target.value)}
            required
          />
        </div>

        <div className="service-form__row">
          <div className="service-form__group">
            <label className="service-form__label" htmlFor="odometer">
              Odometer (mi):
            </label>
            <input
              className="service-form__input"
              type="number"
              id="odometer"
              value={formData.odometer}
              onChange={(e) =>
                handleFieldChange("odometer", parseInt(e.target.value) || 0)
              }
              min="0"
              required
            />
          </div>

          <div className="service-form__group">
            <label className="service-form__label" htmlFor="engineHours">
              Engine Hours:
            </label>
            <input
              className="service-form__input"
              type="number"
              id="engineHours"
              value={formData.engineHours}
              onChange={(e) =>
                handleFieldChange("engineHours", parseInt(e.target.value) || 0)
              }
              min="0"
              required
            />
          </div>
        </div>

        <div className="service-form__row">
          <div className="service-form__group">
            <label className="service-form__label" htmlFor="startDate">
              Start Date:
            </label>
            <input
              className="service-form__input"
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              min={getTodayDate()}
              required
            />
          </div>

          <div className="service-form__group">
            <label className="service-form__label" htmlFor="endDate">
              End Date:
            </label>
            <input
              className="service-form__input"
              type="date"
              id="endDate"
              value={formData.endDate}
              onChange={(e) => handleFieldChange("endDate", e.target.value)}
              min={minEndDate}
              required
            />
          </div>
        </div>

        <div className="service-form__group">
          <label className="service-form__label" htmlFor="type">
            Service Type:
          </label>
          <select
            className="service-form__select"
            id="type"
            value={formData.type}
            onChange={(e) => handleFieldChange("type", e.target.value)}
            required
          >
            <option value={ServiceType.PLANNED}>Planned</option>
            <option value={ServiceType.UNPLANNED}>Unplanned</option>
            <option value={ServiceType.EMERGENCY}>Emergency</option>
          </select>
        </div>

        <div className="service-form__group">
          <label className="service-form__label" htmlFor="serviceDescription">
            Service Description:
          </label>
          <textarea
            className="service-form__textarea"
            id="serviceDescription"
            value={formData.serviceDescription}
            onChange={(e) =>
              handleFieldChange("serviceDescription", e.target.value)
            }
            rows={4}
            required
          />
        </div>

        <div className="service-form__buttons">
          <button
            type="submit"
            className="service-form__button service-form__button--primary"
            disabled={isEditMode ? updateLogMutation.isPending : addLogMutation.isPending}
          >
            {isEditMode
              ? updateLogMutation.isPending
                ? "Updating..."
                : "Update Service Log"
              : addLogMutation.isPending
              ? "Submitting..."
              : "Submit Service Log"}
          </button>
          {isEditMode ? (
            <button
              type="button"
              className="service-form__button service-form__button--secondary"
              onClick={handleCancelEdit}
            >
              Cancel Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                className="service-form__button service-form__button--draft"
                onClick={handleSaveAsDraft}
              >
                Save as Draft
              </button>
              <button
                type="button"
                className="service-form__button service-form__button--secondary"
                onClick={handleClear}
              >
                Clear Form
              </button>
            </>
          )}
        </div>
      </form>

      {showDraftDialog && (
        <div className="draft-dialog">
          <div className="draft-dialog__content">
            <h3 className="draft-dialog__title">Save as Draft</h3>
            <input
              className="draft-dialog__input"
              type="text"
              placeholder="Enter draft name..."
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              autoFocus
            />
            <div className="draft-dialog__buttons">
              <button
                className="draft-dialog__button draft-dialog__button--primary"
                onClick={handleConfirmSaveDraft}
                disabled={!draftName.trim()}
              >
                Save Draft
              </button>
              <button
                className="draft-dialog__button draft-dialog__button--secondary"
                onClick={handleCancelSaveDraft}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {draftState.isLoading && (
        <div className="service-form__loading">Loading drafts...</div>
      )}
      {draftState.error && (
        <div className="service-form__error">Error: {draftState.error}</div>
      )}

      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default ServiceLogForm;