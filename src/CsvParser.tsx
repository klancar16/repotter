import React, { type ChangeEvent } from "react";
import Papa from "papaparse";
import { useData } from "./context/data.ts";
import type { PotType } from "./types";
import { useStatus } from "./context/status.ts";
import { tableHeaders } from "./utils.ts";

const CsvParser: React.FC = () => {
    const { setData, setIsLoading } = useData();
    const { setStatus } = useStatus();

    const parseCsvFile = (event: ChangeEvent<HTMLInputElement>): void => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        // set isLoading to true when processing the file, so the spinner can be shown
        setIsLoading(true);

        const fileContent = event.target.files[0];

        Papa.parse<PotType>(fileContent, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: function (results: Papa.ParseResult<PotType>) {
                setIsLoading(false);

                // check that the correct headers are present in the csv file
                const missingFields = tableHeaders.filter((field) => !results.meta.fields?.includes(field));
                if (missingFields.length > 0) {
                    setStatus(`CSV missing required fields: ${missingFields.join(", ")}`);
                    return;
                }

                setData(results.data);
                setStatus("Successfully read CSV");
            },
            error: (error) => {
                setStatus(`Error reading CSV ${error.message}`);
            },
        });
    };

    return (
        <div className="flex flex-row gap-3 me-4 py-4">
            <label htmlFor="csv-upload" className="text-sm font-medium text-gray-700">
                Upload CSV File:
            </label>
            <input
                id="csv-upload"
                type="file"
                name="file-input"
                accept=".csv"
                onChange={parseCsvFile}
                className="file:bg-gray-50 border-0"
            />
        </div>
    );
};

export default CsvParser;
