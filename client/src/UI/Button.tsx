import "./Button.css";

interface ButtonProps {
    className: string;
    onClick?: () => void;
    children?: React.ReactNode;
    disabled?: boolean;
}

export const Button = ({ className, onClick, children, disabled }: ButtonProps) => {
    return (
        <button className={`button ${className}`} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
};
