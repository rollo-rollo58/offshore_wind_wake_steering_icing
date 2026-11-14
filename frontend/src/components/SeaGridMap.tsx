"use client";

import { useState } from "react";
import type { Farm, Snapshot } from "@/types/domain";

type Props = { farm: Farm | null; snapshot: Snapshot | null };

export function SeaGridMap({ farm, snapshot }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const turbines = farm?.turbines ?? [];
  const readings = new Map(snapshot?.turbines.map((t) => [t.turbine_id, t]) ?? []);
  const chosen = selected ? readings.get(selected) : null;
  return (
    <section className="panel overflow-hidden p-5 lg:col-span-2">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="eyebrow uppercase">Geospatial operations</p>
          <h2 className="mt-1 text-xl font-semibold">North Shoal array topology</h2>
        </div>
        <span className="muted text-xs">Local Cartesian coordinates</span>
      </div>
      <div className="mini-grid rounded-xl bg-[#092335]">
        <svg viewBox="0 0 800 450" className="h-80 w-full" role="img"
          aria-label="Clickable wind turbine layout with relative output">
          <defs>
            <linearGradient id="seaFlow" x1="0" x2="1">
              <stop stopColor="#0b3543" /><stop offset="1" stopColor="#092032" />
            </linearGradient>
          </defs>
          <rect width="800" height="450" fill="url(#seaFlow)" fillOpacity=".7" />
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <path key={row} d={`M0 ${70 + row * 68} Q400 ${35 + row * 68} 800
              ${70 + row * 68}`} fill="none" stroke="#214b58" strokeWidth="2" />
          ))}
          {turbines.map((turbine) => {
            const x = 90 + turbine.x_m * 0.2;
            const y = 55 + turbine.y_m * 0.17;
            const reading = readings.get(turbine.turbine_id);
            const strength = Math.max(0.25, (reading?.net_power_kw ?? 0) / 8500);
            return (
              <g key={turbine.turbine_id} tabIndex={0} role="button"
                aria-label={`Select ${turbine.turbine_id}`}
                onClick={() => setSelected(turbine.turbine_id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setSelected(turbine.turbine_id);
                }} className="cursor-pointer">
                <circle cx={x} cy={y} r={31} fill="#68e3d5"
                  fillOpacity={0.06 + strength * 0.18} />
                <circle cx={x} cy={y} r={20} fill="none" stroke="#68e3d5"
                  strokeWidth={selected === turbine.turbine_id ? 3 : 1.5} />
                {[0, 120, 240].map((angle) => (
                  <line key={angle} x1={x} y1={y}
                    x2={x + Math.cos((angle * Math.PI) / 180) * 18}
                    y2={y + Math.sin((angle * Math.PI) / 180) * 18}
                    stroke="#b8fff0" strokeWidth="2.5" />
                ))}
                <circle cx={x} cy={y} r={4} fill="#eafff9" />
                <text x={x} y={y + 43} fontSize="11" textAnchor="middle"
                  fill="#cae2e2">{turbine.turbine_id.slice(3)}</text>
              </g>
            );
          })}
          <path d="M38 390 L118 390" stroke="#ffd07a" strokeWidth="4" />
          <path d="M118 390 L103 381 M118 390 L103 399" stroke="#ffd07a"
            strokeWidth="3" />
          <text x="38" y="415" fontSize="11" fill="#ffd07a">EAST</text>
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs muted">
        <span>12 turbines · 102 MW rated · 3 strings</span>
        <span>{chosen ? `${selected}: ${chosen.net_power_kw.toFixed(0)} kW` :
          "Select a turbine for output"}</span>
      </div>
    </section>
  );
}
