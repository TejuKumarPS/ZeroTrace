from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import numpy as np
import cv2
import os
import gc

# --- 1. THE FIX: Import Interpreter Directly ---
# This avoids the "no attribute 'lite'" error completely.
try:
    from tflite_runtime.interpreter import Interpreter
except ImportError:
    # Fallback for local testing if someone has full tensorflow installed
    import tensorflow as tf
    Interpreter = tf.lite.Interpreter

MODEL_FILE = "model_gender_nonq.tflite"

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

    # Load Model
    if os.path.exists(MODEL_FILE):
        try:
            # --- 2. UPDATED USAGE ---
            # Now we just call Interpreter(), not tflite.Interpreter()
            interpreter = Interpreter(model_path=MODEL_FILE)
            interpreter.allocate_tensors()
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()
            log(f"✅ Gender Model Loaded: {MODEL_FILE}")
        except Exception as e:
            log(f"❌ Critical TFLite Error: {e}")
    else:
        log(f"❌ ERROR: {MODEL_FILE} not found!")

    # Load Face Detector
    try:
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_net = cv2.CascadeClassifier(cascade_path)
        log("✅ Face Detector Loaded")
    except Exception as e:
        log(f"❌ OpenCV Error: {e}")

    yield
    log("🛑 Stopping...")

app = FastAPI(lifespan=lifespan)

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
    if interpreter is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Could not decode image")

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_net.detectMultiScale(gray, 1.1, 4)

        if len(faces) == 0:
            del contents, nparr, img, gray
            raise HTTPException(status_code=400, detail="No face detected")

        (x, y, w, h) = faces[0]
        padding = 10
        face_img = img[max(0, y-padding):min(img.shape[0], y+h+padding), 
                       max(0, x-padding):min(img.shape[1], x+w+padding)]
        
        resized = cv2.resize(face_img, (128, 128))
        input_data = resized.astype(np.float32) / 255.0
        input_data = np.expand_dims(input_data, axis=0)
        
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()
        
        preds = interpreter.get_tensor(output_details[0]['index'])[0]
        gender_result = "male" if preds[0] > preds[1] else "female"
        confidence = float(max(preds[0], preds[1]))

        # Cleanup
        del contents, nparr, img, gray, face_img, resized, input_data
        gc.collect()

        return {"gender": gender_result, "confidence": confidence}

    except Exception as e:
        gc.collect()
        raise HTTPException(status_code=500, detail=str(e))