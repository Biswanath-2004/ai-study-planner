from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.getenv("MONGODB_URL") or "mongodb://localhost:27017/"
db_name = os.getenv("DB_NAME") or "ai_study_planner"

client = MongoClient(mongo_url)
db = client[db_name]
users_collection = db["users"]