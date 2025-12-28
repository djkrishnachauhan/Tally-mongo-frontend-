import React, { useState } from "react";

const PartyTotal = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [partyTotals, setPartyTotals] = useState([]);
  const [error, setError] = useState("");

  const fetchPartyTotals = async () => {
    setShowPopup(true);      // popup open ONLY on button click
    setLoading(true);
    setError("");
    setPartyTotals([]);

    try {
      const res = await fetch("https://tally-mongo-server.onrender.com/api/vouchers");
      const vouchers = await res.json();

      const totalsMap = {};

      vouchers.forEach(voucher => {
        const party = voucher.PARTYLEDGERNAME;
        if (!party) return;

        if (!totalsMap[party]) {
          totalsMap[party] = 0;
        }

        (voucher.LEDGERENTRIES || []).forEach(entry => {
          if (entry.LEDGERNAME === party) {
            let amt = entry.AMOUNT;

            if (amt && typeof amt === "object" && amt.$numberDecimal) {
              amt = parseFloat(amt.$numberDecimal);
            } else {
              amt = parseFloat(amt);
            }

            if (!isNaN(amt)) {
              totalsMap[party] += amt;
            }
          }
        });
      });

      const result = Object.keys(totalsMap).map(name => ({
        name,
        total: totalsMap[name]
      }));

      setPartyTotals(result);
    } catch (err) {
      setError("Failed to load party totals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* BUTTON */}
      <button onClick={fetchPartyTotals}>
        View Party Totals
      </button>

      {/* POPUP */}
      {showPopup && (
        <div style={overlayStyle}>
          <div style={popupStyle}>
            <div style={headerStyle}>
              <h2>Party Wise Totals</h2>
              <button onClick={() => setShowPopup(false)}>✖</button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && partyTotals.length === 0 && (
              <p>No data found</p>
            )}

            <div style={gridStyle}>
              {partyTotals.map((p, i) => (
                <div key={i} style={cardStyle}>
                  <h3>{p.name}</h3>
                  <p style={{ color: "green", fontWeight: "bold" }}>
                    ₹ {p.total.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

/* ===== INLINE STYLES (NO CSS FILE NEEDED) ===== */

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999
};

const popupStyle = {
  background: "#fff",
  width: "80%",
  maxHeight: "80%",
  overflowY: "auto",
  borderRadius: "8px",
  padding: "20px"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "15px"
};

const cardStyle = {
  border: "1px solid #ccc",
  borderRadius: "6px",
  padding: "15px",
  textAlign: "center"
};

export default PartyTotal;
    
