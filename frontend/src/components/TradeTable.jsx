import React from 'react';

export function TradeTable({ trades }) {
  return (
    <div>
      <h3>Trades</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Direction</th>
            <th>PnL</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, idx) => (
            <tr key={idx}>
              <td>{trade.date}</td>
              <td>{trade.direction}</td>
              <td>{trade.pnl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
