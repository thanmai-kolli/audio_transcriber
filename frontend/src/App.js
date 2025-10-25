// import React, { useState, useRef } from "react";
// import axios from "axios";
// import { FiUpload, FiMic, FiCopy, FiEdit2 } from "react-icons/fi";
// import { Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// export default function App() {
//   const [audioFile, setAudioFile] = useState(null);
//   const [predictedText, setPredictedText] = useState("");
//   const [metrics, setMetrics] = useState(null);
//   const [processingTime, setProcessingTime] = useState(0);
//   const [recording, setRecording] = useState(false);
//   const [editable, setEditable] = useState(false);
//   const mediaRecorder = useRef(null);
//   const audioChunks = useRef([]);

//   const handleFileChange = (e) => setAudioFile(e.target.files[0]);
//   const handleCopy = () => navigator.clipboard.writeText(predictedText);
//   const toggleEdit = () => setEditable(!editable);

//   const startRecording = async () => {
//     setRecording(true);
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     mediaRecorder.current = new MediaRecorder(stream);
//     audioChunks.current = [];
//     mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
//     mediaRecorder.current.onstop = async () => {
//       const blob = new Blob(audioChunks.current, { type: "audio/wav" });
//       setAudioFile(new File([blob], "recorded.wav"));
//       setRecording(false);
//     };
//     mediaRecorder.current.start();
//   };

//   const stopRecording = () => mediaRecorder.current.stop();

//   const handleUpload = async () => {
//     if (!audioFile) return alert("Please select or record audio first!");
//     const formData = new FormData();
//     formData.append("file", audioFile);

//     const reference = prompt(
//       "Enter reference text (optional) for accuracy evaluation:",
//       ""
//     );
//     if (reference) formData.append("reference_text", reference);

//     try {
//       const res = await axios.post("http://127.0.0.1:5000/transcribe", formData);
//       setPredictedText(res.data.predicted_text);
//       setMetrics(res.data.metrics);
//       setProcessingTime(res.data.processing_time);
//       setEditable(false); // Reset edit mode
//     } catch (err) {
//       alert("Error: " + err.message);
//     }
//   };

//   return (
//     <div className="container">
//       <h1>🎤 Audio Transcriber</h1>
//       <p className="description">
//         Convert your audio files or microphone recordings into accurate, editable text.
//         Evaluate transcription accuracy and visualize metrics instantly.
//       </p>

//       <div className="controls">
//         <input type="file" accept="audio/*" onChange={handleFileChange} />
//         {!recording ? (
//           <button className="record" onClick={startRecording}>
//             <FiMic /> Record
//           </button>
//         ) : (
//           <button className="stop" onClick={stopRecording}>
//             <FiMic /> Stop
//           </button>
//         )}
//         <button className="upload" onClick={handleUpload}>
//           <FiUpload /> Transcribe
//         </button>
//       </div>

//       {predictedText && (
//         <div className="textarea-container fade-in">
//           <div className="textarea-header">
//             <h2>Transcribed Text</h2>
//             <div style={{ display: "flex", gap: "10px" }}>
//               <button className="copy-btn" onClick={handleCopy}>
//                 <FiCopy /> Copy
//               </button>
//               <button className="copy-btn" onClick={toggleEdit}>
//                 <FiEdit2 /> {editable ? "Lock" : "Edit"}
//               </button>
//             </div>
//           </div>
//           <textarea
//             value={predictedText}
//             onChange={(e) => setPredictedText(e.target.value)}
//             readOnly={!editable}
//           />
//         </div>
//       )}

