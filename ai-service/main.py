from fastapi import FastAPI, UploadFile, File, HTTPException
from contextlib import asynccontextmanager
import numpy as np
import cv2
import os
import requests
import tensorflow as tf

app = FastAPI()

MODEL_FILE = "model_gender_nonq.tflite"
MODEL_URL = "https://github.com/shubham0204/Age-Gender_Estimation_TF-Android/raw/master/app/src/main/assets/model_gender_nonq.tflite"

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

    # 1. Download Model if missing
    if not os.path.exists(MODEL_FILE):
        log(f"⬇️ Downloading {MODEL_FILE}...")
        try:
            r = requests.get(MODEL_URL)
            with open(MODEL_FILE, 'wb') as f:
                f.write(r.content)
            log("✅ Download Complete")
        except Exception as e:
            log(f"❌ Download Failed: {e}")
            log("--> Try downloading manually from GitHub if this fails.")

    # 2. Load TFLite Model
    try:
        if os.path.exists(MODEL_FILE):
            interpreter = tf.lite.Interpreter(model_path=MODEL_FILE)
            interpreter.allocate_tensors()
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()
            log(f"✅ Gender Model Loaded ({MODEL_FILE})")
        else:
            log("❌ Model file not found.")
    except Exception as e:
        log(f"❌ TFLite Error: {e}")

    # 3. Load Face Detector (OpenCV)
    try:
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_net = cv2.CascadeClassifier(cascade_path)
    except:
        log("❌ OpenCV Face Detector Failed")

    yield
    log("🛑 Stopping...")

app = FastAPI(lifespan=lifespan)


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
            raise HTTPException(status_code=400, detail="No face detected.")

        # 3. Crop Face
        (x, y, w, h) = faces[0]
        padding = 10
        face_img = img[max(0, y-padding):min(img.shape[0], y+h+padding), 
                       max(0, x-padding):min(img.shape[1], x+w+padding)]
        
        # 4. PREPROCESS (Specific to this model)
        # Resize to 128x128 (Required by this specific model)
        resized = cv2.resize(face_img, (128, 128))
        
        # Convert to Float32 and Normalize to [0, 1]
        input_data = resized.astype(np.float32) / 255.0
        input_data = np.expand_dims(input_data, axis=0) # Add batch dimension -> (1, 128, 128, 3)
        
        # 5. Run Inference
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()

        # 6. Get Result
        # Output is shape [1, 2] -> [[Prob_Male, Prob_Female]] (0=Male, 1=Female in UTKFace)
        preds = interpreter.get_tensor(output_details[0]['index'])[0]
        
        male_score = preds[0]
        female_score = preds[1]
        
        gender_result = "male" if male_score > female_score else "female"
        confidence = float(max(male_score, female_score))

        log(f"🎯 Result: {gender_result} (Conf: {confidence:.2f})")

        return {
            "gender": gender_result, 
            "confidence": confidence
        }

    except Exception as e:
        log(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))