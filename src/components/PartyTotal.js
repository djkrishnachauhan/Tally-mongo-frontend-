
import React, { useState } from "react";

const PartyTotal = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [partyTotals, setPartyTotals] = useState([]);
  const [error, setError] = useState("");

  const fetchPartyTotals = async () => {
    try {
      setLoading(true);
      setError("");
      setPartyTotals([]);

      const res = await fetch("https://tally-mongo-server.onrender.com/api/vouchers");
      const data = await res.json();

      const totalsMap = {};

      data.forEach(voucher => {
        const partyName = voucher.PARTYLEDGERNAME;
        if (!partyName) return;

        if (!totalsMap[partyName]) totalsMap[partyName] = 0;

        (voucher.LEDGERENTRIES || []).forEach(entry => {
          if (entry.LEDGERNAME === partyName) {
            let amt = entry.AMOUNT;

            if (amt && typeof amt === "object" && amt.$numberDecimal) {
              amt = parseFloat(amt.$numberDecimal);
            } else {
              amt = parseFloat(amt);
            }

            if (!isNaN(amt)) {
              totalsMap[partyName] += amt;
            }
          }
        });
      });

      const result = Object.entries(totalsMap).map(([name, total]) => ({
        name,
        total
      }));

      setPartyTotals(result);
      setShowPopup(true);
    } catch (e) {
      setError("Failed to fetch party totals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchPartyTotals}>
        View Party Totals
      </button>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-header">
              <h2>Party Wise Totals</h2>
              <button onClick={() => setShowPopup(false)}>X</button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className="card-grid">
              {partyTotals.map((p, i) => (
                <div key={i} className="card">
                  <h3>{p.name}</h3>
                  <p>₹ {p.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyTotal;
