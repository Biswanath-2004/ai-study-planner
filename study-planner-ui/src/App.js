import React, { useState } from "react";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  return <Dashboard user="Guest" token={null} onLogout={() => {}} />;
}

export default App;