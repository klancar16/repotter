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
                    <td className="tag bg-green-500 text-white">
                        <span aria-label="Yes">&#10003;</span>
                    </td>
                );
            } else {
                return (
                    <td className="tag bg-red-500 text-white">
                        <span aria-label="No">&#9747;</span>
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
                <table aria-label="Data">
                    <caption className="sr-only">Pot information and attributes</caption>
                    <thead>
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
            )}
        </>
    );
};

export default Table;
