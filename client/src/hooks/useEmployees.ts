import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { employeesApi } from "../api/employees";
import type { EmployeeFormData, EmployeeStatus } from "../types/employee";

const EMPLOYEES_QUERY_KEY = ["employees"];

export const useEmployees = () => {
  const queryClient = useQueryClient();

  const {
    data: employees = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: EMPLOYEES_QUERY_KEY,
    queryFn: employeesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: ({
      payload,
      file,
    }: {
      payload: EmployeeFormData;
      file?: File;
    }) => employeesApi.create(payload, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      toast.success("Employee created successfully");
    },
    onError: () => {
      toast.error("Failed to create employee");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EmployeeStatus }) =>
      employeesApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      toast.success("Status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const updateProfilePictureMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      employeesApi.updateProfilePicture(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      toast.success("Profile picture updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile picture");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: employeesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      toast.success("Employee deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete employee");
    },
  });

  return {
    employees,
    isLoading,
    isError,
    createEmployee: createMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    updateProfilePicture: updateProfilePictureMutation.mutate,
    deleteEmployee: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isUpdatingProfilePicture: updateProfilePictureMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
