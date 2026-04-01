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

function Dashboard({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState("create");
  const [subjects, setSubjects] = useState("");
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ GENERATE PLAN
  const generatePlan = async () => {
    const subjectList = subjects.split(",").map((s) => s.trim());
    const difficultyList = difficulty.split(",").map((d) => d.trim());

    if (subjectList.length !== difficultyList.length) {
      alert("Subjects and Difficulties must match ❌");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/generate-full-plan",
        {
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
        }
      );

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Backend not connected ❌");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CLEAR FORM
  const clearForm = () => {
    setSubjects("");
    setDays("");
    setHours("");
    setDifficulty("");
    setResult(null);
  };

  // ✅ SAFE CHART DATA
  const chartData = result?.study_hours
    ? Object.entries(result.study_hours).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <div style={styles.appContainer}>
      {/* PROFESSIONAL HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.logo}>📚 AI Study Planner</h1>
          <p style={styles.tagline}>Personalized Learning at Scale</p>
        </div>
      </header>

      {/* TABBED NAVIGATION */}
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

      {/* CONTENT AREA */}
      <main style={styles.mainContent}>
        {/* CREATE PLAN TAB */}
        {activeTab === "create" ? (
          <div style={styles.content}>
            {/* INPUT FORM */}
            <div style={styles.formCard}>
              <h2 style={styles.formTitle}>🎯 Create New Study Plan</h2>

              <div style={styles.formGroup}>
                <label style={styles.label}>Subjects</label>
                <input
                  style={styles.input}
                  placeholder="e.g., Math, English, Science"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                />
                <p style={styles.hint}>
                  Separate multiple subjects with commas
                </p>
              </div>

              <div style={styles.rowGroup}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Days Left</label>
                  <input
                    style={styles.input}
                    placeholder="7"
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Total Hours</label>
                  <input
                    style={styles.input}
                    placeholder="21"
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Difficulties</label>
                <input
                  style={styles.input}
                  placeholder="e.g., 2, 1, 3"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                />
                <p style={styles.hint}>
                  Scale 1-5, separate with commas (must match subject count)
                </p>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  style={styles.generateBtn}
                  onClick={generatePlan}
                  disabled={loading}
                >
                  {loading ? "⏳ Generating..." : "🚀 Generate Plan"}
                </button>
                <button style={styles.clearBtn} onClick={clearForm}>
                  🔄 Clear
                </button>
              </div>
            </div>

            {/* RESULTS */}
            {loading && (
              <div style={styles.loadingCard}>
                <p style={styles.loadingText}>
                  ⏳ Creating your personalized study plan...
                </p>
                <div style={styles.spinner}></div>
              </div>
            )}

            {result && !loading && (
              <div style={styles.resultsSection}>
                <h2 style={styles.resultsTitle}>📊 Your Personalized Study Plan</h2>

                {/* CHART */}
                <div style={styles.chartCard}>
                  {chartData.length === 0 ? (
                    <p style={styles.noData}>No chart data</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip />
                        <Bar
                          dataKey="value"
                          fill="#667eea"
                          radius={[10, 10, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* STUDY HOURS */}
                <div style={styles.hoursCard}>
                  <h3 style={styles.sectionTitle}>📚 Study Hours by Subject</h3>
                  <div style={styles.hoursGrid}>
                    {chartData.map((item) => (
                      <div key={item.name} style={styles.hourItem}>
                        <p style={styles.hourLabel}>{item.name}</p>
                        <p style={styles.hourValue}>{item.value} hours</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TIMETABLE */}
                <div style={styles.timetableCard}>
                  <h3 style={styles.sectionTitle}>🗓️ 7-Day Study Timetable</h3>
                  <div style={styles.timetableGrid}>
                    {result["7_day_plan"]?.message ? (
                      <p style={{ color: "red" }}>
                        ❌ {result["7_day_plan"].message}
                      </p>
                    ) : (
                      Object.entries(result["7_day_plan"] || {}).map(
                        ([day, info]) => (
                          <div key={day} style={styles.dayItem}>
                            <p style={styles.dayName}>{day}</p>
                            <p style={styles.daySubject}>{info.subject}</p>
                            <p style={styles.dayTime}>{info.hours} hrs</p>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* HISTORY TAB */
          <History user={user} />
        )}
      </main>
    </div>
  );
}

const styles = {
  appContainer: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    borderRadius: "15px",
    marginBottom: "30px",
    color: "white",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    fontSize: "32px",
    fontWeight: "bold",
    margin: "0",
  },
  tagline: {
    fontSize: "14px",
    margin: "5px 0 0 0",
    opacity: 0.9,
  },
  headerRight: {
    textAlign: "right",
  },
  userDisplay: {
    fontSize: "16px",
    marginRight: "20px",
    fontWeight: "bold",
  },
  logoutBtn: {
    padding: "10px 20px",
    background: "#ff6b6b",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  },
  tabNav: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
  },
  tabButton: {
    padding: "12px 25px",
    background: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  },
  tabButtonActive: {
    background: "white",
    color: "#667eea",
  },
  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  content: {
    display: "grid",
    gap: "30px",
  },
  formCard: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
  },
  formTitle: {
    fontSize: "24px",
    color: "#667eea",
    marginBottom: "25px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    transition: "border-color 0.3s ease",
  },
  hint: {
    fontSize: "12px",
    color: "#999",
    margin: "5px 0 0 0",
  },
  rowGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  buttonGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginTop: "25px",
  },
  generateBtn: {
    padding: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  clearBtn: {
    padding: "14px",
    background: "#f0f0f0",
    color: "#333",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  loadingCard: {
    background: "white",
    padding: "40px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
  },
  loadingText: {
    fontSize: "18px",
    color: "#667eea",
    marginBottom: "20px",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #f0f0f0",
    borderTop: "5px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  resultsSection: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
  },
  resultsTitle: {
    fontSize: "22px",
    color: "#667eea",
    marginBottom: "20px",
  },
  chartCard: {
    marginBottom: "25px",
    padding: "20px",
    background: "#f9f9f9",
    borderRadius: "10px",
  },
  noData: {
    color: "#999",
    textAlign: "center",
  },
  hoursCard: {
    marginBottom: "25px",
  },
  sectionTitle: {
    fontSize: "18px",
    color: "#667eea",
    marginBottom: "15px",
  },
  hoursGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
  },
  hourItem: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
  },
  hourLabel: {
    margin: "0",
    fontSize: "14px",
    fontWeight: "bold",
  },
  hourValue: {
    margin: "5px 0 0 0",
    fontSize: "20px",
    fontWeight: "bold",
  },
  timetableCard: {
    marginTop: "25px",
  },
  timetableGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "15px",
  },
  dayItem: {
    background: "#f0f0f0",
    padding: "15px",
    borderRadius: "10px",
    border: "2px solid #667eea",
    textAlign: "center",
  },
  dayName: {
    margin: "0",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#667eea",
  },
  daySubject: {
    margin: "8px 0",
    fontSize: "16px",
    fontWeight: "bold",
  },
  dayTime: {
    margin: "5px 0 0 0",
    fontSize: "12px",
    color: "#666",
  },
};

export default Dashboard;
