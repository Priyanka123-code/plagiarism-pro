import React, { useState } from "react";
import "./App.css";
import axios from "axios";

const App = () => {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [error, setError] = useState("");
    const [similarityScore, setSimilarityScore] = useState(null);
    const [loading, setLoading] = useState(false);

    const allowedTypes = ["pdf", "docx", "txt"];

    const handleFileChange1 = (e) => {
        const file = e.target.files[0];
        if (file && allowedTypes.includes(file.name.split('.').pop().toLowerCase())) {
            setFile1(file);
            setError("");
        } else {
            setError("Invalid file type. Please upload PDF, DOCX, or TXT.");
        }
    };

    const handleFileChange2 = (e) => {
        const file = e.target.files[0];
        if (file && allowedTypes.includes(file.name.split('.').pop().toLowerCase())) {
            setFile2(file);
            setError("");
        } else {
            setError("Invalid file type. Please upload PDF, DOCX, or TXT.");
        }
    };

    const handleUpload = async () => {
        if (!file1 || !file2) {
            setError("Please upload both files.");
            return;
        }

        const formData = new FormData();
        formData.append("file1", file1);
        formData.append("file2", file2);

        setLoading(true);
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/check-plagiarism/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.similarity_score !== undefined) {
                setSimilarityScore(response.data.similarity_score);
            } else {
                setError("Invalid response from server.");
            }
        } catch (error) {
            setError("Error processing files. Please try again.");
            console.error("API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>AI Plagiarism Detector</h1>
            <div className="upload-section">
                <input type="file" onChange={handleFileChange1} />
                <input type="file" onChange={handleFileChange2} />
            </div>
            <button onClick={handleUpload} disabled={loading}>
                {loading ? "Checking..." : "Check Plagiarism"}
            </button>
            
            {error && <p className="error">{error}</p>}
            {similarityScore !== null && !isNaN(similarityScore) && (
                <p className="result">Plagiarism Score: {Number(similarityScore).toFixed(2)}%</p>
            )}
        </div>
    );
};

export default App;
