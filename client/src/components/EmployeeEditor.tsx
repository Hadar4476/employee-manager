import { useState, useRef } from "react";

import { useEmployees } from "../hooks/useEmployees";
import {
  EmployeeStatus,
  type EmployeeFormData,
  type Employee,
} from "../types/employee";

interface EmployeeEditorProps {
  onClose: () => void;
  employee?: Employee;
}

const statusOptions = [
  { value: EmployeeStatus.WORKING, label: "Working" },
  { value: EmployeeStatus.ON_VACATION, label: "On Vacation" },
  { value: EmployeeStatus.LUNCH_TIME, label: "Lunch Time" },
  { value: EmployeeStatus.BUSINESS_TRIP, label: "Business Trip" },
];

const EmployeeEditor = ({ onClose, employee }: EmployeeEditorProps) => {
  const {
    createEmployee,
    updateStatus,
    updateProfilePicture,
    isCreating,
    isUpdatingStatus,
    isUpdatingProfilePicture,
  } = useEmployees();
  const isEditMode = !!employee;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<EmployeeFormData>({
    name: employee?.name ?? "",
    status: employee?.status ?? EmployeeStatus.WORKING,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    employee?.profilePictureUrl ?? null,
  );
  const [errors, setErrors] = useState<Partial<EmployeeFormData>>({});

  const validate = (): boolean => {
    const newErrors: Partial<EmployeeFormData> = {};
    if (!isEditMode) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      } else if (formData.name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (isEditMode) {
      updateStatus(
        { id: employee.id, status: formData.status },
        {
          onSuccess: () => {
            if (selectedFile) {
              updateProfilePicture(
                { id: employee.id, file: selectedFile },
                { onSuccess: onClose },
              );
            } else {
              onClose();
            }
          },
        },
      );
    } else {
      createEmployee(
        {
          payload: { name: formData.name.trim(), status: formData.status },
          file: selectedFile ?? undefined,
        },
        { onSuccess: onClose },
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const isPending = isCreating || isUpdatingStatus || isUpdatingProfilePicture;

  return (
    <div onKeyDown={handleKeyDown}>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {isEditMode ? `Edit ${employee.name}` : "Create New Employee"}
      </h2>

      {/* Profile Picture Upload - both modes */}
      <div className="flex flex-col items-center mb-6 gap-1">
        <div
          className="relative cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition">
              <span className="text-2xl">+</span>
              <span className="text-xs">Photo</span>
            </div>
          )}
          {previewUrl && (
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            >
              <span className="text-white text-xs">Change</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <p className="text-xs text-gray-400">
          Max file size: 5MB. JPG, PNG, WEBP, GIF accepted.
        </p>
      </div>

      {/* Name Field - create mode only */}
      {!isEditMode && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. John Doe"
            autoFocus
            className={`w-full border-b pb-2 text-sm outline-none focus:border-blue-500 transition ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>
      )}

      {/* Status Field */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Status
        </label>
        <select
          value={formData.status}
          autoFocus={isEditMode}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value as EmployeeStatus,
            })
          }
          className="w-full border-b border-gray-300 pb-2 text-sm outline-none focus:border-blue-500 transition cursor-pointer"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="px-4 py-2 text-sm bg-sky-400 hover:bg-sky-500 text-white rounded-lg disabled:opacity-50 transition cursor-pointer"
        >
          {isPending ? "Saving..." : isEditMode ? "Save" : "Create"}
        </button>
        <button
          onClick={onClose}
          disabled={isPending}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EmployeeEditor;
