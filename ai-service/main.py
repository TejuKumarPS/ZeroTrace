from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import numpy as np
import cv2
import os
import tensorflow as tf
import gc # Garbage collection for memory safety

# --- CONFIGURATION ---
MODEL_FILE = "model_gender_nonq.tflite"

# Global Variables
interpreter = None
input_details = None
output_details = None
face_net = None

def log(message):
    print(f"[{message}]", flush=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global interpreter, input_details, output_details, face_net
    log("🚀 AI Service Starting...")

    # 1. Load TFLite Model (Local File)
    # We assume the file is already in the GitHub repo/Render folder
    if os.path.exists(MODEL_FILE):
        try:
            interpreter = tf.lite.Interpreter(model_path=MODEL_FILE)
            interpreter.allocate_tensors()
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()
            log(f"✅ Gender Model Loaded: {MODEL_FILE}")
        except Exception as e:
            log(f"❌ Critical TFLite Error: {e}")
    else:
        log(f"❌ ERROR: {MODEL_FILE} not found in repository!")

    # 2. Load Face Detector (OpenCV)
    try:
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_net = cv2.CascadeClassifier(cascade_path)
        log("✅ Face Detector Loaded")
    except Exception as e:
        log(f"❌ OpenCV Error: {e}")

    yield
    log("🛑 Stopping...")

app = FastAPI(lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "alive", "service": "ZeroTrace AI"}

@app.post("/analyze-gender")
async def analyze_gender(file: UploadFile = File(...)):
    log(f"Processing: {file.filename}")

    if interpreter is None:
        raise HTTPException(status_code=500, detail="AI Model not loaded.")

    try:
        # 1. Read Image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Could not decode image")

        # 2. Detect Face
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_net.detectMultiScale(gray, 1.1, 4)

        if len(faces) == 0:
            log("⚠️ No face found")
            del contents, nparr, img, gray # Cleanup
            raise HTTPException(status_code=400, detail="No face detected.")

        # 3. Crop Face
        (x, y, w, h) = faces[0]
        padding = 10
        face_img = img[max(0, y-padding):min(img.shape[0], y+h+padding), 
                       max(0, x-padding):min(img.shape[1], x+w+padding)]
        
        # 4. PREPROCESS (Strictly keeping YOUR logic here)
        # Resize to 128x128 (Required by your model)
        resized = cv2.resize(face_img, (128, 128))
        
        # Normalize to [0, 1]
        input_data = resized.astype(np.float32) / 255.0
        input_data = np.expand_dims(input_data, axis=0) # (1, 128, 128, 3)
        
        # 5. Run Inference
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()

        # 6. Get Result
        # Output is shape [1, 2] -> [[Prob_Male, Prob_Female]]
        preds = interpreter.get_tensor(output_details[0]['index'])[0]
        
        male_score = preds[0]
        female_score = preds[1]
        
        gender_result = "male" if male_score > female_score else "female"
        confidence = float(max(male_score, female_score))

        log(f"🎯 Result: {gender_result} (Conf: {confidence:.2f})")

        # 7. CRITICAL MEMORY CLEANUP
        # This is the only new part I added to stop the server from crashing
        del contents
        del nparr
        del img
        del gray
        del face_img
        del resized
        del input_data
        gc.collect() 

        return {
            "gender": gender_result, 
            "confidence": confidence
        }

    except Exception as e:
        log(f"❌ Error: {str(e)}")
        # Attempt cleanup on error
        gc.collect()
        raise HTTPException(status_code=500, detail=str(e))