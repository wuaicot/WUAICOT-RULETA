import "./Error.css";

export const Error = (props: any) => {
    const { error } = props;
    return (
        <div className="error-container">
            <h1>{error}</h1>
        </div>
    );
};
