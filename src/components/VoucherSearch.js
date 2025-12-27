import React, { useState } from "react";
import api from "../api";

export default function VoucherSearch() {
  const [party, setParty] = useState("");
  const [data, setData] = useState([]);

  const load = async () => {
    const res = await api.get("/api/vouchers", {
      params: { party }
    });
    setData(res.data);
  };

  return (
    <div>
      <h2>Voucher Search</h2>
      <input placeholder="Party Name" onChange={e => setParty(e.target.value)} />
      <button onClick={load}>Search</button>
      <pre>{JSON.stringify(data.slice(0, 5), null, 2)}</pre>
    </div>
  );
}
