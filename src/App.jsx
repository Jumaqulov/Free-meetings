import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MeetingPage from "./pages/MeetingPage";
function App() {
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path="/room/:roomId" element={<MeetingPage />} />
    </Routes>
  );
}

export default App;
