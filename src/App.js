import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import VideoSyncPage from "./pages/VideoSyncPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/videosync" element={<VideoSyncPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
