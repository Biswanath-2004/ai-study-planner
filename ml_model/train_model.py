import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

# Load dataset
df = pd.read_csv("student_study_data.csv")

# Features and target
X = df[["study_hours", "days_left", "difficulty"]]
y = df["score"]

# Train model
model = LinearRegression()
model.fit(X, y)

# Save model
joblib.dump(model, "study_model.pkl")

print("✅ Model trained and saved successfully!")