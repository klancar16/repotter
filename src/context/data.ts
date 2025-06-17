import { createContext, useContext } from "react";
import type { PotType } from "../types";

export interface DataContextType {
    data: PotType[];
    setData: (data: PotType[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};
