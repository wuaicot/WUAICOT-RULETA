import React, { forwardRef } from "react";
import "./Button.css";

interface ButtonProps {
    className: string;
    onClick?: () => void;
    children?: React.ReactNode;
    disabled?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, onClick, children, disabled }, ref) => {
    return (
        <button ref={ref} className={`button ${className}`} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
});
