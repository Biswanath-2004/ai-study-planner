import React, { useState, useEffect } from "react";

function History({ user }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // ✅ Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/history?username=${user}`);

      const data = await response.json();
      setPlans(data.history || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/plans/${planId}?username=${user}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setPlans(plans.filter((p) => p.plan_id !== planId));
        alert("Plan deleted successfully ✅");
      } else {
        alert("Failed to delete plan ❌");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>⏳ Loading your study plans...</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <p style={styles.emptyIcon}>📚</p>
        <h2>No Study Plans Yet</h2>
        <p>Create your first study plan to get started!</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📋 Your Study Plans History</h2>
      <p style={styles.subtitle}>Total Plans: <strong>{plans.length}</strong></p>

      <div style={styles.plansList}>
        {plans.map((plan) => (
          <div key={plan.plan_id} style={styles.planCard}>
            {/* HEADER */}
            <div
              style={styles.planHeader}
              onClick={() =>
                setExpandedId(
                  expandedId === plan.plan_id ? null : plan.plan_id
                )
              }
            >
              <div style={styles.planInfo}>
                <h3 style={styles.planTitle}>
                  📊 {plan.subjects.join(", ")}
                </h3>
                <p style={styles.planDate}>
                  {formatDate(plan.created_at)}
                </p>
              </div>
              <div style={styles.planStats}>
                <span style={styles.stat}>
                  🕐 {plan.days_left} days
                </span>
                <span style={styles.stat}>
                  ⏱️ {plan.total_hours} hrs
                </span>
              </div>
              <span style={styles.expandIcon}>
                {expandedId === plan.plan_id ? "▼" : "▶"}
              </span>
            </div>

            {/* EXPANDED CONTENT */}
            {expandedId === plan.plan_id && (
              <div style={styles.planDetails}>
                {/* STUDY HOURS */}
                <div style={styles.section}>
                  <h4 style={styles.sectionTitle}>📚 Study Hours Per Subject</h4>
                  <div style={styles.hoursGrid}>
                    {Object.entries(plan.study_plan).map(([subject, hours]) => (
                      <div key={subject} style={styles.hourCard}>
                        <p style={styles.hourSubject}>{subject}</p>
                        <p style={styles.hourValue}>{hours} hrs</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TIMETABLE */}
                <div style={styles.section}>
                  <h4 style={styles.sectionTitle}>🗓️ 7 Day Timetable</h4>
                  <div style={styles.timetableGrid}>
                    {Object.entries(plan.timetable || {}).map(([day, info]) => (
                      <div key={day} style={styles.dayCard}>
                        <p style={styles.dayLabel}>{day}</p>
                        <p style={styles.daySubject}>{info.subject}</p>
                        <p style={styles.dayHours}>{info.hours} hrs</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DELETE BUTTON */}
                <button
                  style={styles.deleteButton}
                  onClick={() => deletePlan(plan.plan_id)}
                >
                  🗑️ Delete Plan
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    background: "#f4f7fb",
    minHeight: "100vh",
  },

  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "10px",
    textAlign: "center",
  },

  subtitle: {
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
    marginBottom: "30px",
  },

  loadingText: {
    textAlign: "center",
    fontSize: "16px",
    color: "#666",
    marginTop: "50px",
  },

  emptyContainer: {
    textAlign: "center",
    padding: "80px 30px",
    background: "#f4f7fb",
    minHeight: "100vh",
  },

  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },

  plansList: {
    maxWidth: "1000px",
    margin: "0 auto",
  },

  planCard: {
    background: "white",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
    transition: "all 0.3s ease",
  },

  planHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    cursor: "pointer",
    userSelect: "none",
    transition: "all 0.3s ease",
  },

  planInfo: {
    flex: 1,
    marginRight: "20px",
  },

  planTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
  },

  planDate: {
    margin: "8px 0 0 0",
    fontSize: "12px",
    opacity: 0.9,
  },

  planStats: {
    display: "flex",
    gap: "15px",
    marginRight: "20px",
  },

  stat: {
    background: "rgba(255,255,255,0.2)",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  expandIcon: {
    fontSize: "16px",
    marginLeft: "10px",
  },

  planDetails: {
    padding: "30px",
    background: "#f9f9f9",
    borderTop: "1px solid #eee",
  },

  section: {
    marginBottom: "30px",
  },

  sectionTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "15px",
    marginTop: 0,
  },

  hoursGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
  },

  hourCard: {
    background: "white",
    padding: "15px",
    borderRadius: "8px",
    border: "2px solid #667eea",
    textAlign: "center",
  },

  hourSubject: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "bold",
    color: "#667eea",
  },

  hourValue: {
    margin: "8px 0 0 0",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },

  timetableGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "12px",
  },

  dayCard: {
    background: "white",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    textAlign: "center",
  },

  dayLabel: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "bold",
    color: "#666",
    textTransform: "uppercase",
  },

  daySubject: {
    margin: "8px 0",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
  },

  dayHours: {
    margin: "5px 0 0 0",
    fontSize: "12px",
    color: "#764ba2",
  },

  deleteButton: {
    padding: "12px 24px",
    background: "#ff6b6b",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    marginTop: "20px",
    transition: "all 0.3s ease",
  },
};

export default History;
