import Table from "./Table.tsx";

import CsvParser from "./CsvParser.tsx";
import { DataProvider } from "./context/DataContext.tsx";
import { StatusProvider } from "./context/StatusContext.tsx";
import StatusBar from "./StatusBar.tsx";
import ResultOutput from "./ResultOutput.tsx";

function App() {
    return (
        <>
            <h1>Repotter</h1>
            <StatusProvider>
                <StatusBar />
                <DataProvider>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="md:col-span-1">
                            <CsvParser />
                        </div>
                        <div className="md:col-span-2">
                            <ResultOutput />
                        </div>
                    </div>
                    <div className="tableContainer">
                        <Table />
                    </div>
                </DataProvider>
            </StatusProvider>
        </>
    );
}

export default App;
