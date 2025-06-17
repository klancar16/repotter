import { render, screen } from "@testing-library/react";
import Table from "../Table";
import type { PotType } from "../types";
import { describe, expect, test, vi } from "vitest";
import { useData } from "../context/data.ts";

// Sample test data
const mockData: PotType[] = [
    {
        id: "1",
        pot_size: 10,
        has_plant: true,
        size_increase: 2,
        needs_a_stick_size: 5,
        note: "Test note 1",
        retired: false,
    },
    {
        id: "2",
        pot_size: 15,
        has_plant: false,
        size_increase: 0,
        needs_a_stick_size: 0,
        note: "Test note 2",
        retired: true,
    },
];

// Mock the useData hook
vi.mock("../context/data.ts", () => ({
    useData: vi.fn(() => ({ data: mockData })),
}));

describe("Table Component", () => {
    test("renders table headers correctly", () => {
        render(<Table />);

        // Check that all expected headers are rendered
        expect(screen.getByText("id")).toBeInTheDocument();
        expect(screen.getByText("pot_size")).toBeInTheDocument();
        expect(screen.getByText("has_plant")).toBeInTheDocument();
        expect(screen.getByText("size_increase")).toBeInTheDocument();
        expect(screen.getByText("needs_a_stick_size")).toBeInTheDocument();
        expect(screen.getByText("note")).toBeInTheDocument();
        expect(screen.getByText("retired")).toBeInTheDocument();
    });

    test("renders table data correctly", () => {
        render(<Table />);

        // Check numeric values
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("15")).toBeInTheDocument();
        expect(screen.getAllByText("2")).toHaveLength(2);
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getAllByText("0")).toHaveLength(2); // There are two zeros

        // Check text values
        expect(screen.getByText("Test note 1")).toBeInTheDocument();
        expect(screen.getByText("Test note 2")).toBeInTheDocument();

        // Check boolean values (rendered as checkmarks/X marks)
        const yesMarks = screen.getAllByLabelText("Yes");
        const noMarks = screen.getAllByLabelText("No");
        expect(yesMarks).toHaveLength(2);
        expect(noMarks).toHaveLength(2);
    });

    test("handles empty data array", () => {
        // Override the mock for this specific test
        vi.mocked(useData).mockReturnValue({ data: [], setData: vi.fn(), isLoading: false, setIsLoading: vi.fn() });

        render(<Table />);

        // Check that the table is rendered but has no data rows
        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();

        // Only the header row should be rendered
        const rows = screen.queryAllByRole("row");
        expect(rows.length).toBeLessThanOrEqual(1);
    });

    test("handles null values in data", () => {
        // Create data with some null values
        const dataWithNulls = [
            {
                id: "3",
                pot_size: null as unknown as number,
                has_plant: true,
                size_increase: null as unknown as number,
                needs_a_stick_size: 5,
                note: null as unknown as string,
                retired: false,
            },
        ];

        // Override the mock for this specific test
        vi.mocked(useData).mockReturnValue({
            data: dataWithNulls,
            setData: vi.fn(),
            isLoading: false,
            setIsLoading: vi.fn(),
        });

        render(<Table />);

        // Table should still render without errors
        expect(screen.getByRole("table")).toBeInTheDocument();

        // Check that the row with the null values is rendered
        expect(screen.getByText("3")).toBeInTheDocument();

        // The null values should be rendered as empty cells
        const cells = screen.getAllByRole("cell");
        expect(cells.some((cell) => cell.textContent === "")).toBe(true);
    });
});
