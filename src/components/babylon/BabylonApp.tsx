import { MainScene } from "./MainScene";
import "./BabylonApp.css";

interface BabylonAppProps {
    children?: React.ReactNode;
}
export const BabylonApp = (props: BabylonAppProps) => {
    const { children } = props;
    return (
        <div className="babylon-container">
            <MainScene>{children}</MainScene>
        </div>
    );
};
