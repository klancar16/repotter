import React, { type ChangeEvent, useState } from "react";
import Papa from "papaparse";
import { useData } from "./context/data.ts";
import type { PotType } from "./types";
import { useStatus } from "./context/status.ts";
import { tableHeaders } from "./utils.ts";
import { CloseIcon, FileIcon } from "./assets/Icons.tsx";

const CsvParser: React.FC = () => {
    const [fileName, setFileName] = useState<string | null>(null);
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
                setFileName(fileContent.name);
            },
            error: (error) => {
                setStatus(`Error reading CSV ${error.message}`);
            },
        });
    };

    const handleClear = () => {
        setData([]);
        setFileName(null);
        setStatus("Successfully cleared input.");
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100">Get Started</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Upload your CSV file to begin planning.</p>
            {!fileName ? (
                <div className="file-upload-box">
                    <div className="space-y-1 text-center">
                        <div className="flex text-sm text-gray-600 dark:text-gray-300 justify-center">
                            <label htmlFor="file-upload" className="file-upload">
                                <span>Upload a file</span>
                                <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    onChange={parseCsvFile}
                                    accept=".csv"
                                />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">CSV up to 10MB</p>
                    </div>
                </div>
            ) : (
                <div className="mt-4">
                    <div className="flex items-center justify-between bg-green-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <FileIcon />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{fileName}</span>
                        </div>
                        <button onClick={handleClear} className="clear-input-file">
                            <CloseIcon />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CsvParser;
