interface DeleteConfirmationProps {
  employeeName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmation = ({
  employeeName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmationProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Delete Employee
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-gray-800">{employeeName}</span>?
        This action cannot be undone.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 transition cursor-pointer"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
