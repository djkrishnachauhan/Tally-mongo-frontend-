import React, { useState } from "react";

const VoucherSearch = () => {
  const [ledgerName, setLedgerName] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const searchVouchers = async () => {
    if (!ledgerName) return;

    const res = await fetch("https://tally-mongo-server.onrender.com/api/vouchers");
    const data = await res.json();

    // ✅ show only vouchers where selected ledger exists
    const filtered = (data || []).filter(v =>
      (v.LEDGERENTRIES || []).some(le => le.LEDGERNAME === ledgerName)
    );

    setVouchers(filtered);
    setShowPopup(true);
  };

  // ✅ merge ledger entries + debit/credit by sign
  const getGroupedLedgers = (voucher) => {
    const grouped = {};

    (voucher.LEDGERENTRIES || []).forEach(entry => {
      const name = entry.LEDGERNAME;
      if (!grouped[name]) grouped[name] = { debit: 0, credit: 0 };

      let amt = entry.AMOUNT?.$numberDecimal
        ? parseFloat(entry.AMOUNT.$numberDecimal)
        : parseFloat(entry.AMOUNT);

      if (isNaN(amt)) return;

      if (amt < 0) {
        grouped[name].debit += Math.abs(amt);
      } else {
        grouped[name].credit += Math.abs(amt);
      }
    });

    return grouped;
  };

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString("en-GB");
  };

  return (
    <div>
      <input
        placeholder="Enter Ledger Name"
        value={ledgerName}
        onChange={e => setLedgerName(e.target.value)}
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
                    v.INVENTORYENTRIES.some(x => x.STOCKITEMNAME) && (
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
                                    ₹{" "}
                                    {parseFloat(
                                      it.AMOUNT?.$numberDecimal || 0
                                    ).toFixed(2)}
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
                            {ledgers[name].debit
                              ? "₹ " + ledgers[name].debit.toFixed(2)
                              : ""}
                          </td>
                          <td align="right">
                            {ledgers[name].credit
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
                    Total : ₹{" "}
                    {parseFloat(v.AMOUNT?.$numberDecimal || 0).toFixed(2)}
                  </div>
                </div>
              );
            })}
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
