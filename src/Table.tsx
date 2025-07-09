import { useData } from "./context/data.ts";
import type { PotType } from "./types";
import { tableHeaders } from "./utils.ts";
import React from "react";

const Table: React.FC = () => {
    const { data, isLoading } = useData();

    const handleTableRowCell = (value: string | boolean | number): React.JSX.Element => {
        if (typeof value === "boolean") {
            if (value) {
                return (
                    <td className="tag">
                        <span aria-label="Yes" className="yes">
                            Yes
                        </span>
                    </td>
                );
            } else {
                return (
                    <td className="tag">
                        <span aria-label="No" className="no">
                            No
                        </span>
                    </td>
                );
            }
        }
        return <td>{value}</td>;
    };

    return (
        <>
            {isLoading ? (
                <div className="flex justify-center p-4">
                    {/* Show spinner while the data is loading */}
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Data Source</h2>
                    <div className="overflow-x-auto">
                        <table aria-label="Data">
                            <caption className="sr-only">Pot information and attributes</caption>
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {tableHeaders.map((header) => {
                                        return (
                                            <th scope="col" key={header}>
                                                {header}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {data
                                    .filter((value) => value)
                                    .map((value) => {
                                        return (
                                            <tr className="border odd:bg-white even:bg-gray-100" key={value.id}>
                                                {tableHeaders.map((header) =>
                                                    handleTableRowCell(value[header as keyof PotType]),
                                                )}
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};

export default Table;
