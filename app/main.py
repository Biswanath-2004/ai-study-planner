from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, field_validator
from typing import List, Optional
import numpy as np
import joblib
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime

# 🌐 CORS
from fastapi.middleware.cors import CORSMiddleware

# ---------------- CONFIG ----------------

load_dotenv()
app = FastAPI()

# CORS (VERY IMPORTANT)
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# MongoDB
mongo_url = os.getenv("MONGODB_URL")
client = MongoClient(mongo_url)
db = client["ai_study_planner"]

# ML Model
# model = joblib.load("ml_model/study_model.pkl")

# ---------------- HELPER FUNCTIONS ----------------

# ✅ SIMPLE TIMETABLE (WORKING VERSION)
def simple_timetable(subjects, days):
    timetable = {}
    for i in range(days):
        timetable[f"Day {i+1}"] = {
            "subject": subjects[i % len(subjects)],
            "hours": 2
        }
    return timetable

# ---------------- REQUEST MODELS ----------------

class StudyPlanRequest(BaseModel):
    subjects: List[str]
    days_left: int
    total_hours: float
    difficulties: List[int]

    @field_validator("difficulties")
    def check_length(cls, v, values):
        if len(v) != len(values.data["subjects"]):
            raise ValueError("subjects and difficulties must match")
        return v




# ---------------- BASIC APIs ----------------

@app.get("/")
def home():
    return {"message": "AI Study Planner is running 🚀"}

@app.post("/login")
def login(data: dict):
    username = data.get("username")
    password = data.get("password")
    # Simple check, in real app use proper auth
    if username and password:
        return {"message": "Login success"}
    return {"message": "Login failed"}





# ---------------- ML PREDICT ----------------

# @app.get("/predict")
# def predict(study_hours: int, days_left: int, difficulty: int):
#     input_data = np.array([[study_hours, days_left, difficulty]])
#     prediction = model.predict(input_data)

#     return {"recommended_study_hours": round(prediction[0], 2)}

# ---------------- SIMPLE PLAN ----------------

@app.post("/generate-plan")
def generate_plan(data: StudyPlanRequest):
    subject_plan, timetable = rule_based_plan(
        data.subjects,
        data.total_hours,
        data.days_left
    )

    plan = []
    for day, plan_data in timetable.items():
        plan.append({day: plan_data})

    return {"plan": plan, "subject_wise_hours": subject_plan}

# ---------------- RULE-BASED PLAN ----------------

def rule_based_plan(subjects, total_hours, days):

    hours_per_subject = total_hours / len(subjects)

    subject_plan = {
        subject: round(hours_per_subject, 2)
        for subject in subjects
    }

    daily_hours = total_hours / days

    timetable = {}

    for day in range(1, days + 1):
        timetable[f"Day {day}"] = {
            "study_hours": round(daily_hours, 2),
            "subject": subjects[day % len(subjects)]
        }

    return subject_plan, timetable


@app.post("/study-plan")
def create_study_plan(data: StudyPlanRequest):

    subject_plan, timetable = rule_based_plan(
        data.subjects,
        data.total_hours,
        data.days_left
    )

    return {
        "subject_wise_hours": subject_plan,
        "day_wise_timetable": timetable
    }

# ✅ AUTHENTICATED FULL PLAN GENERATION WITH TIMESTAMPS
# @app.post("/generate-full-plan")
# def generate_full_plan(data: StudyPlanRequest):

#     study_plan = {}

#     for subject, difficulty in zip(data.subjects, data.difficulties):
#         input_data = np.array([[2, data.days_left, difficulty]])
#         prediction = model.predict(input_data)
#         study_plan[subject] = round(prediction[0], 2)

#     timetable = simple_timetable(data.subjects, data.days_left)

#     # ✅ SAVE WITH USER AND TIMESTAMP
#     plan_doc = {
#         "username": username,
#         "subjects": data.subjects,
#         "study_plan": study_plan,
#         "timetable": timetable,
#         "days_left": data.days_left,
#         "total_hours": data.total_hours,
#         "created_at": datetime.utcnow().isoformat(),
#         "plan_id": str(int(datetime.utcnow().timestamp() * 1000))
#     }
#     db["plans"].insert_one(plan_doc)

#     return {
#         "study_hours": study_plan,
#         "7_day_plan": timetable,
#         "plan_id": plan_doc["plan_id"],
#         "created_at": plan_doc["created_at"]
#     }

@app.get("/history")
def get_history(username: str):
    plans = list(db["plans"].find({"username": username}).sort("created_at", -1))
    # Convert ObjectId to string
    for plan in plans:
        plan["_id"] = str(plan["_id"])
    return {"history": plans}

@app.delete("/plans/{plan_id}")
def delete_plan(plan_id: str, username: str):
    result = db["plans"].delete_one({"plan_id": plan_id, "username": username})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"message": "Plan deleted successfully ✅"}