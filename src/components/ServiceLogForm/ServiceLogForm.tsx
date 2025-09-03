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

  // Validation state and local input values
  const [validationErrors, setValidationErrors] = useState<{
    odometer?: string;
    engineHours?: string;
  }>({});
  
  const [inputValues, setInputValues] = useState<{
    odometer: string;
    engineHours: string;
  }>({
    odometer: formData.odometer.toString(),
    engineHours: formData.engineHours.toString(),
  });

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Validation functions
  const isValidPositiveNumber = (value: string): boolean => {
    if (value === "") return false;
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  };

  const validateNumericField = (field: 'odometer' | 'engineHours', value: string) => {
    const errors = { ...validationErrors };
    
    if (value === "") {
      errors[field] = "This field is required";
    } else if (!isValidPositiveNumber(value)) {
      errors[field] = "Must be a positive number";
    } else {
      delete errors[field];
    }
    
    setValidationErrors(errors);
    return !errors[field];
  };

  const handleFieldChange = useCallback(
    (field: keyof ServiceLog, value: string | number) => {
      dispatch(updateFormField({ field, value }));
    },
    [dispatch],
  );

  const handleNumericFieldChange = (field: 'odometer' | 'engineHours', value: string) => {
    // Update local input value immediately
    setInputValues(prev => ({ ...prev, [field]: value }));
    
    // Validate and update store if valid
    const isValid = validateNumericField(field, value);
    if (isValid) {
      const numericValue = parseFloat(value);
      dispatch(updateFormField({ field, value: numericValue }));
    }
  };

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

  // Sync input values with form data changes (for draft loading, editing, etc.)
  useEffect(() => {
    setInputValues({
      odometer: formData.odometer.toString(),
      engineHours: formData.engineHours.toString(),
    });
  }, [formData.odometer, formData.engineHours]);

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
    
    // Validate numeric fields before submission
    const hasOdometerError = !isValidPositiveNumber(inputValues.odometer);
    const hasEngineHoursError = !isValidPositiveNumber(inputValues.engineHours);
    
    if (hasOdometerError || hasEngineHoursError) {
      const errors: { odometer?: string; engineHours?: string } = {};
      if (hasOdometerError) errors.odometer = "Must be a positive number";
      if (hasEngineHoursError) errors.engineHours = "Must be a positive number";
      setValidationErrors(errors);
      showToast("Please fix validation errors before submitting", "error");
      return;
    }
    
    // Ensure numeric values are up to date in store
    const odometerValue = parseFloat(inputValues.odometer);
    const engineHoursValue = parseFloat(inputValues.engineHours);
    dispatch(updateFormField({ field: "odometer", value: odometerValue }));
    dispatch(updateFormField({ field: "engineHours", value: engineHoursValue }));
    
    // Use updated form data with correct numeric values
    const submissionData = {
      ...formData,
      odometer: odometerValue,
      engineHours: engineHoursValue,
    };
    
    if (isEditMode && editingLog) {
      // Update existing log
      const updatedLog = { ...submissionData, id: editingLog.id };
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
      addLogMutation.mutate(submissionData, {
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
              className={`service-form__input ${validationErrors.odometer ? 'service-form__input--error' : ''}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*\.?[0-9]*"
              id="odometer"
              value={inputValues.odometer}
              onChange={(e) =>
                handleNumericFieldChange("odometer", e.target.value)
              }
              required
            />
            {validationErrors.odometer && (
              <span className="service-form__error-text">{validationErrors.odometer}</span>
            )}
          </div>

          <div className="service-form__group">
            <label className="service-form__label" htmlFor="engineHours">
              Engine Hours:
            </label>
            <input
              className={`service-form__input ${validationErrors.engineHours ? 'service-form__input--error' : ''}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*\.?[0-9]*"
              id="engineHours"
              value={inputValues.engineHours}
              onChange={(e) =>
                handleNumericFieldChange("engineHours", e.target.value)
              }
              required
            />
            {validationErrors.engineHours && (
              <span className="service-form__error-text">{validationErrors.engineHours}</span>
            )}
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