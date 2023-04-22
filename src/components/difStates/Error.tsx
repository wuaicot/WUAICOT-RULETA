import "./Error.css";

interface ErrorProps {
    error: string;
}

export const Error = (props: ErrorProps) => {
    const { error } = props;
    return (
        <div className="error-container">
            <h1>{error}</h1>
        </div>
    );
};
