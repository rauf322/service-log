import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  loadServiceLogsFromDB,
  addServiceLogToDB,
  updateServiceLogInDB,
  deleteServiceLogFromDB,
} from "../utils/indexedDb";

export const useSavedLogs = () => {
  return useQuery({
    queryKey: ["serviceLogs"],
    queryFn: loadServiceLogsFromDB,
  });
};

export const useAddServiceLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addServiceLogToDB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceLogs"] });
    },
  });
};

export const useUpdateServiceLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateServiceLogInDB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceLogs"] });
    },
  });
};

export const useDeleteServiceLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteServiceLogFromDB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceLogs"] });
    },
  });
};
