
import React, { useState } from 'react';
import { ShipmentVolume } from '../types';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from './icons';

interface ShipmentVolumeChartProps {
  data: ShipmentVolume[];
}

export const ShipmentVolumeChart: React.FC<ShipmentVolumeChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const sortedData = [...data].sort((a, b) => a.year - b.year);
  // Ensure maxVolume is at least 1 to avoid division by zero
  const maxVolume = Math.max(...sortedData.map(d => d.volume), 1);
  const chartHeight = 220; // Height of the visual bar area
  
  const getBarColor = (volume: number) => {
    if (volume >= maxVolume * 0.8) return 'from-orange-500 via-orange-400 to-orange-600';
    if (volume >= maxVolume * 0.4) return 'from-blue-500 via-blue-400 to-blue-600';
    return 'from-slate-600 via-slate-500 to-slate-700';
  };

  const getTrend = (index: number) => {
    if (index === 0) return null;
    const prev = sortedData[index - 1].volume;
    const curr = sortedData[index].volume;
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  return (
    <div className="relative bg-slate-900/60 p-10 rounded-[3rem] border border-slate-700/50 mt-6 shadow-2xl overflow-hidden group/chart">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
        <div>
          <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-2">Growth Intelligence</h4>
          <h3 className="text-2xl font-black text-white tracking-tight">Consignee Volume Audit</h3>
        </div>
        <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest no-print">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]"></span> <span className="text-slate-500">Peak Performance</span></div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"></span> <span className="text-slate-500">Normal Flow</span></div>
        </div>
      </div>

      <div className="relative h-[280px] w-full px-6">
        {/* Y-AXIS GRID */}
        <div className="absolute inset-x-0 top-0 h-[220px] flex flex-col justify-between pointer-events-none">
            {[1, 0.75, 0.5, 0.25, 0].map((v) => (
                <div key={v} className="w-full flex items-center gap-6">
                    <span className="text-[10px] font-black text-slate-700 w-12 text-right font-mono tabular-nums">
                        {Math.round(maxVolume * v).toLocaleString()}
                    </span>
                    <div className={`flex-grow h-px ${v === 0 ? 'bg-slate-700/50' : 'bg-slate-800/30'}`}></div>
                </div>
            ))}
        </div>

        {/* BARS CONTAINER */}
        <div className="relative flex items-end justify-between h-[220px] w-full gap-6 z-10 px-12">
          {sortedData.map((item, index) => {
            const heightPercent = (item.volume / maxVolume) * 100;
            const isHovered = hoveredIndex === index;
            const trend = getTrend(index);
            
            return (
              <div 
                key={item.year} 
                className="relative flex flex-col items-center flex-1 h-full justify-end"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* TOOLTIP ON HOVER */}
                <div 
                  className={`absolute transition-all duration-300 pointer-events-none mb-4 ${isHovered ? 'opacity-100 -translate-y-4' : 'opacity-0 translate-y-2'}`}
                  style={{ bottom: `${heightPercent}%` }}
                >
                  <div className="bg-slate-800 border-2 border-orange-500 px-4 py-2 rounded-2xl shadow-2xl flex flex-col items-center">
                      <span className="text-sm font-black text-white font-mono whitespace-nowrap">
                        {item.volume.toLocaleString()} <span className="text-orange-500">TEU</span>
                      </span>
                      {trend !== null && (
                        <div className={`text-[9px] font-black mt-1 flex items-center gap-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                           {trend >= 0 ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
                           {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% YoY
                        </div>
                      )}
                  </div>
                  <div className="w-3 h-3 bg-slate-800 border-r-2 border-b-2 border-orange-500 rotate-45 mx-auto -mt-2"></div>
                </div>

                {/* THE BAR */}
                <div 
                  className={`w-full max-w-[80px] rounded-t-2xl transition-all duration-700 cursor-pointer relative group/bar bg-gradient-to-t ${getBarColor(item.volume)} border-t border-x border-white/10`}
                  style={{ 
                    height: `${heightPercent}%`, 
                    opacity: hoveredIndex !== null && !isHovered ? 0.3 : 1,
                    boxShadow: isHovered ? '0 0 50px rgba(249,115,22,0.4)' : 'none',
                  }}
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/bar:opacity-100 transition-opacity rounded-t-2xl"></div>
                </div>
                
                {/* YEAR LABEL */}
                <div className="absolute top-[230px] text-center">
                  <span className={`text-sm font-black tracking-tight transition-all duration-300 ${isHovered ? 'text-white scale-125' : 'text-slate-600'}`}>
                    {item.year}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
