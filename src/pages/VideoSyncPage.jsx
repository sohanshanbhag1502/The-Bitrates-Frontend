import { useState, useRef } from "react";
import { FaFileUpload } from "react-icons/fa";
import "./VideoSyncPage.css";
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_APP_API_URL;
console.log("API URL:", API_URL);

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

            uploadResponse = await fetch(`${API_URL}/api/upload-file`, {
                method: "POST",
                body: formData,
            });

            const resp = await uploadResponse.json();
            console.log("Upload response:", resp);

            socket.emit("subscribe", resp.id);
            
            socket.on("info", (data) => {
                if (data.message==='complete-sync'){
                    console.log(data)
                    setResult({
                        synced: data.offset === 0.0,
                        offset: data.offset,
                        confidence: data.confidence,
                        status: 'processed'
                    });
                    setLoading(false);
                    setCurrentStatus("Processing complete.");
                }
                else if (data.message==='complete-wav2lip'){
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

                    <label style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "10px" }}>
                        Current Processing Status: {currentStatus}...
                    </label>
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

                {result.status==='processed' && (
                    <div className={`result-card ${result.synced ? "synced" : "not-synced"}`}>
                        <div className="result-header">
                            <h3>{result.synced ? "Perfect Sync" : "Out of Sync"}</h3>
                        </div>

                        <div className="result-body">
                            <p><strong>Status:</strong> {result.synced ? "Synced" : "Not Synced"}</p>

                            {!result.synced && (
                                <p className="offset">
                                    <strong>Offset:</strong> {result.offset}&plusmn;0.2 seconds{" "}
                                    <strong>Confidence:</strong> {result.confidence}% {" "}
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