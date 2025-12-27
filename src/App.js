import React from "react";
import VoucherSearch from "./components/VoucherSearch";
import PartyTotal from "./components/PartyTotal";
import LedgerSearch from "./components/LedgerSearch";

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Tally API Dashboard</h1>
      <VoucherSearch />
      <hr />
      <PartyTotal />
      <hr />
      <LedgerSearch />
    </div>
  );
}
