import { useState, useRef } from "react";
import { FaFileDownload, FaFileUpload } from "react-icons/fa";
import "./VideoSyncPage.css";
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_APP_API_URL;
const SOCKET_URL = import.meta.env.VITE_APP_SOCKET_URL;
const socket = io(SOCKET_URL);

export default function VideoSyncPage() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState({status:'processing'});
    const [dragActive, setDragActive] = useState(false);
    const [dubbed, setDubbed] = useState(false);
    const [currentStatus, setCurrentStatus] = useState("Idle");
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file)
            return alert("Please upload a video file.");

        setLoading(true);
        setResult({status:'processing'});

        try {
            let uploadResponse;

            const formData = new FormData();
            formData.append("video", file);
            formData.append("dubbed", dubbed);

            setCurrentStatus("Uploading video");

            uploadResponse = await fetch(`${API_URL}/upload-file`, {
                method: "POST",
                body: formData,
            });

            const resp = await uploadResponse.json();

            socket.emit("subscribe", resp.id);
            
            socket.on("info", (data) => {
                if (data.message==='complete-sync'){
                    setResult({
                        synced: data.offset === 0.0,
                        offset: data.offset,
                        confidence: data.confidence,
                        video_path: data.video_path,
                        id: data.id,
                        status: 'processed-sync'
                    });
                    setLoading(false);
                    setCurrentStatus("Processing complete.");
                }
                else if (data.message==='complete-wav2lip'){
                    setResult({
                        video_path: data.video_path,
                        id: data.id,
                        status: 'processed-wav2lip'
                    });
                    setLoading(false);
                    setCurrentStatus("Wav2Lip processing complete.");
                }
                else{
                    setCurrentStatus(data.message);
                }
            });
        } catch (err) {
            setLoading(false);
            console.error(err);
            alert("Error connecting to server.");
        }
    };

    const downloadFile =async (e) => {
        e.preventDefault();

        if (!result.video_path.trim()) {
            alert("No video available for download.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/generate-download-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    filename: result.video_path,
                    id: result.id
                 }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || data.error || 'Failed to fetch download link');
            }

            const link = document.createElement('a');
            link.href = data.download_url;
            link.setAttribute('download', 'output_video.mp4'); 
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
        }
    }

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
                    <span className="gradient-text">AV Sync Detector</span>
                </h1>

                <div className="note-body">
                    <span className="note-icon">⚠️</span>
                    <p>
                        <strong>Note:</strong> Upload videos of length 60s or less
                        otherwise <span className="highlight">only first 60s of video will be processed</span>.
                    </p>
                </div>

                <div className="content">
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

                    <label style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <input
                                type="checkbox"
                                onChange={(e) => setDubbed(e.target.checked)}
                            />
                            Dubbed Video
                    </label>
                </div>

                <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner"></span> {currentStatus}...
                        </>
                    ) : (
                        "Check Sync"
                    )}
                </button>

                {result.status.startsWith('processed') && (<h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(to right, #6366f1, #a855f7)', // Indigo to Purple
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '24px',
                    textAlign: 'center'
                }}>
                    ✨ Processing Completed ✨ 
                </h2>) }

                {result.status==='processed-sync' && (
                    <div className={`result-card ${result.synced ? "synced" : "not-synced"}`}>
                        <div className="result-header">
                            <h3>{result.synced ? "Perfect Sync" : "Out of Sync"}</h3>
                        </div>

                        <div className="result-body">
                            <p><strong>Status:</strong> {result.synced ? "Synced" : "Not Synced"}</p>

                            {!result.synced && (
                                <p className="offset">
                                    <strong>Offset:</strong> {Math.round(result.offset * 100) / 100}&plusmn;0.2 seconds{" "} {result.offset > 0 ? "(audio ahead)" : "(video ahead)"} <br />
                                    <strong>Confidence:</strong> {Math.round(result.confidence * 100)}% {" "}
                                </p>
                            )}
                        </div>   
                    </div>
                )}

                {result.status.startsWith('processed') && 
                    <button className="submit-btn" onClick={downloadFile}>
                        <FaFileDownload size={20} style={{ marginRight: "8px" }} />
                        Download Synced Video
                    </button> 
                }
                
            </div>
        </div>
    );
}