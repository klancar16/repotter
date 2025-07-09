import { useStatus } from "./context/status.ts";
import React from "react";

const StatusBar: React.FC = () => {
    const { status } = useStatus();

    return (
        <div className="status-bar" role="alert">
            <span className="sr-only">Info</span>
            <div>
                <span className="font-bold">Status:</span> {status}
            </div>
        </div>
    );
};

export default StatusBar;
