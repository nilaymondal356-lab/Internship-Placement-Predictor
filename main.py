from pathlib import Path
from typing import Literal

import joblib
import numpy as np
from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel


PROJECT_DIR = Path(__file__).resolve().parent
model = joblib.load(PROJECT_DIR / "placement_model.pkl")

app = FastAPI(title="Internship Success Predictor")


class StudentData(BaseModel):
    CGPA: float
    Internships: int
    Projects: int
    WorkshopsCertifications: int
    AptitudeTestScore: int
    SoftSkillsRating: float
    ExtracurricularActivities: Literal["Yes", "No"]
    PlacementTraining: Literal["Yes", "No"]
    SSC_Marks: int
    HSC_Marks: int


def frontend_file(filename: str, media_type: str) -> FileResponse:
    return FileResponse(PROJECT_DIR / filename, media_type=media_type)


@app.get("/", include_in_schema=False)
def home() -> FileResponse:
    return frontend_file("index.html", "text/html")


@app.get("/style.css", include_in_schema=False)
def stylesheet() -> FileResponse:
    return frontend_file("style.css", "text/css")


@app.get("/script.js", include_in_schema=False)
def javascript() -> FileResponse:
    return frontend_file("script.js", "application/javascript")


@app.get("/hero-background.mp4", include_in_schema=False)
def hero_video() -> FileResponse:
    return frontend_file("hero-background.mp4", "video/mp4")


@app.get("/health", include_in_schema=False)
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict")
def predict(student: StudentData) -> dict[str, str | float]:
    extracurricular_activities = int(student.ExtracurricularActivities == "Yes")
    placement_training = int(student.PlacementTraining == "Yes")

    input_data = np.array(
        [[
            student.CGPA,
            student.Internships,
            student.Projects,
            student.WorkshopsCertifications,
            student.AptitudeTestScore,
            student.SoftSkillsRating,
            extracurricular_activities,
            placement_training,
            student.SSC_Marks,
            student.HSC_Marks,
        ]]
    )

    prediction = model.predict(input_data)[0]
    probability = model.predict_proba(input_data)[0][1]

    return {
        "placement_status": "Placed" if prediction == 1 else "Not Placed",
        "confidence": round(float(probability) * 100, 2),
    }
