import { createContext, useContext } from "react";

export interface StatusContextType {
    status: string;
    setStatus: (status: string) => void;
}

export const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const useStatus = () => {
    const context = useContext(StatusContext);
    if (context === undefined) {
        throw new Error("useStatus must be used within a StatusProvider");
    }
    return context;
};
