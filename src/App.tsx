import { DataProvider } from "@data/Context";
import AppRoutes from "@data/AppRoutes";

function App() {
  return (
    <DataProvider>
      <AppRoutes />
    </DataProvider>
  );
}

export default App;