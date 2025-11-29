import React, { useState, useRef } from "react";
import { FaFileUpload } from "react-icons/fa";
import "./VideoSyncPage.css";

const API_URL = import.meta.env.VITE_APP_API_URL;
console.log("API URL:", API_URL);

export default function VideoSyncPage() {
  const [activeTab, setActiveTab] = useState("file");
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Dropdown states
  const [audioLang, setAudioLang] = useState("");
  const [videoLang, setVideoLang] = useState("");

  const LANGUAGES = [
    "English", "Hindi", "Spanish", "French", "German",
    "Italian", "Portuguese", "Russian", "Japanese",
    "Korean", "Chinese", "Arabic"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audioLang || !videoLang)
      return alert("Please select both audio and video languages.");

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
        formData.append("audioLang", audioLang);
        formData.append("videoLang", videoLang);

        uploadResponse = await fetch(`${API_URL}/upload-file`, {
          method: "POST",
          body: formData,
        });
      } else {
        uploadResponse = await fetch(`${API_URL}/upload-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: videoUrl,
            audioLang,
            videoLang
          }),
        });
      }

      const resp = await uploadResponse.json();
      setResult(resp);
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

        {/* Language Dropdowns */}
        <div className="dropdown-container">
          <label className="dropdown-label">Audio Language:</label>
          <select
            value={audioLang}
            onChange={(e) => setAudioLang(e.target.value)}
            className="input-style select-style"
          >
            <option value="">Select Audio Language</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          <label className="dropdown-label">Video Language:</label>
          <select
            value={videoLang}
            onChange={(e) => setVideoLang(e.target.value)}
            className="input-style select-style"
          >
            <option value="">Select Video Language</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
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
              />
              <label className="dropzone-label">
                {file ? (
                  <p className="filename">Selected: {file.name}</p>
                ) : (
                  <>
                    <FaFileUpload size={48} />
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
              className="input-style"
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
          <div className={`result-card ${result.synced ? "synced" : "not-synced"}`}>
            <div className="result-header">
              <h3>{result.synced ? "Perfect Sync" : "Out of Sync"}</h3>
            </div>

            <div className="result-body">
              <p><strong>Status:</strong> {result.synced ? "Synced" : "Not Synced"}</p>

              {!result.synced && (
                <p className="offset">
                  <strong>Offset:</strong> {Math.abs(result.offset).toFixed(3)} seconds{" "}
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
