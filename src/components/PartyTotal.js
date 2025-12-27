import React, { useState } from "react";
import api from "../api";

export default function PartyTotal() {
  const [data, setData] = useState([]);

  const load = async () => {
    const res = await api.get("/api/reports/party-total");
    setData(res.data);
  };

  return (
    <div>
      <h2>Party Wise Total</h2>
      <button onClick={load}>Load</button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
