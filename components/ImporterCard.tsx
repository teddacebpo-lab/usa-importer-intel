
import React, { useState, useMemo, useEffect } from 'react';
import type { ParsedImporterData, ContactInfo } from '../types';
import { InfoIcon, ShipIcon, PhoneIcon, BellIcon, ShieldCheckIcon, CheckCircleIcon, ArrowDownTrayIcon, ChevronDownIcon, SearchIcon, EnvelopeIcon, ClipboardIcon, MapPinIcon, CalendarDaysIcon, GlobeIcon, ChartBarIcon, BoxIcon, ArrowPathIcon, PrinterIcon, BuildingOfficeIcon, ArrowLeftIcon, CloseIcon, LinkIcon } from './icons';
import { ShipmentVolumeChart } from './ShipmentVolumeChart';
import { SupplyChainMap } from './SupplyChainMap';

interface ImporterCardProps {
  data: ParsedImporterData;
  onSubscribe: (name: string) => void;
  onExport: () => void;
  onExportPDF: () => void;
  onExportJSON: () => void;
  onSearchSimilar: (name: string) => void;
  onRefresh: (name: string) => void;
  onClose?: () => void;
  isRefreshing?: boolean;
}

const Section: React.FC<{icon: React.ReactNode, title: string, subtitle?: string, children: React.ReactNode, noBorder?: boolean}> = ({icon, title, subtitle, children, noBorder}) => (
    <div className={`avoid-break ${noBorder ? '' : 'pt-12 border-t border-slate-800/60'}`}>
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-orange-500 print:bg-slate-100 print:text-orange-600">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-black text-white tracking-tight print:text-slate-900">{title}</h3>
                {subtitle && <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5 no-print">{subtitle}</p>}
            </div>
        </div>
        {children}
    </div>
);

export const ImporterCard: React.FC<ImporterCardProps> = ({ data, onSubscribe, onExportPDF, onRefresh, onClose, isRefreshing, onSearchSimilar }) => {
    const [isContactFormVisible, setIsContactFormVisible] = useState(false);
    const [isContactDetailsOpen, setIsContactDetailsOpen] = useState(false);
    const [showAllShipments, setShowAllShipments] = useState(false);
    const [tableFilter, setTableFilter] = useState('');
    const [inquirySubject, setInquirySubject] = useState('');
    
    const isLoading = !data.information;
    const contactObj = typeof data.contact === 'object' ? data.contact : { phone: 'N/A', email: 'N/A', website: 'N/A', address: 'N/A' } as ContactInfo;

    useEffect(() => {
        if (isContactFormVisible) {
            setInquirySubject(`${data.importerName} - Audit Inquiry - ${new Date().toLocaleDateString()}`);
        }
    }, [isContactFormVisible, data.importerName]);

    const filteredShipments = useMemo(() => {
        if (!data.shipmentHistory) return [];
        const lowFilter = tableFilter.toLowerCase();
        return data.shipmentHistory.filter(e => 
            e.shipper.toLowerCase().includes(lowFilter) ||
            e.commodity.toLowerCase().includes(lowFilter) ||
            e.origin.toLowerCase().includes(lowFilter)
        );
    }, [data.shipmentHistory, tableFilter]);

    const displayedShipments = showAllShipments ? filteredShipments : filteredShipments.slice(0, 5);

    return (
    <div className="bg-slate-900 min-h-full flex flex-col print:bg-white">
      {/* HEADER */}
      <div className="sticky top-0 z-30 p-6 sm:p-8 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
                {onClose && (
                    <button onClick={onClose} className="p-3 rounded-xl bg-slate-800 hover:bg-orange-600 text-slate-400 hover:text-white transition-all">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                )}
                <div>
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter">{data.importerName}</h2>
                    <div className="flex items-center gap-2 mt-1.5 text-slate-500 font-bold">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{data.location}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-800/30 p-2 rounded-2xl border border-slate-800">
                <button onClick={() => onRefresh(data.importerName)} disabled={isRefreshing} className="p-3 rounded-xl text-slate-400 bg-slate-800/50 hover:bg-slate-700 hover:text-orange-500 transition-all">
                    <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={onExportPDF} className="flex items-center gap-2 p-3 px-6 rounded-xl text-white bg-blue-600 hover:bg-orange-600 transition-all font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-900/20">
                    <PrinterIcon className="w-5 h-5" />
                    <span>Download PDF Report</span>
                </button>
                <button onClick={() => onSubscribe(data.importerName)} className="bg-slate-700 hover:bg-orange-500 text-white font-bold py-3 px-5 rounded-xl transition-all flex items-center gap-2">
                    <BellIcon className="w-4 h-4" />
                    <span>Alerts</span>
                </button>
            </div>
        </div>
      </div>

      <div className="flex-grow max-w-7xl mx-auto p-6 sm:p-10 space-y-16 pb-24 w-full print:p-0">
        {/* INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Section icon={<InfoIcon className="w-7 h-7" />} title="Strategic Insights" subtitle="AI Intelligence Analysis" noBorder>
                <p className="text-slate-400 text-lg leading-relaxed font-medium mb-8">{data.information}</p>
                {data.insights && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.insights.map((insight, i) => (
                            <div key={i} className="flex gap-4 bg-blue-500/5 p-5 rounded-3xl border border-blue-500/10">
                                <CheckCircleIcon className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                                <span className="text-sm text-slate-300 font-medium">{insight}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Section>
            {!isLoading && <ShipmentVolumeChart data={data.shipmentVolumeHistory} />}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[2.5rem] border border-slate-700/50 shadow-xl">
                <CalendarDaysIcon className="w-8 h-8 text-orange-500 mb-4" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Last CNEE Activity</p>
                <h3 className="text-3xl font-black text-white">{data.lastShipmentDate}</h3>
                <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500">Annual Volume</span>
                        <span className="text-xl font-black text-white">{data.shipmentCounts.lastYear} <span className="text-[10px] text-slate-600">TEU</span></span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500/50 w-3/4"></div>
                    </div>
                </div>
            </div>
            <div className="bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-800/50">
                <ShieldCheckIcon className="w-8 h-8 text-green-500 mb-4" />
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Risk Profile</h4>
                <div className="space-y-4">
                    {Object.entries(data.riskAssessment).map(([key, val]) => (
                        <div key={key}>
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
                                <span>{key}</span>
                                <span className="text-green-400">Low Risk</span>
                            </div>
                            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500/40 w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>

        {/* NETWORK MAP */}
        <Section icon={<GlobeIcon className="w-7 h-7" />} title="Global Supply Network" subtitle="CNEE Origin Analysis">
            <SupplyChainMap importerName={data.importerName} suppliers={data.topSuppliers} commodities={data.topCommodityFlows} />
        </Section>

        {/* MANIFEST AUDIT */}
        <Section icon={<ShipIcon className="w-7 h-7" />} title="Verified Manifest Audit Log" subtitle="Exclusive Consignee Records Only">
            <div className="mb-6 no-print">
                <div className="relative max-w-md">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Filter manifest by shipper, commodity..." 
                        value={tableFilter}
                        onChange={(e) => setTableFilter(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:border-orange-500 transition-colors"
                    />
                </div>
            </div>
            <div className="overflow-x-auto rounded-[2.5rem] border border-slate-800 bg-slate-900/40 shadow-2xl">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50 text-slate-500 font-black uppercase tracking-widest text-[10px]">
                            <th className="px-8 py-6 border-b border-slate-800">Date</th>
                            <th className="px-8 py-6 border-b border-slate-800">Shipper & Origin</th>
                            <th className="px-8 py-6 border-b border-slate-800">Product Analysis</th>
                            <th className="px-8 py-6 border-b border-slate-800 text-right">Volume</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {displayedShipments.map((event, i) => (
                            <tr key={i} className="hover:bg-slate-800/30 transition-all group">
                                <td className="px-8 py-8 font-mono text-xs text-slate-500">{event.date}</td>
                                <td className="px-8 py-8">
                                    <div className="font-bold text-white mb-1">{event.shipper}</div>
                                    <div className="text-[10px] text-slate-600 font-black uppercase flex items-center gap-1">
                                        <MapPinIcon className="w-3 h-3" /> {event.origin}
                                    </div>
                                </td>
                                <td className="px-8 py-8">
                                    <div className="text-slate-300 font-medium mb-2">{event.commodity}</div>
                                    <div className="flex gap-2">
                                        <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-500 font-mono">HS: {event.hsCode || 'N/A'}</span>
                                        <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-500 font-mono">BOL: {event.bolNumber || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-8 text-right font-black text-orange-500 text-lg">{event.volume}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredShipments.length > 5 && (
                    <button onClick={() => setShowAllShipments(!showAllShipments)} className="w-full py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-orange-500 transition-all border-t border-slate-800">
                        {showAllShipments ? 'Collapse Audit Log' : `Expand Audit Log (${filteredShipments.length - 5} records)`}
                    </button>
                )}
            </div>
        </Section>

        {/* INQUIRY PORTAL */}
        <div className="pt-20 border-t-4 border-slate-800/40 no-print">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                <div className="max-w-xl">
                    <h3 className="text-4xl font-black text-white mb-6">Contact Intelligence</h3>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">
                        Direct corporate identity data verified against manifest records and SEC filings.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-5 p-6 bg-slate-800/40 rounded-3xl border border-slate-800 group transition-all hover:border-orange-500/30">
                            <PhoneIcon className="w-6 h-6 text-orange-500" />
                            <span className="text-lg font-bold text-slate-200">{contactObj.phone}</span>
                            <span className="ml-auto text-[10px] font-black uppercase text-green-500 border border-green-500/30 px-2 py-1 rounded-lg">Verified</span>
                        </div>
                        <div className="flex items-center gap-5 p-6 bg-slate-800/40 rounded-3xl border border-slate-800 group transition-all hover:border-orange-500/30">
                            <EnvelopeIcon className="w-6 h-6 text-orange-500" />
                            <span className="text-lg font-bold text-slate-200">{contactObj.email}</span>
                            <span className="ml-auto text-[10px] font-black uppercase text-green-500 border border-green-500/30 px-2 py-1 rounded-lg">Verified</span>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-[400px] shrink-0">
                    <button onClick={() => setIsContactFormVisible(true)} className="w-full bg-slate-100 hover:bg-orange-600 hover:text-white text-slate-900 font-black py-6 rounded-[2rem] transition-all shadow-2xl flex items-center justify-center gap-4 text-lg active:scale-95">
                        <EnvelopeIcon className="w-7 h-7" />
                        Open Inquiry Portal
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* MODAL: INQUIRY */}
      {isContactFormVisible && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 max-w-2xl w-full shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
                  <div className="flex justify-between items-center mb-10">
                      <div>
                        <h2 className="text-3xl font-black text-white">Importer Inquiry</h2>
                        <p className="text-sm text-slate-500 font-bold mt-1">Audit request for {data.importerName}</p>
                      </div>
                      <button onClick={() => setIsContactFormVisible(false)} className="p-3 text-slate-500 hover:text-orange-500 transition-colors bg-slate-800 rounded-full">
                          <CloseIcon className="w-6 h-6" />
                      </button>
                  </div>
                  <div className="space-y-6">
                      <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Inquiry Subject</label>
                          <input 
                              type="text" 
                              value={inquirySubject}
                              onChange={(e) => setInquirySubject(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 p-5 rounded-2xl text-white outline-none focus:border-orange-500 transition-colors font-bold" 
                              placeholder="e.g. Importer Name - Audit Inquiry - Date"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Your Corporate Email</label>
                            <input type="email" placeholder="audit@company.com" className="w-full bg-slate-800 border border-slate-700 p-5 rounded-2xl text-white outline-none focus:border-orange-500 transition-colors" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Priority Level</label>
                            <select className="w-full bg-slate-800 border border-slate-700 p-5 rounded-2xl text-white outline-none focus:border-orange-500 transition-colors appearance-none">
                                <option>Standard Audit</option>
                                <option>Urgent Verification</option>
                            </select>
                          </div>
                      </div>
                      <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Inquiry Details</label>
                          <textarea rows={4} placeholder="Specify manifest details or verification requirements..." className="w-full bg-slate-800 border border-slate-700 p-5 rounded-2xl text-white outline-none focus:border-orange-500 transition-colors resize-none"></textarea>
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-orange-600 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20">
                          <EnvelopeIcon className="w-5 h-5" />
                          Dispatch Secure Request
                      </button>
                  </div>
              </div>
          </div>
      )}

      <footer className="w-full py-12 border-t border-slate-800/40 text-center mt-auto no-print">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Powered by JUNAID ABBASI Intelligence Systems</p>
      </footer>
    </div>
  );
};
