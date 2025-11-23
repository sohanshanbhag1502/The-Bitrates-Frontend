import React, { useState, useRef } from "react";
import "./VideoSyncPage.css";

export default function VideoSyncPage() {
  const [activeTab, setActiveTab] = useState("file"); // "file" or "url"
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  const handleSubmit = async () => {
    if (activeTab === "file" && !file) {
      alert("Please upload a video file.");
      return;
    }

    if (activeTab === "url" && !videoUrl.trim()) {
      alert("Please enter a valid video URL.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let uploadResponse;

      if (activeTab === "file") {
        const formData = new FormData();
        formData.append("video", file);

        uploadResponse = await fetch("http://localhost:8000/upload", {
          method: "POST",
          body: formData,
        });
      } else {
        uploadResponse = await fetch("http://localhost:8000/upload_url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: videoUrl }),
        });
      }

      const uploadData = await uploadResponse.json();
      const taskId = uploadData.task_id;

      const resultResponse = await fetch("http://localhost:8000/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId }),
      });

      const resultData = await resultResponse.json();
      setResult(resultData);

      if (fileInputRef.current) fileInputRef.current.value = "";
      setFile(null);
      setVideoUrl("");

    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="page-container">
      <div className="card">
        <h1 className="title">AV Sync Checker</h1>

        {/* TABS */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "file" ? "active" : ""}`}
            onClick={() => setActiveTab("file")}
          >
            Upload File
          </button>

          <button
            className={`tab ${activeTab === "url" ? "active" : ""}`}
            onClick={() => setActiveTab("url")}
          >
            Upload via URL
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="tab-content">
          {activeTab === "file" && (
            <div>
              <label className="input-label">Choose a video file</label>
              <input
                type="file"
                accept="video/*"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          )}

          {activeTab === "url" && (
            <div>
              <label className="input-label">Enter Video URL</label>
              <input
                type="text"
                className="url-input"
                placeholder="https://example.com/video.mp4"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
          )}
        </div>

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processing..." : "Check Sync"}
        </button>

        {result && (
          <div className="result-box">
            <h3>Sync Result</h3>
            <p><strong>Synced:</strong> {result.synced ? "Yes" : "No"}</p>
            <p>
              <strong>Offset:</strong>{" "}
              {result.synced ? "—" : `${result.offset} seconds`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
