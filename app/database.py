import os
from pymongo import MongoClient
from dotenv import load_dotenv # pyright: ignore[reportMissingImports]

load_dotenv()

MONGO_URL = os.getenv("mongodb+srv://admin:<db_password>@cluster0.zbvedqp.mongodb.net/?appName=Cluster0")
DB_NAME = os.getenv("DB_NAME", "ai_study_planner")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]