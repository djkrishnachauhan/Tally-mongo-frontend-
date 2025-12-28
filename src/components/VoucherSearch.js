import React, { useEffect, useState } from "react";

const API = "https://tally-mongo-server.onrender.com";

const VoucherSearch = () => {
  const [ledgerList, setLedgerList] = useState([]);
  const [selectedLedger, setSelectedLedger] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= FETCH LEDGERS ON LOAD =================
  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    try {
      const res = await fetch(`${API}/api/ledgers`);
      const data = await res.json();

      const names = [
        ...new Set(
          (data || [])
            .map(l => l.NAME)
            .filter(n => n && n.trim() !== "")
        )
      ].sort();

      setLedgerList(names);
    } catch (e) {
      console.error("Ledger fetch error", e);
    }
  };

  // ================= SEARCH VOUCHERS =================
  const searchVouchers = async () => {
    if (!selectedLedger) {
      alert("Please select a ledger");
      return;
    }

    setLoading(true);
    setShowPopup(true);

    try {
      const res = await fetch(`${API}/api/vouchers`);
      const data = await res.json();

      const filtered = (data || []).filter(v =>
        v.LEDGERENTRIES?.some(
          le => le.LEDGERNAME === selectedLedger
        )
      );

      setVouchers(filtered);
    } catch (e) {
      console.error("Voucher fetch error", e);
      setVouchers([]);
    }

    setLoading(false);
  };

  // ================= GROUP LEDGER ENTRIES =================
  const groupLedgers = entries => {
    const map = {};

    (entries || []).forEach(e => {
      const name = e.LEDGERNAME;
      if (!map[name]) map[name] = { debit: 0, credit: 0 };

      const amt = Number(e.AMOUNT?.$numberDecimal || e.AMOUNT || 0);
      if (amt < 0) map[name].debit += Math.abs(amt);
      else map[name].credit += amt;
    });

    return map;
  };

  const fmt = n => n.toLocaleString("en-IN", { minimumFractionDigits: 2 });

  // ================= UI =================
  return (
    <div>
      {/* ===== LEDGER SELECT ===== */}
      <select
        value={selectedLedger}
        onChange={e => setSelectedLedger(e.target.value)}
      >
        <option value="">-- Select Ledger --</option>
        {ledgerList.map((l, i) => (
          <option key={i} value={l}>{l}</option>
        ))}
      </select>

      <button onClick={searchVouchers}>Search</button>

      {/* ===== POPUP ===== */}
      {showPopup && (
        <div style={overlay}>
          <div style={popup}>
            <button onClick={() => setShowPopup(false)}>✖</button>

            {loading && <p>Loading vouchers...</p>}

            {!loading && vouchers.length === 0 && (
              <p>No vouchers found</p>
            )}

            {!loading && vouchers.map((v, i) => {
              const ledgers = groupLedgers(v.LEDGERENTRIES);

              return (
                <div key={i} style={card}>
                  {/* ===== HEADER ===== */}
                  <div style={header}>
                    {v.VOUCHERTYPE} &nbsp; No: {v.VOUCHERNUMBER}<br />
                    Date: {new Date(v.DATE).toLocaleDateString("en-GB")}<br />
                    Party: <b>{v.PARTYLEDGERNAME}</b>
                  </div>

                  {/* ===== INVENTORY ===== */}
                  {v.INVENTORYENTRIES?.some(x => x.STOCKITEMNAME) && (
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
                                  ₹ {fmt(Number(it.AMOUNT?.$numberDecimal || 0))}
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
                              ? `₹ ${fmt(ledgers[name].debit)}`
                              : ""}
                          </td>
                          <td align="right">
                            {ledgers[name].credit
                              ? `₹ ${fmt(ledgers[name].credit)}`
                              : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <hr />
                  <div style={{ textAlign: "right", fontWeight: "bold" }}>
                    Total : ₹ {fmt(Number(v.AMOUNT?.$numberDecimal || 0))}
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
