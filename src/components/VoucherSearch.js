import React, { useEffect, useRef, useState } from "react";
import api from "../api";

/* ================= MAIN ================= */

export default function VoucherSearch() {
  const [party, setParty] = useState("");
  const [vouchers, setVouchers] = useState([]);
  const [open, setOpen] = useState(false);

  const search = async () => {
    if (!party) return alert("Enter party name");

    const res = await api.get("/api/vouchers", {
      params: { party }
    });

    setVouchers(res.data || []);
    setOpen(true);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Ledger Voucher Search</h2>

      <input
        value={party}
        onChange={e => setParty(e.target.value)}
        placeholder="Party Ledger Name"
      />
      <button onClick={search} style={{ marginLeft: 10 }}>
        Search
      </button>

      {open && (
        <VoucherModal
          vouchers={vouchers}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

/* ================= MODAL ================= */

function VoucherModal({ vouchers, onClose }) {
  const modalRef = useRef(null);

  // ESC close
  useEffect(() => {
    const esc = e => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  // Outside click
  const outsideClick = e => {
    if (!modalRef.current) return;
    if (!modalRef.current.contains(e.target)) onClose();
  };

  return (
    <div style={overlay} onClick={outsideClick}>
      <div
        ref={modalRef}
        style={modal}
        onClick={e => e.stopPropagation()}
      >
        <div style={header}>
          <b>Voucher Display (Tally Style)</b>
          <button onClick={onClose}>✖</button>
        </div>

        <div style={body}>
          {vouchers.length === 0 && <p>No vouchers found</p>}

          {vouchers.map((v, i) => (
            <VoucherCard key={v.GUID || i} v={v} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= VOUCHER ================= */

function VoucherCard({ v }) {
  return (
    <div style={voucherBox}>
      <Row label="Voucher Type" value={v.VOUCHERTYPENAME} />
      <Row label="Voucher No" value={v.VOUCHERNUMBER} />
      <Row label="Date" value={v.DATE} />
      <Row label="Party A/c" value={v.PARTYLEDGERNAME} />

      {/* Ledger Entries */}
      <Section title="Ledger Entries">
        <table width="100%" border="1" cellPadding="5">
          <thead>
            <tr>
              <th align="left">Ledger Name</th>
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

      {/* Inventory Entries */}
      {v.INVENTORYENTRIES?.length > 0 && (
        <Section title="Inventory Entries">
          <table width="100%" border="1" cellPadding="5">
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

      {v.NARRATION && (
        <Section title="Narration">
          <div>{v.NARRATION}</div>
        </Section>
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", marginBottom: 4 }}>
      <b style={{ width: 140 }}>{label} :</b>
      <span>{value}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 10 }}>
      <b>{title}</b>
      <div>{children}</div>
    </div>
  );
}

/* ================= STYLES ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  zIndex: 1000
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

const voucherBox = {
  border: "2px solid black",
  padding: 10,
  marginBottom: 20
};
