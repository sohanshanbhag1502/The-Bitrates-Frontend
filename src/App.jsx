import { BrowserRouter, Routes, Route } from "react-router-dom";
import VideoSyncPage from "./pages/VideoSyncPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VideoSyncPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
