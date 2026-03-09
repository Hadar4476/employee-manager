import { useEffect } from "react";
import { createPortal } from "react-dom";

interface BackdropProps {
  onClick: () => void;
}

const Backdrop = ({ onClick }: BackdropProps) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-30 z-40 animate-fadeIn"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      onClick={onClick}
    />,
    document.body,
  );
};

export default Backdrop;
