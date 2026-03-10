import axiosInstance from "./axiosInstance";
import type {
  EmployeeFormData,
  Employee,
  EmployeeStatus,
} from "../types/employee";

export const employeesApi = {
  getAll: async (): Promise<Employee[]> => {
    const { data } = await axiosInstance.get("/employees");
    return data;
  },

  create: async (payload: EmployeeFormData, file?: File): Promise<Employee> => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("status", payload.status);
    if (file) {
      formData.append("file", file);
    }
    const { data } = await axiosInstance.post("/employees", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  update: async (
    id: string,
    status: EmployeeStatus,
    file?: File,
  ): Promise<Employee> => {
    const formData = new FormData();
    formData.append("status", status);
    if (file) {
      formData.append("file", file);
    }
    const { data } = await axiosInstance.patch(`/employees/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/employees/${id}`);
  },
};
