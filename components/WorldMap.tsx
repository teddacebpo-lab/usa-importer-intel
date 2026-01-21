import React, { useState, useMemo, useRef } from 'react';
import type { TradePartner } from '../types';

interface WorldMapProps {
  partners: TradePartner[];
  onCountryClick: (country: string) => void;
}

interface TooltipData {
  country: string;
  volume: string;
  x: number;
  y: number;
}

const mapPaths: { [key: string]: string } = {
    "United States": "M150,150 L280,150 L280,220 L150,220 Z",
    "China": "M680,180 L800,180 L800,260 L680,260 Z",
    "Vietnam": "M750,260 L765,260 L765,310 L750,310 Z",
    "India": "M650,260 L710,260 L710,330 L650,330 Z",
    "Germany": "M500,140 L530,140 L530,180 L500,180 Z",
    "Mexico": "M180,220 L240,220 L240,260 L180,260 Z",
    "Canada": "M150,80 L280,80 L280,150 L150,150 Z",
    "Brazil": "M280,320 L380,320 L380,420 L280,420 Z",
    "South Korea": "M780,190 L800,190 L800,210 L780,210 Z",
    "Taiwan": "M780,240 L795,240 L795,255 L780,255 Z",
    "Italy": "M510,180 L525,180 L525,210 L510,210 Z",
    "United Kingdom": "M470,120 L495,120 L495,150 L470,150 Z"
};

export const WorldMap: React.FC<WorldMapProps> = ({ partners, onCountryClick }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const partnersMap = useMemo(() => {
    const map = new Map<string, TradePartner>();
    partners.forEach(p => map.set(p.country, p));
    return map;
  }, [partners]);
  
  const handleCountryHover = (e: React.MouseEvent, countryName: string) => {
    const partnerData = partnersMap.get(countryName);
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip({
            country: countryName,
            volume: partnerData ? partnerData.tradeVolume : 'No Activity',
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    }
  };

  return (
    <div ref={containerRef} className="relative bg-slate-900/60 rounded-xl p-4 border border-slate-700/50" onMouseLeave={() => setTooltip(null)}>
      <svg viewBox="0 0 960 500" className="w-full h-auto">
        <g>
          {Object.entries(mapPaths).map(([name, path]) => {
            const partnerData = partnersMap.get(name);
            const isActive = !!partnerData;
            return (
              <path
                key={name}
                d={path}
                fill={isActive ? "#f97316" : "#334155"}
                fillOpacity={isActive ? "0.9" : "0.3"}
                className="transition-all duration-300 hover:fill-blue-500 cursor-pointer"
                stroke="#1e293b"
                strokeWidth="1"
                onMouseMove={(e) => handleCountryHover(e, name)}
                onClick={() => onCountryClick(name)}
              />
            );
          })}
        </g>
      </svg>
      {tooltip && (
        <div
          className="absolute bg-slate-800 text-white p-3 rounded-lg text-sm border border-orange-500 shadow-2xl pointer-events-none z-30 animate-fade-in"
          style={{ top: `${tooltip.y - 60}px`, left: `${tooltip.x}px` }}
        >
          <p className="font-extrabold text-orange-400">{tooltip.country}</p>
          <p className="font-mono text-xs">{tooltip.volume}</p>
        </div>
      )}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span>Active Origin</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-700"></span>
            <span>No Records</span>
        </div>
      </div>
    </div>
  );
};