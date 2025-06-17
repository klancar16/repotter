import { render, screen } from "@testing-library/react";
import StatusBar from "../StatusBar";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useStatus } from "../context/status.ts";

// Mock the useStatus hook
vi.mock("../context/status.ts", () => ({
    useStatus: vi.fn(),
}));

describe("StatusBar Component", () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.resetAllMocks();
    });

    test("renders status message correctly", () => {
        // Setup mock to return a specific status
        vi.mocked(useStatus).mockReturnValue({
            status: "Test status message",
            setStatus: vi.fn(),
        });

        render(<StatusBar />);

        // Check that the status message is displayed
        expect(screen.getByText("Status:")).toBeInTheDocument();
        expect(screen.getByText("Test status message")).toBeInTheDocument();
    });

    test("renders default status message", () => {
        // Setup mock to return the default status
        vi.mocked(useStatus).mockReturnValue({
            status: "No status",
            setStatus: vi.fn(),
        });

        render(<StatusBar />);

        // Check that the default status message is displayed
        expect(screen.getByText("No status")).toBeInTheDocument();
    });

    test("renders error status message", () => {
        // Setup mock to return an error status
        vi.mocked(useStatus).mockReturnValue({
            status: "Error reading CSV Invalid format",

            setStatus: vi.fn(),
        });

        render(<StatusBar />);

        // Check that the error status message is displayed
        expect(screen.getByText("Error reading CSV Invalid format")).toBeInTheDocument();
    });

    test("has correct accessibility attributes", () => {
        vi.mocked(useStatus).mockReturnValue({
            status: "Test status",

            setStatus: vi.fn(),
        });

        render(<StatusBar />);

        // Check that the status bar has the correct role
        const alert = screen.getByRole("alert");
        expect(alert).toBeInTheDocument();

        // Check for screen reader only content
        const srOnly = screen.getByText("Info");
        expect(srOnly).toHaveClass("sr-only");
    });
});
