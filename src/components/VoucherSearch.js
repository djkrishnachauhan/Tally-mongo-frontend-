import React, { useEffect, useRef, useState } from "react";
import api from "../api";

export default function VoucherSearch() {
  const [party, setParty] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const res = await api.get("/api/vouchers", { params: { party } });
    setVouchers(res.data);
    setShowModal(true);
  };

  return (
    <div>
      <h2>Party Voucher Search</h2>

      <input
        placeholder="Party Ledger Name"
        value={party}
        onChange={e => setParty(e.target.value)}
      />
      <button onClick={load}>Search</button>

      {showModal && (
        <VoucherModal
          vouchers={vouchers}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

/* ================= MODAL ================= */

function VoucherModal({ vouchers, onClose }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [active, setActive] = useState(0);
  const modalRef = useRef();

  /* ESC + Keyboard nav */
  useEffect(() => {
    const handler = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown")
        setActive(a => Math.min(a + 1, vouchers.length - 1));
      if (e.key === "ArrowUp")
        setActive(a => Math.max(a - 1, 0));
      if (e.key === "Enter") window.print();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [vouchers.length, onClose]);

  /* Click outside */
  const outside = e => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div style={overlay} onMouseDown={outside}>
      <div
        ref={modalRef}
        style={{ ...modal, ...(fullscreen ? fullscreenStyle : {}) }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={header}>
          <b>Voucher Display</b>
          <div>
            <button onClick={() => setFullscreen(f => !f)}>
              {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>
            <button onClick={() => window.print()}>Print</button>
            <button onClick={onClose}>✖</button>
          </div>
        </div>

        {/* Body */}
        <div style={body}>
          {vouchers.map((v, i) => (
            <div
              key={v.GUID || i}
              style={{
                outline: i === active ? "2px solid blue" : "none"
              }}
            >
              <VoucherCard v={v} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= VOUCHER ================= */

function VoucherCard({ v }) {
  return (
    <div style={{ border: "2px solid black", marginBottom: 20, padding: 10 }}>
      <Row label="Voucher Type" value={v.VOUCHERTYPENAME} />
      <Row label="Voucher No" value={v.VOUCHERNUMBER} />
      <Row label="Date" value={v.DATE} />
      <Row label="Party A/c" value={v.PARTYLEDGERNAME} />

      <Section title="Ledger Entries">
        <table width="100%" border="1">
          <thead>
            <tr>
              <th align="left">Ledger</th>
              <th align="right">Debit</th>
              <th align="right">Credit</th>
            </tr>
          </thead>
          <tbody>
            {v.LEDGERENTRIES?.map((l, i) => (
              <tr key={i}>
                <td>{l.LEDGERNAME}</td>
                <td align="right">{l.DEBIT || ""}</td>
                <td align="right">{l.CREDIT || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {v.INVENTORYENTRIES?.length > 0 && (
        <Section title="Inventory Entries">
          <table width="100%" border="1">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Rate</th>
                <th align="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {v.INVENTORYENTRIES.map((it, i) => (
                <tr key={i}>
                  <td>{it.ITEMNAME}</td>
                  <td>{it.QTY}</td>
                  <td>{it.RATE}</td>
                  <td align="right">{it.AMOUNT}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {v.NARRATION && <Section title="Narration">{v.NARRATION}</Section>}
    </div>
  );
}

/* ================= HELPERS ================= */

const Row = ({ label, value }) => (
  <div style={{ display: "flex" }}>
    <b style={{ width: 140 }}>{label} :</b> {value}
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ marginTop: 10 }}>
    <b>{title}</b>
    <div>{children}</div>
  </div>
);

/* ================= STYLES ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  zIndex: 999
};

const modal = {
  background: "#fff",
  width: "90%",
  maxWidth: 1000,
  margin: "30px auto",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column"
};

const fullscreenStyle = {
  width: "100%",
  height: "100%",
  margin: 0,
  maxWidth: "100%"
};

const header = {
  padding: 10,
  borderBottom: "1px solid black",
  display: "flex",
  justifyContent: "space-between"
};

const body = {
  padding: 10,
  overflowY: "auto",
  flex: 1
};
