import { useEmployees } from "../hooks/useEmployees";
import EmployeeCard from "./EmployeeCard";
import LoadingSpinner from "./LoadingSpinner";

const EmployeeGrid = () => {
  const { employees, isLoading, isError } = useEmployees();

  if (isLoading) return <LoadingSpinner />;

  if (isError)
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-red-500 text-lg">
          Failed to load employees. Please try again.
        </p>
      </div>
    );

  if (employees.length === 0)
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-400 text-lg">No employees found. Create one!</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
};

export default EmployeeGrid;
