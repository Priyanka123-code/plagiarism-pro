import React, { useState } from "react";
import axios from "axios";
import "./PlagiarismChecker.css"; // Import CSS for styling

const PlagiarismChecker = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [plagiarismScore, setPlagiarismScore] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const allowedTypes = ["pdf", "docx", "txt"];

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.name.split(".").pop().toLowerCase();
      if (allowedTypes.includes(fileType)) {
        setFile(file);
        setError("");
      } else {
        setError("Invalid file type. Please upload PDF, DOCX, or TXT.");
      }
    }
  };

  const checkPlagiarism = async () => {
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
        setPlagiarismScore(response.data.similarity_score);
        setError("");
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
      setError("Error checking plagiarism. Please try again.");
      setPlagiarismScore(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🔍 AI Plagiarism Detector</h1>

      <div className="file-input">
        <input type="file" onChange={(e) => handleFileChange(e, setFile1)} />
      </div>

      <div className="file-input">
        <input type="file" onChange={(e) => handleFileChange(e, setFile2)} />
      </div>

      <button onClick={checkPlagiarism} disabled={loading}>
        {loading ? "Checking..." : "Check Plagiarism"}
      </button>

      {plagiarismScore !== null && (
        <div className="result">
          Plagiarism Score: {Number(plagiarismScore).toFixed(2)}%
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default PlagiarismChecker;
