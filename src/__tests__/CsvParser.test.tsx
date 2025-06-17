import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import CsvParser from "../CsvParser";
import Papa from "papaparse";
import { tableHeaders } from "../utils.ts";

// Mock Papa Parse
vi.mock("papaparse", () => ({
    default: {
        parse: vi.fn(),
    },
}));

// Mock context hooks to verify they're called with correct data
const mockSetData = vi.fn();
const mockSetStatus = vi.fn();
const mockSetIsLoading = vi.fn();

vi.mock("../context/data.ts", () => ({
    useData: () => ({
        setData: mockSetData,
        setIsLoading: mockSetIsLoading,
    }),
}));

vi.mock("../context/status.ts", () => ({
    useStatus: () => ({
        setStatus: mockSetStatus,
    }),
}));

describe("CsvParser Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renders file upload input", () => {
        render(<CsvParser />);

        const fileInput = screen.getByLabelText("Upload CSV File:");
        expect(fileInput).toBeInTheDocument();
        expect(fileInput).toHaveAttribute("type", "file");
        expect(fileInput).toHaveAttribute("accept", ".csv");
    });

    test("handles successful CSV parsing", () => {
        render(<CsvParser />);

        // Create a mock file
        const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
        const fileInput = screen.getByLabelText("Upload CSV File:");

        // Mock the Papa.parse implementation for this test
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        (Papa.parse as any).mockImplementation((_: any, options: any) => {
            const mockData = [
                {
                    id: "1",
                    pot_size: 10,
                    has_plant: true,
                    size_increase: 2,
                    needs_a_stick_size: 5,
                    note: "Test",
                    retired: false,
                },
            ];

            // Call the complete callback with mock results
            options.complete({
                data: mockData,
                meta: {
                    fields: tableHeaders,
                },
                errors: [],
            });
        });

        // Trigger file upload
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Verify Papa.parse was called
        expect(Papa.parse).toHaveBeenCalledWith(
            file,
            expect.objectContaining({
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
            }),
        );

        // Verify context updates
        expect(mockSetIsLoading).toBeCalledTimes(2);
        expect(mockSetIsLoading).toHaveBeenNthCalledWith(1, true);
        expect(mockSetIsLoading).toHaveBeenNthCalledWith(2, false);
        expect(mockSetData).toHaveBeenCalledWith(
            expect.arrayContaining([expect.objectContaining({ id: "1", pot_size: 10 })]),
        );
        expect(mockSetStatus).toHaveBeenCalledWith("Successfully read CSV");
    });

    test("handles CSV parsing error", () => {
        render(<CsvParser />);

        const file = new File(["invalid content"], "test.csv", { type: "text/csv" });
        const fileInput = screen.getByLabelText("Upload CSV File:");

        // Mock Papa.parse to trigger error callback
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        (Papa.parse as any).mockImplementation((_: any, options: any) => {
            options.error({ message: "Parse error" });
        });

        // Trigger file upload
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Verify error handling
        expect(mockSetStatus).toHaveBeenCalledWith("Error reading CSV Parse error");
    });

    test("does nothing when no file is selected", () => {
        render(<CsvParser />);

        const fileInput = screen.getByLabelText("Upload CSV File:");

        // Trigger change event with no files
        fireEvent.change(fileInput, { target: { files: [] } });

        // Verify Papa.parse was not called
        expect(Papa.parse).not.toHaveBeenCalled();
        expect(mockSetData).not.toHaveBeenCalled();
        expect(mockSetStatus).not.toHaveBeenCalled();
    });
});
