import ServiceLogForm from "./components/ServiceLogForm/ServiceLogForm";
import DraftManager from "./components/DraftManager/DraftManager";
import SavedLogs from "./components/SavedLogs/SavedLogs.tsx";

function App() {
  return (
    <div className="app-container">
      <ServiceLogForm />
      <SavedLogs />
      <DraftManager />
    </div>
  );
}

export default App;
