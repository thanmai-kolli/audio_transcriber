import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
from jiwer import wer, cer

# --- Setup ---
app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

model = whisper.load_model("base")

# --- Routes ---
@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    start_time = time.time()
    result = model.transcribe(filepath)
    end_time = time.time()

    predicted_text = result["text"]
    processing_time = round(end_time - start_time, 2)

    # Optional reference text for evaluation
    reference_text = request.form.get("reference_text", "").strip()
    metrics = {}
    if reference_text:
        word_error = round(wer(reference_text, predicted_text), 3)
        char_error = round(cer(reference_text, predicted_text), 3)
        accuracy = round((1 - word_error) * 100, 2)
        metrics = {"WER": word_error, "CER": char_error, "accuracy": accuracy}

    return jsonify({
        "predicted_text": predicted_text,
        "processing_time": processing_time,
        "metrics": metrics
    })

if __name__ == "__main__":
    app.run(debug=True)
