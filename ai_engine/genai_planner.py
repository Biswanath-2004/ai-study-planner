import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")

def generate_timetable(study_plan):

    prompt = f"""
    Create a simple 7-day study timetable for the following subjects and study hours:

    {study_plan}

    Give day-wise plan.
    Keep it simple and clear.
    """

    response = model.generate_content(prompt)

    return response.text