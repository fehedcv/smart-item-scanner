from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from PIL import Image, ImageDraw, ImageFont
import io
import os
import uuid

# Load your YOLOv8 model
model = YOLO("best.pt")  # Change this to your actual model path

# Define class names in order (as used in training)
CLASS_NAMES = ['charger', 'cup', 'book', 'bottle']

# Create output directory if it doesn't exist
os.makedirs("outputs", exist_ok=True)

# Create FastAPI app
app = FastAPI()

@app.post("/detect/")
async def detect_objects(file: UploadFile = File(...)):
    # Read image from uploaded file
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    draw = ImageDraw.Draw(image)

    # Run YOLOv8 detection
    results = model(image)[0]

    # Initialize counts
    counts = {cls_name: 0 for cls_name in CLASS_NAMES}

    # Load font
    try:
        font = ImageFont.truetype("arial.ttf", 18)
    except:
        font = ImageFont.load_default()

    # Process each detection
    for box in results.boxes:
        conf = float(box.conf[0])
        cls_id = int(box.cls[0])
        class_name = model.names[cls_id]

        if class_name in counts:
            counts[class_name] += 1

            # Draw bounding box and label
   '''         x1, y1, x2, y2 = map(int, box.xyxy[0])
            confidence_percent = int(conf * 100)
            label = f"{class_name} {confidence_percent}%"
            draw.rectangle([x1, y1, x2, y2], outline="green", width=2)
            draw.text((x1, y1 - 15), label, fill="green", font=font)
'''
    # Save annotated image
    unique_id = uuid.uuid4().hex[:6]
    filename = f"detected_{unique_id}.jpg"
    output_path = os.path.join("outputs", filename)
    image.save(output_path)

    # Return JSON response
    return JSONResponse(content={
        "counts": counts   })
#"image-saved-as":filename
