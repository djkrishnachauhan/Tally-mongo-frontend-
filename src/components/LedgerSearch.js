import React, { useState } from "react";
import api from "../api";

export default function LedgerSearch() {
  const [name, setName] = useState("");
  const [data, setData] = useState([]);

  const load = async () => {
    const res = await api.get("/api/ledgers", {
      params: { name }
    });
    setData(res.data);
  };

  return (
    <div>
      <h2>Ledger Search</h2>
      <input placeholder="Ledger Name" onChange={e => setName(e.target.value)} />
      <button onClick={load}>Search</button>
      <pre>{JSON.stringify(data.slice(0, 5), null, 2)}</pre>
    </div>
  );
}
