import { render, screen, act } from "@testing-library/react";
import { DataProvider } from "../context/DataContext";
import { DataContext } from "../context/data";
import { vi, describe, expect, test } from "vitest";
import React from "react";

// Test component that uses the DataContext
const TestConsumer = () => {
    const { data, setData, isLoading, setIsLoading } = React.useContext(DataContext)!;

    return (
        <div>
            <div data-testid="data-length">{data.length}</div>
            <div data-testid="loading-state">{isLoading ? "Loading" : "Not Loading"}</div>
            <button
                data-testid="add-data-btn"
                onClick={() =>
                    setData([
                        {
                            id: "1",
                            pot_size: 10,
                            has_plant: true,
                            size_increase: 2,
                            needs_a_stick_size: 5,
                            note: "Test",
                            retired: false,
                        },
                    ])
                }
            >
                Add Data
            </button>
            <button data-testid="toggle-loading-btn" onClick={() => setIsLoading(!isLoading)}>
                Toggle Loading
            </button>
        </div>
    );
};

describe("DataContext", () => {
    test("provides initial empty data array", () => {
        render(
            <DataProvider>
                <TestConsumer />
            </DataProvider>,
        );

        expect(screen.getByTestId("data-length").textContent).toBe("0");
        expect(screen.getByTestId("loading-state").textContent).toBe("Not Loading");
    });

    test("allows setting data", () => {
        render(
            <DataProvider>
                <TestConsumer />
            </DataProvider>,
        );

        // Initial state
        expect(screen.getByTestId("data-length").textContent).toBe("0");

        // Update data
        act(() => {
            screen.getByTestId("add-data-btn").click();
        });

        // Verify data was updated
        expect(screen.getByTestId("data-length").textContent).toBe("1");
    });

    test("allows toggling loading state", () => {
        render(
            <DataProvider>
                <TestConsumer />
            </DataProvider>,
        );

        // Initial state
        expect(screen.getByTestId("loading-state").textContent).toBe("Not Loading");

        // Toggle loading state
        act(() => {
            screen.getByTestId("toggle-loading-btn").click();
        });

        // Verify loading state was updated
        expect(screen.getByTestId("loading-state").textContent).toBe("Loading");

        // Toggle back
        act(() => {
            screen.getByTestId("toggle-loading-btn").click();
        });

        // Verify loading state was updated again
        expect(screen.getByTestId("loading-state").textContent).toBe("Not Loading");
    });

    test("throws error when used outside provider", () => {
        // Mock console.error to prevent error output during test
        const originalConsoleError = console.error;
        console.error = vi.fn();

        // Expect error when rendering consumer without provider
        expect(() => {
            render(<TestConsumer />);
        }).toThrow();

        // Restore console.error
        console.error = originalConsoleError;
    });
});
