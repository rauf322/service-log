import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ServiceLog, ServiceType } from "@/types/serviceLog";
import { saveToLocalStorage, loadFromLocalStorage } from "@/utils/localStorage";
import { getTodayDate } from "@/utils/dateUtils";

export type ServiceFormState = {
  currentForm: ServiceLog;
  isSubmitting: boolean;
};

const getInitialFormData = (): ServiceLog => {
  const savedForm = loadFromLocalStorage("serviceLogForm");
  return (
    savedForm || {
      providerId: "",
      serviceOrder: "",
      carId: "",
      odometer: 0,
      engineHours: 0,
      startDate: getTodayDate(),
      endDate: "",
      type: ServiceType.PLANNED,
      serviceDescription: "",
    }
  );
};

const initialState: ServiceFormState = {
  currentForm: getInitialFormData(),
  isSubmitting: false,
};

export const serviceFormSlice = createSlice({
  name: "serviceForm",
  initialState,
  reducers: {
    updateFormField: (
      state,
      action: PayloadAction<{
        field: keyof ServiceLog;
        value: string | number | ServiceType;
      }>,
    ) => {
      const { field, value } = action.payload;

      if (
        field === "providerId" ||
        field === "serviceOrder" ||
        field === "carId" ||
        field === "startDate" ||
        field === "endDate" ||
        field === "serviceDescription"
      ) {
        state.currentForm[field] = value as string;
      } else if (field === "odometer" || field === "engineHours") {
        state.currentForm[field] = value as number;
      } else if (field === "type") {
        state.currentForm[field] = value as ServiceType;
      }

      saveToLocalStorage("serviceLogForm", state.currentForm);
    },

    clearForm: (state) => {
      const emptyForm = {
        providerId: "",
        serviceOrder: "",
        carId: "",
        odometer: 0,
        engineHours: 0,
        startDate: getTodayDate(),
        endDate: "",
        type: ServiceType.PLANNED,
        serviceDescription: "",
      };
      state.currentForm = emptyForm;
      localStorage.removeItem("serviceLogForm");
    },

    setIsSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },

    // Action to load draft data into current form (called from draft feature)
    loadFormData: (state, action: PayloadAction<ServiceLog>) => {
      state.currentForm = action.payload;
      localStorage.removeItem("serviceLogForm"); // Clear auto-save when loading draft
    },
  },
});

export const { updateFormField, clearForm, setIsSubmitting, loadFormData } =
  serviceFormSlice.actions;
export default serviceFormSlice.reducer;
