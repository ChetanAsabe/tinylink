import { Header } from "../components/header";
import { TableComponent } from "../components/table";


export function Dashboard() {

    return (
        <div className="p-4 w-full flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-5xl">
                <div>
                    <Header />
                </div>

                <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <TableComponent />
                </div>
            </div>
        </div>
    );
}