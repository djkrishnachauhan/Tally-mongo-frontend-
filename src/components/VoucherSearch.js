import React, { useEffect, useState } from "react";

const VoucherSearch = () => {
  const [ledgerList, setLedgerList] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  // ================= FETCH LEDGER LIST =================
  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    const res = await fetch("https://tally-mongo-server.onrender.com/api/ledgers");
    const data = await res.json();

    // ✅ only unique ledger names
    const names = [...new Set((data || []).map(l => l.NAME).filter(Boolean))];
    setLedgerList(names.sort());
  };

  // ================= SEARCH VOUCHERS =================
  const searchVouchers = async () => {
    if (!selectedLedger) return;

    const res = await fetch("https://tally-mongo-server.onrender.com/api/vouchers");
    const data = await res.json();

    // ✅ ONLY selected ledger vouchers
    const filtered = (data || []).filter(
      v => v.PARTYLEDGERNAME === selectedLedger
    );

    setVouchers(filtered);
    setShowPopup(true);
  };

  // ================= LEDGER GROUPING =================
  const groupLedgers = (voucher) => {
    const map = {};

    (voucher.LEDGERENTRIES || []).forEach(e => {
      const name = e.LEDGERNAME;
      if (!map[name]) map[name] = { debit: 0, credit: 0 };

      const amt = Number(e.AMOUNT?.$numberDecimal || e.AMOUNT || 0);
      if (!amt) return;

      if (amt < 0) map[name].debit += Math.abs(amt);
      else map[name].credit += amt;
    });

    return map;
  };

  const formatDate = d =>
    d ? new Date(d).toLocaleDateString("en-GB") : "";

  return (
    <div>
      {/* ===== LEDGER DROPDOWN INPUT ===== */}
      <input
        list="ledgerList"
        placeholder="Select Ledger"
        value={selectedLedger}
        onChange={e => setSelectedLedger(e.target.value)}
      />

      <datalist id="ledgerList">
        {ledgerList.map((l, i) => (
          <option key={i} value={l} />
        ))}
      </datalist>

      <button onClick={searchVouchers}>Search</button>

      {/* ================= POPUP ================= */}
      {showPopup && (
        <div style={overlay}>
          <div style={popup}>
            <button onClick={() => setShowPopup(false)}>✖</button>

            {vouchers.map((v, i) => {
              const ledgers = groupLedgers(v);

              return (
                <div key={i} style={card}>
                  {/* HEADER */}
                  <div style={header}>
                    <b>{v.VOUCHERTYPE}</b> No: {v.VOUCHERNUMBER}<br />
                    Date: {formatDate(v.DATE)}<br />
                    Party: <b>{v.PARTYLEDGERNAME}</b>
                  </div>

                  {/* INVENTORY */}
                  {v.INVENTORYENTRIES?.some(i => i.STOCKITEMNAME) && (
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

                  {/* LEDGERS */}
                  <hr />
                  <table width="100%">
                    <thead>
                      <tr>
                        <th align="left">Ledger</th>
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

                  <hr />
                  <div style={{ textAlign: "right", fontWeight: "bold" }}>
                    Total : ₹ {Number(v.AMOUNT?.$numberDecimal || 0).toFixed(2)}
                  </div>
                </div>
              );
            })}

            {vouchers.length === 0 && (
              <p>No vouchers found.</p>
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
  zIndex: 999,
  overflow: "auto"
};

const popup = {
  background: "#fff",
  width: "85%",
  margin: "30px auto",
  padding: "20px"
};

const card = {
  border: "1px solid #000",
  padding: "15px",
  marginBottom: "20px"
};

const header = {
  fontWeight: "bold",
  marginBottom: "10px"
};

export default VoucherSearch;
