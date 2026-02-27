from fastapi import FastAPI
from pymongo import MongoClient

mongo_url="mongodb+srv://admin:admin1234@cluster0.zbvedqp.mongodb.net/?appName=Cluster0"

app = FastAPI()

client = MongoClient(mongo_url)
db = client["ai_study_planner"]

@app.get("/")
def home():
    return {"message": "API is working 🚀"}


@app.get("/test-db")
def test_db():
    collection = db["test_collection"]

    data = {
        "name": "Biswanath",
        "age": 15
    }

    collection.insert_one(data)

    return {"message": "Data inserted into MongoDB ✅"}


from fastapi import FastAPI
from app.database import db

app = FastAPI()

@app.get("/")
def home():
    return {"message": "AI Study Planner API is running 🚀"}


@app.get("/test-db")
def test_db():
    collection = db["test"]
    collection.insert_one({"name": "Biswanath"})
    return {"message": "Inserted"}



from fastapi import FastAPI
import joblib
import numpy as np
import pandas as pd

app = FastAPI()

# 🧠 Load trained ML model
model = joblib.load("ml_model/study_model.pkl")


@app.get("/")
def home():
    return {"message": "AI Study Planner with ML is running 🚀"}


# 🤖 Prediction API
@app.get("/predict")
def predict(study_hours: int, days_left: int, difficulty: int):

    input_data = pd.DataFrame([{
    "study_hours": study_hours,
    "days_left": days_left,
    "difficulty": difficulty
}])

    prediction = model.predict(input_data)

    return {
        "recommended_study_hours": round(prediction[0], 2)
    }