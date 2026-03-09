import { useState } from "react";
import EmployeeGrid from "./components/EmployeeGrid";
import EmployeeEditor from "./components/EmployeeEditor";
import Modal from "./components/ui/Modal";

const App = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => setIsEditorOpen(true)}
          className="flex items-center gap-2 bg-sky-400 hover:bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
        >
          Create <span className="text-lg leading-none">+</span>
        </button>
      </div>

      {/* Employee Grid */}
      <EmployeeGrid />

      {/* Create Employee Modal */}
      {isEditorOpen && (
        <Modal onClose={() => setIsEditorOpen(false)}>
          <EmployeeEditor onClose={() => setIsEditorOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default App;
