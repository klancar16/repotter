import React, { type ReactNode, useState } from "react";
import { StatusContext, type StatusContextType } from "../context/status.ts";

interface StatusProviderProps {
    children: ReactNode;
}

export const StatusProvider: React.FC<StatusProviderProps> = ({ children }) => {
    const startingStatus: string = "No status";
    const [status, setStatus] = useState(startingStatus);

    const value: StatusContextType = {
        status,
        setStatus,
    };

    return <StatusContext.Provider value={value}>{children}</StatusContext.Provider>;
};
