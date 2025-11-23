import React, { useState, useRef } from "react";
import "./VideoSyncPage.css";

export default function VideoSyncPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [taskId, setTaskId] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a video container.");
      return;
    }

    setLoading(true);
    setResult(null);
    setTaskId(null);

    try {
      const formData = new FormData();
      formData.append("video", file);

      // ---- Upload API ----
      const uploadResponse = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      // console.log("Upload Response:", uploadData);

      // Expecting backend to return: { task_id: "xyz123" }
      const newTaskId = uploadData.task_id;
      setTaskId(newTaskId);

      // ---- Sync Result API ----
      const syncResponse = await fetch("http://localhost:8000/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId }),
      });

      const syncData = await syncResponse.json();
      // console.log("Sync Result:", syncData);

      setResult(syncData);


      // ---- Clear file input ----
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFile(null);

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

      <div className="upload-box">
        <label className="upload-label">Upload Video Container</label>
        <input 
          type="file" 
          accept="video/*" 
          onChange={handleFileChange} 
          ref={fileInputRef} 
        />
      </div>

      <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing..." : "Submit"}
      </button>

      {/* {taskId && (
        <div className="task-box">
          <p><strong>Task ID:</strong> {taskId}</p>
        </div>
      )} */}

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
