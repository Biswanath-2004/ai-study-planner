import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import History from "./History";

function Dashboard({ user = "Guest" }) {
  const [activeTab, setActiveTab] = useState("create");
  const [subjects, setSubjects] = useState("");
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ YOUR BACKEND URL (DEPLOYED)
  const BASE_URL = "https://ai-study-planner-8gfo.onrender.com";

  // ✅ GENERATE PLAN (FIXED)
  const generatePlan = async () => {
    const subjectList = subjects.split(",").map((s) => s.trim());
    const difficultyList = difficulty.split(",").map((d) => d.trim());

    if (subjectList.length !== difficultyList.length) {
      alert("Subjects and Difficulties must match ❌");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/generate-plan`, {
        // ✅ FIXED ENDPOINT
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjects: subjectList,
          days_left: Number(days),
          total_hours: Number(hours),
          difficulties: difficultyList.map(Number),
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert("Error from backend ❌");
        return;
      }

      setResult(data);
    } catch (error) {
      alert("Backend not connected ❌");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CLEAR
  const clearForm = () => {
    setSubjects("");
    setDays("");
    setHours("");
    setDifficulty("");
    setResult(null);
  };

  // ✅ CHART DATA (FIXED)
  const chartData = result?.subject_wise_hours ? Object.entries(result.subject_wise_hours).map(([name, value]) => ({
      name,
      value: parseFloat(value),
    })) : [];

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.logo}>📚 AI Study Planner</h1>
        <p>Welcome {user} 👋</p>
      </header>

      <nav style={styles.tabNav}>
        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "create" ? styles.tabButtonActive : {}),
          }}
          onClick={() => setActiveTab("create")}
        >
          ➕ Create Plan
        </button>

        <button
          style={{
            ...styles.tabButton,
            ...(activeTab === "history" ? styles.tabButtonActive : {}),
          }}
          onClick={() => setActiveTab("history")}
        >
          📋 History
        </button>
      </nav>

      <main style={styles.mainContent}>
        {activeTab === "create" ? (
          <div style={styles.formCard}>
            <h2>Create Study Plan</h2>

            <input
              style={styles.input}
              placeholder="Subjects (Math, Science)"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Days"
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Total Hours"
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Difficulty (1,2)"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            />

            <button style={styles.generateBtn} onClick={generatePlan}>
              🚀 Generate
            </button>

            <button style={styles.clearBtn} onClick={clearForm}>
              Clear
            </button>

            {loading && <p>⏳ Generating...</p>}

            {/* RESULT */}
            {result && (
              <>
                <h3>📊 Study Plan</h3>

                {result.plan.map((day, index) => (
                  <div key={index}>
                    <b>{Object.keys(day)[0]}</b>
                    <pre>{JSON.stringify(day, null, 2)}</pre>
                  </div>
                ))}

                {/* STUDY HOURS CHART */}
                {chartData.length > 0 && (
                  <div style={{ marginTop: "30px" }}>
                    <h3>📈 Subject-wise Study Hours</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#667eea" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <History user={user} />
        )}
      </main>
    </div>
  );
}

const styles = {
  appContainer: {
    padding: "20px",
    fontFamily: "Arial",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
  },
  logo: {
    fontSize: "30px",
  },
  tabNav: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "20px",
  },
  tabButton: {
    padding: "10px",
    cursor: "pointer",
  },
  tabButtonActive: {
    background: "#667eea",
    color: "white",
  },
  mainContent: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  formCard: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
  },
  input: {
    display: "block",
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
  },
  generateBtn: {
    padding: "10px",
    marginRight: "10px",
    background: "#667eea",
    color: "white",
    border: "none",
  },
  clearBtn: {
    padding: "10px",
  },
};

export default Dashboard;