import Table from "./Table.tsx";

import CsvParser from "./CsvParser.tsx";
import { DataProvider } from "./context/DataContext.tsx";
import { StatusProvider } from "./context/StatusContext.tsx";
import StatusBar from "./StatusBar.tsx";
import ResultOutput from "./ResultOutput.tsx";
import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./assets/Icons.tsx";

interface HeaderProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const Header = ({ isDarkMode, toggleDarkMode }: HeaderProps) => (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Harry Repotter</h1>
            </div>
            <button onClick={toggleDarkMode} className="toggle-dark-mode">
                {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
        </div>
    </header>
);

function App() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setIsDarkMode(true);
        }
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    return (
        <>
            <div className="bg-green-50 dark:bg-gray-900 font-sans text-gray-800 min-h-screen">
                <Header isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
                <StatusProvider>
                    <DataProvider>
                        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                <div className="lg:col-span-1 space-y-8">
                                    <StatusBar />
                                    <CsvParser />
                                </div>
                                <div className="lg:col-span-2 space-y-8">
                                    <ResultOutput />
                                    <Table />
                                </div>
                            </div>
                        </main>
                    </DataProvider>
                </StatusProvider>
            </div>
        </>
    );
}

export default App;
