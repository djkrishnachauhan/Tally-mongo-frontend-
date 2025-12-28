import React, { useEffect, useState } from "react";
import api from "../api";

export default function PartyTotal() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTotals();
  }, []);

  const fetchTotals = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/reports/party-total");
      if (!Array.isArray(res.data)) throw new Error("Invalid response");
      setData(res.data);
    } catch (e) {
      setError("Failed to load party totals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Party Wise Total</h2>
      <button onClick={() => setShowModal(true)}>View Party Totals</button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.header}>
              <h3>Party Wise Totals</h3>
              <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
                ✖
              </button>
            </div>

            <div style={styles.container}>
              {data.map((p, i) => (
                <div key={i} style={styles.card}>
                  <div style={styles.partyName}>{p._id}</div>
                  <div style={styles.amount}>₹ {Number(p.total).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#fff",
    width: "90%",
    maxWidth: "900px",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: "8px",
    padding: "12px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #ccc",
    marginBottom: "8px",
  },
  closeBtn: {
    background: "red",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    padding: "4px 8px",
  },
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "10px",
  },
  card: {
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "12px",
    background: "#f9f9f9",
    textAlign: "center",
  },
  partyName: {
    fontWeight: "bold",
    marginBottom: "6px",
  },
  amount: {
    fontSize: "18px",
    color: "green",
  },
};