//       {metrics && (
//         <div className="metrics-container fade-in">
//           <p>Processing Time: {processingTime}s</p>
//           <Bar
//             data={{
//               labels: ["WER", "Accuracy"],
//               datasets: [
//                 {
//                   label: "Score",
//                   data: [metrics.WER, metrics.accuracy / 100],
//                   backgroundColor: ["#f87171", "#4ade80"],
//                   borderRadius: 6,
//                 },
//               ],
//             }}
//             options={{
//               animation: { duration: 1000 },
//               scales: { y: { min: 0, max: 1 } },
//               plugins: { legend: { display: false } },
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FiUpload, FiMic, FiCopy, FiEdit2 } from "react-icons/fi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [predictedText, setPredictedText] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [recording, setRecording] = useState(false);
  const [editable, setEditable] = useState(false);
  const [referenceText, setReferenceText] = useState("");
  const refTextarea = useRef(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // Auto resize reference textarea
  useEffect(() => {
    if (refTextarea.current) {
      refTextarea.current.style.height = "auto"; // Reset height
      refTextarea.current.style.height = refTextarea.current.scrollHeight + "px"; // Adjust
    }
  }, [referenceText]);

  const handleFileChange = (e) => setAudioFile(e.target.files[0]);
  const handleCopy = () => navigator.clipboard.writeText(predictedText);
  const toggleEdit = () => setEditable(!editable);

  const startRecording = async () => {
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];
    mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
    mediaRecorder.current.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: "audio/wav" });
      setAudioFile(new File([blob], "recorded.wav"));
      setRecording(false);
    };
    mediaRecorder.current.start();
  };

  const stopRecording = () => mediaRecorder.current.stop();

  const handleUpload = async () => {
    if (!audioFile) return alert("Please select or record audio first!");
    const formData = new FormData();
    formData.append("file", audioFile);
    if (referenceText) formData.append("reference_text", referenceText);

    try {
      const res = await axios.post("http://127.0.0.1:5000/transcribe", formData);
      setPredictedText(res.data.predicted_text);
      setMetrics(res.data.metrics);
      setProcessingTime(res.data.processing_time);
      setEditable(false);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="container">
      <h1>🎤 Audio Transcriber</h1>
      <p className="description">
        Convert your audio files or microphone recordings into accurate, editable text.
        Evaluate transcription accuracy and visualize metrics instantly.
      </p>

      {/* Dynamic Reference Textarea */}
      <div className="reference-input">
        <textarea
          ref={refTextarea}
          placeholder="Enter reference text (optional) for accuracy evaluation..."
          value={referenceText}
          onChange={(e) => setReferenceText(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            resize: "none",
            fontSize: "1rem",
            marginBottom: "20px",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.3)",
            transition: "all 0.2s ease",
          }}
        />
      </div>

      <div className="controls">
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        {!recording ? (
          <button className="record" onClick={startRecording}>
            <FiMic /> Record
          </button>
        ) : (
          <button className="stop" onClick={stopRecording}>
            <FiMic /> Stop
          </button>
        )}
        <button className="upload" onClick={handleUpload}>
          <FiUpload /> Transcribe
        </button>
      </div>

      {predictedText && (
        <div className="textarea-container fade-in">
          <div className="textarea-header">
            <h2>Transcribed Text</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="copy-btn" onClick={handleCopy}>
                <FiCopy /> Copy
              </button>
              <button className="copy-btn" onClick={toggleEdit}>
                <FiEdit2 /> {editable ? "Lock" : "Edit"}
              </button>
            </div>
          </div>
          <textarea
            value={predictedText}
            onChange={(e) => setPredictedText(e.target.value)}
            readOnly={!editable}
          />
        </div>
      )}

      {metrics && (
        <div className="metrics-container fade-in">
          <p>Processing Time: {processingTime}s</p>
          <Bar
            data={{
              labels: ["WER", "Accuracy"],
              datasets: [
                {
                  label: "Score",
                  data: [metrics.WER, metrics.accuracy / 100],
                  backgroundColor: ["#f87171", "#4ade80"],
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              animation: { duration: 1000 },
              scales: { y: { min: 0, max: 1 } },
              plugins: { legend: { display: false } },
            }}
          />
        </div>
      )}
    </div>
  );
}

