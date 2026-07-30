import { createPortal } from "react-dom";
import { ReactNode } from "react";

interface PrintOverlayProps {
    children: ReactNode;
}

export function PrintOverlay({ children }: PrintOverlayProps) {
    return createPortal(
        <div className="hidden print-overlay-container bg-white text-black">{children}</div>,
        document.body
    );
}
