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

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      file,
    }: {
      id: string;
      status: EmployeeStatus;
      file?: File;
    }) => employeesApi.update(id, status, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_QUERY_KEY });
      toast.success("Employee updated successfully");
    },
    onError: () => {
      toast.error("Failed to update employee");
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
    updateEmployee: updateMutation.mutate,
    deleteEmployee: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
