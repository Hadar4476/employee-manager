import { useState, useRef, useEffect } from "react";
import { useEmployees } from "../hooks/useEmployees";
import EmployeeEditor from "./EmployeeEditor";
import DeleteConfirmation from "./DeleteConfirmation";
import { EmployeeStatus, type Employee } from "../types/employee";
import Modal from "./ui/Modal";

interface EmployeeCardProps {
  employee: Employee;
}

const statusConfig: Record<EmployeeStatus, { label: string; color: string }> = {
  [EmployeeStatus.WORKING]: { label: "Working", color: "bg-green-500" },
  [EmployeeStatus.ON_VACATION]: { label: "On Vacation", color: "bg-red-500" },
  [EmployeeStatus.LUNCH_TIME]: { label: "Lunch Time", color: "bg-yellow-500" },
  [EmployeeStatus.BUSINESS_TRIP]: {
    label: "Business Trip",
    color: "bg-purple-500",
  },
};

type ModalType = "edit" | "delete" | null;

const EmployeeCard = ({ employee }: EmployeeCardProps) => {
  const { deleteEmployee, isDeleting } = useEmployees();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleDelete = () => {
    deleteEmployee(employee.id, {
      onSuccess: () => setActiveModal(null),
    });
  };

  const { label, color } = statusConfig[employee.status];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-6 relative hover:shadow-blue-200 hover:shadow-lg transition-shadow duration-300 cursor-default">
        {/* Profile Picture */}
        <div className="shrink-0">
          {employee.profilePictureUrl ? (
            <img
              src={employee.profilePictureUrl}
              alt={employee.name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-3xl font-semibold">
              {employee.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-lg truncate">
            {employee.name}
          </p>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
            <span className="text-sm text-gray-500">{label}</span>
          </div>
        </div>

        {/* Menu */}
        <div className="absolute top-3 right-3" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ···
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-lg shadow-lg w-32 z-10 animate-slideUp">
              <button
                onClick={() => {
                  setActiveModal("edit");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setActiveModal("delete");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-b-lg transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeModal === "edit" && (
        <Modal onClose={() => setActiveModal(null)}>
          <EmployeeEditor
            employee={employee}
            onClose={() => setActiveModal(null)}
          />
        </Modal>
      )}

      {activeModal === "delete" && (
        <Modal onClose={() => setActiveModal(null)}>
          <DeleteConfirmation
            employeeName={employee.name}
            onConfirm={handleDelete}
            onCancel={() => setActiveModal(null)}
            isDeleting={isDeleting}
          />
        </Modal>
      )}
    </>
  );
};

export default EmployeeCard;
