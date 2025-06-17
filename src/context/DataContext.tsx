import React, { type ReactNode, useState } from "react";
import { DataContext, type DataContextType } from "../context/data.ts";
import type { PotType } from "../types";

interface DataProviderProps {
    children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const startingData: PotType[] = [];
    const [data, setData] = useState(startingData);
    const [isLoading, setIsLoading] = useState(false);

    const value: DataContextType = {
        data,
        setData,
        isLoading,
        setIsLoading,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
