import React, { useState, useRef } from "react";
import "./VideoSyncPage.css";

export default function VideoSyncPage() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file && !videoUrl) {
      alert("Please upload a video file or enter a URL.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let uploadResponse;

      // =======================
      // CASE 1: FILE UPLOAD
      // =======================
      if (file) {
        const formData = new FormData();
        formData.append("video", file);

        uploadResponse = await fetch("http://localhost:8000/upload", {
          method: "POST",
          body: formData,
        });
      }

      // =======================
      // CASE 2: URL UPLOAD
      // =======================
      else if (videoUrl) {
        uploadResponse = await fetch("http://localhost:8000/upload_url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: videoUrl }),
        });
      }

      const uploadData = await uploadResponse.json();
      const newTaskId = uploadData.task_id;

      // ======== Result API =========
      const resultResponse = await fetch("http://localhost:8000/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: newTaskId }),
      });

      const resultData = await resultResponse.json();
      setResult(resultData);

      // reset inputs
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFile(null);
      setVideoUrl("");

    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>AV Sync Checker</h1>

      {/* =============== FILE UPLOAD =============== */}
      <div className="upload-box">
        <label className="upload-label">Upload Video File</label>
        <input 
          type="file" 
          accept="video/*" 
          onChange={handleFileChange} 
          ref={fileInputRef} 
        />
      </div>

      {/* =============== URL INPUT =============== */}
      <div className="upload-box">
        <label className="upload-label">Enter Video URL</label>
        <input
          type="text"
          className="url-input"
          placeholder="https://example.com/video.mp4"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
      </div>

      <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing..." : "Submit"}
      </button>

      {result && (
        <div className="result-box">
          <h3>Sync Result</h3>

          <p>
            <strong>Synced:</strong> {result.synced ? "Yes" : "No"}
          </p>

          <p>
            <strong>Offset:</strong>{" "}
            {result.synced ? "–" : `${result.offset} seconds`}
          </p>
        </div>
      )}
    </div>
  );
}
