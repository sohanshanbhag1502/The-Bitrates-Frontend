import React, { useState, useRef } from "react";
import "./VideoSyncPage.css";

export default function VideoSyncPage() {
  const [activeTab, setActiveTab] = useState("file");
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async () => {
    if (activeTab === "file" && !file)
      return alert("Please upload a video file.");

    if (activeTab === "url" && !videoUrl.trim())
      return alert("Please enter a valid video URL.");

    setLoading(true);
    setResult(null);

    try {
      let uploadResponse;

      if (activeTab === "file") {
        const formData = new FormData();
        formData.append("video", file);

        uploadResponse = await fetch("http://localhost:4000/upload", {
          method: "POST",
          body: formData,
        });
      } else {
        uploadResponse = await fetch("http://localhost:4000/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: videoUrl }),
        });
      }

      const { task_id } = await uploadResponse.json();

      // FIXED → Correct backend endpoint
      const resultRes = await fetch(
        `http://localhost:4000/sync-result/${task_id}`
      );

      const data = await resultRes.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
      setFile(null);
      setVideoUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragover" || e.type === "dragenter") setDragActive(true);
    if (e.type === "dragleave" || e.type === "drop") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="page-container">
      <div className="card">
        <h1 className="title">
          <span className="gradient-text">AV Sync Checker</span>
        </h1>

        <div className="tabs">
          <button
            className={`tab ${activeTab === "file" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("file");
              setResult(null);
              setVideoUrl("");
            }}
          >
            Upload File
          </button>

          <button
            className={`tab ${activeTab === "url" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("url");
              setResult(null);
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            URL
          </button>
        </div>

        <div className="content">
          {activeTab === "file" && (
            <div
              className={`dropzone ${dragActive ? "drag-active" : ""}`}
              onDragOver={handleDrag}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="video/*"
                ref={fileInputRef}
                onChange={(e) =>
                  e.target.files?.[0] && setFile(e.target.files[0])
                }
                id="file-input"
              />
              <label htmlFor="file-input" className="dropzone-label">
                {file ? (
                  <p className="filename">Selected: {file.name}</p>
                ) : (
                  <>
                    <svg className="upload-icon" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 4l4 4h-4V4zm-2 9v5h-2v-5H7l5-5 5 5h-3z" />
                    </svg>
                    <p>Upload Video</p>
                  </>
                )}
              </label>
            </div>
          )}

          {activeTab === "url" && (
            <input
              type="text"
              placeholder="https://example.com/video.mp4"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="url-input"
            />
          )}
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span> Processing...
            </>
          ) : (
            "Check Sync"
          )}
        </button>

        {result && (
          <div
            className={`result-card ${
              result.synced ? "synced" : "not-synced"
            }`}
          >
            <div className="result-header">
              <h3>{result.synced ? "Perfect Sync" : "Out of Sync"}</h3>
            </div>

            <div className="result-body">
              <p>
                <strong>Status:</strong>{" "}
                {result.synced ? "Synced" : "Not Synced"}
              </p>

              {!result.synced && (
                <p className="offset">
                  <strong>Offset:</strong>{" "}
                  {Math.abs(result.offset).toFixed(3)} seconds{" "}
                  {result.offset > 0 ? "(audio ahead)" : "(video ahead)"}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
