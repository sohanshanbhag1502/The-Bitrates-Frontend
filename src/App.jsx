import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import VideoSyncPage from "./pages/VideoSyncPage";
import SignupPage from "./pages/SignupPage";   // ← add this

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VideoSyncPage />} />
        <Route path="/videosync" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />  {/* ← add route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
