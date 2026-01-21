import React, { useState } from 'react';
import type { TopSupplier, CommodityFlow } from '../types';
import { BuildingOfficeIcon, BoxIcon, MapPinIcon, ArrowTrendingUpIcon } from './icons';

interface SupplyChainMapProps {
    importerName: string;
    suppliers: TopSupplier[];
    commodities: CommodityFlow[];
}

export const SupplyChainMap: React.FC<SupplyChainMapProps> = ({ importerName, suppliers, commodities }) => {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    // Filter valid nodes
    const validSuppliers = suppliers.slice(0, 4);
    const validCommodities = commodities.slice(0, 3);

    const width = 800;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    const supplierX = 80;
    const commodityX = 350;
    const importerX = 650;

    return (
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 relative overflow-hidden">
            <h4 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-6 h-6 text-orange-400" />
                Visual Supply Chain Map
            </h4>

            <div className="relative h-[400px]">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                    {/* Definitions for Glow effects */}
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Links from Suppliers to Commodities (Logic-based mapping) */}
                    {validSuppliers.map((supplier, sIndex) => {
                        const sY = (height / (validSuppliers.length + 1)) * (sIndex + 1);
                        return validCommodities.map((commodity, cIndex) => {
                            const cY = (height / (validCommodities.length + 1)) * (cIndex + 1);
                            // Only draw line if supplier produces this commodity or for first pair if data is fuzzy
                            const isActive = supplier.product?.toLowerCase().includes(commodity.name.toLowerCase()) || (sIndex === cIndex);
                            if (!isActive) return null;

                            return (
                                <path
                                    key={`link-s${sIndex}-c${cIndex}`}
                                    d={`M ${supplierX + 20} ${sY} C ${supplierX + 150} ${sY}, ${commodityX - 150} ${cY}, ${commodityX - 20} ${cY}`}
                                    fill="none"
                                    stroke={hoveredNode === supplier.name ? "#f97316" : "#475569"}
                                    strokeWidth={hoveredNode === supplier.name ? "3" : "1"}
                                    strokeOpacity={hoveredNode === supplier.name ? "0.8" : "0.3"}
                                    className="transition-all duration-300"
                                />
                            );
                        });
                    })}

                    {/* Links from Commodities to Importer */}
                    {validCommodities.map((_, cIndex) => {
                        const cY = (height / (validCommodities.length + 1)) * (cIndex + 1);
                        return (
                            <path
                                key={`link-c${cIndex}-i`}
                                d={`M ${commodityX + 20} ${cY} C ${commodityX + 150} ${cY}, ${importerX - 150} ${centerY}, ${importerX - 20} ${centerY}`}
                                fill="none"
                                stroke="#475569"
                                strokeWidth="1.5"
                                strokeOpacity="0.4"
                            />
                        );
                    })}

                    {/* Nodes: Suppliers */}
                    {validSuppliers.map((supplier, index) => {
                        const y = (height / (validSuppliers.length + 1)) * (index + 1);
                        return (
                            <g 
                                key={`supplier-${index}`} 
                                onMouseEnter={() => setHoveredNode(supplier.name)} 
                                onMouseLeave={() => setHoveredNode(null)}
                                className="cursor-pointer"
                            >
                                <circle cx={supplierX} cy={y} r="15" fill="#1e293b" stroke="#f97316" strokeWidth="2" />
                                <text x={supplierX} y={y + 5} textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">S</text>
                                <text x={supplierX} y={y - 25} textAnchor="middle" fill="#94a3b8" fontSize="10" className="font-medium">{supplier.location.split(',')[1] || supplier.location}</text>
                                <text x={supplierX} y={y + 35} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">{supplier.name.split(' ')[0]}</text>
                            </g>
                        );
                    })}

                    {/* Nodes: Commodities */}
                    {validCommodities.map((commodity, index) => {
                        const y = (height / (validCommodities.length + 1)) * (index + 1);
                        return (
                            <g key={`commodity-${index}`}>
                                <rect x={commodityX - 15} y={y - 15} width="30" height="30" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                                <text x={commodityX} y={y + 5} textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="bold">C</text>
                                <text x={commodityX} y={y + 35} textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">{commodity.name}</text>
                            </g>
                        );
                    })}

                    {/* Node: Importer */}
                    <g filter="url(#glow)">
                        <circle cx={importerX} cy={centerY} r="25" fill="#f97316" />
                        <text x={importerX} y={centerY + 5} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">USA</text>
                        <text x={importerX} y={centerY + 45} textAnchor="middle" fill="#f97316" fontSize="14" fontWeight="extrabold">{importerName.split(' ')[0]}</text>
                    </g>
                </svg>

                {/* Legend Overlay */}
                <div className="absolute bottom-0 right-0 p-3 bg-slate-800/80 rounded-tl-xl border-l border-t border-slate-700 text-[10px] space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span className="text-slate-400">Supplier Origin</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-sm bg-blue-500"></span>
                        <span className="text-slate-400">Top Commodity</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-600 border border-white"></span>
                        <span className="text-slate-400">{importerName}</span>
                    </div>
                </div>
            </div>

            {/* Hover Tooltip Overlay */}
            {hoveredNode && (
                <div className="absolute top-10 left-10 bg-slate-800 border border-orange-500 p-3 rounded shadow-2xl z-20 animate-fade-in">
                    <p className="text-orange-400 font-bold">{hoveredNode}</p>
                    <p className="text-xs text-slate-300">Primary Partner</p>
                </div>
            )}
        </div>
    );
};
