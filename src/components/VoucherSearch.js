import React, { useState } from "react";

const VoucherSearch = () => {
  const [partyName, setPartyName] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  // ================= SEARCH (PARTY WISE ONLY) =================
  const searchVouchers = async () => {
    if (!partyName) return;

    const res = await fetch("https://tally-mongo-server.onrender.com/api/vouchers");
    const data = await res.json();

    // ✅ ONLY party-wise filter
    const filtered = (data || []).filter(
      v => v.PARTYLEDGERNAME === partyName
    );

    setVouchers(filtered);
    setShowPopup(true);
  };

  // ================= LEDGER GROUPING (SIGN BASED) =================
  const getGroupedLedgers = (voucher) => {
    const grouped = {};

    (voucher.LEDGERENTRIES || []).forEach(entry => {
      const name = entry.LEDGERNAME;
      if (!grouped[name]) {
        grouped[name] = { debit: 0, credit: 0 };
      }

      let rawAmount = 0;

      if (entry.AMOUNT && typeof entry.AMOUNT === "object") {
        rawAmount = Number(entry.AMOUNT.$numberDecimal);
      } else {
        rawAmount = Number(entry.AMOUNT);
      }

      if (isNaN(rawAmount) || rawAmount === 0) return;

      // 🔴 FINAL RULE
      if (rawAmount < 0) {
        grouped[name].debit += Math.abs(rawAmount);
      } else {
        grouped[name].credit += rawAmount;
      }
    });

    return grouped;
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-GB");
  };

  return (
    <div>
      <input
        placeholder="Enter Party Name"
        value={partyName}
        onChange={e => setPartyName(e.target.value)}
      />
      <button onClick={searchVouchers}>Search</button>

      {showPopup && (
        <div style={overlay}>
          <div style={popup}>
            <button onClick={() => setShowPopup(false)}>✖</button>

            {vouchers.map((v, i) => {
              const ledgers = getGroupedLedgers(v);

              return (
                <div key={i} style={card}>
                  {/* ===== HEADER ===== */}
                  <div style={header}>
                    <b>{v.VOUCHERTYPE}</b> &nbsp; No: {v.VOUCHERNUMBER}<br />
                    Date: {formatDate(v.DATE)}<br />
                    Party: <b>{v.PARTYLEDGERNAME}</b>
                  </div>

                  {/* ===== INVENTORY FIRST ===== */}
                  {v.INVENTORYENTRIES &&
                    v.INVENTORYENTRIES.some(it => it.STOCKITEMNAME) && (
                      <>
                        <hr />
                        <table width="100%">
                          <thead>
                            <tr>
                              <th align="left">Item</th>
                              <th>Qty</th>
                              <th>Rate</th>
                              <th align="right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {v.INVENTORYENTRIES.map((it, idx) =>
                              it.STOCKITEMNAME ? (
                                <tr key={idx}>
                                  <td>{it.STOCKITEMNAME}</td>
                                  <td>{it.BILLEDQTY}</td>
                                  <td>{it.RATE}</td>
                                  <td align="right">
                                    ₹ {Number(it.AMOUNT?.$numberDecimal || 0).toFixed(2)}
                                  </td>
                                </tr>
                              ) : null
                            )}
                          </tbody>
                        </table>
                      </>
                    )}

                  {/* ===== LEDGERS ===== */}
                  <hr />
                  <table width="100%">
                    <thead>
                      <tr>
                        <th align="left">Ledger Name</th>
                        <th align="right">Debit</th>
                        <th align="right">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(ledgers).map((name, idx) => (
                        <tr key={idx}>
                          <td>{name}</td>
                          <td align="right">
                            {ledgers[name].debit > 0
                              ? "₹ " + ledgers[name].debit.toFixed(2)
                              : ""}
                          </td>
                          <td align="right">
                            {ledgers[name].credit > 0
                              ? "₹ " + ledgers[name].credit.toFixed(2)
                              : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* ===== TOTAL ===== */}
                  <hr />
                  <div style={{ textAlign: "right", fontWeight: "bold" }}>
                    Total : ₹ {Number(v.AMOUNT?.$numberDecimal || 0).toFixed(2)}
                  </div>
                </div>
              );
            })}

            {vouchers.length === 0 && (
              <p>No vouchers found for this party.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== STYLES ===== */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  overflow: "auto",
  zIndex: 999
};

const popup = {
  background: "#fff",
  margin: "30px auto",
  padding: "20px",
  width: "85%"
};

const card = {
  border: "1px solid #000",
  padding: "15px",
  marginBottom: "20px"
};

const header = {
  marginBottom: "10px",
  fontWeight: "bold"
};

export default VoucherSearch;
