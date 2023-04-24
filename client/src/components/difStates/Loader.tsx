import { PacmanLoader } from "react-spinners";
import "./Loader.css";

interface LoaderProps {
    loading: boolean;
}

export const Loader = (props: LoaderProps) => {
    const { loading } = props;

    return (
        <div className="loader-container">
            <PacmanLoader
                color={"#FFAD00"}
                loading={loading}
                size={150}
                aria-label="Loading Spinner"
            />
        </div>
    );
};
