import React, { useState } from "react";
import api from "../api";

const getDecimal = (val) => {
  if (!val) return "0.00";
  if (typeof val === "object" && val.$numberDecimal)
    return val.$numberDecimal;
  return val;
};

export default function VoucherSearch() {
  const [ledger, setLedger] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const searchVouchers = async () => {
    if (!ledger.trim()) return;

    setLoading(true);
    setError("");
    setVouchers([]);

    try {
      const res = await api.get("/api/vouchers", {
        params: { party: ledger },
      });

      if (!Array.isArray(res.data)) {
        throw new Error("Invalid response");
      }

      setVouchers(res.data);
      setShowModal(true);
    } catch (e) {
      setError("Voucher fetch failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Search Vouchers by Ledger</h2>

      <input
        value={ledger}
        onChange={(e) => setLedger(e.target.value)}
        placeholder="Enter Ledger Name"
      />
      <button onClick={searchVouchers}>Search</button>

      {loading && <p>Fetching vouchers...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.header}>
              <h3>Vouchers ({vouchers.length})</h3>
              <button
                style={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                ✖
              </button>
            </div>

            <div style={styles.container}>
              {vouchers.map((v) => (
                <div key={v._id} style={styles.card}>
                  <div style={styles.topRow}>
                    <div>
                      <b>{v.VOUCHERTYPE}</b>
                      <div>Voucher No: {v.VOUCHERNUMBER}</div>
                    </div>
                    <div>
                      {new Date(v.DATE).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={styles.party}>
                    <b>Party:</b> {v.PARTYLEDGERNAME}
                  </div>

                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th align="left">Ledger</th>
                        <th align="right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {v.LEDGERENTRIES?.map((l, i) => (
                        <tr key={i}>
                          <td>{l.LEDGERNAME}</td>
                          <td align="right">
                            {getDecimal(l.AMOUNT)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={styles.total}>
                    <b>Total:</b> ₹ {getDecimal(v.AMOUNT)}
                  </div>
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
    maxWidth: "1100px",
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
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "10px",
  },
  card: {
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "8px",
    background: "#f9f9f9",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  party: {
    marginBottom: "4px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "4px",
  },
  total: {
    textAlign: "right",
    marginTop: "6px",
    fontSize: "15px",
  },
};
