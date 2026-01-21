
import React, { useEffect, useRef } from 'react';
import type { Notification } from '../types';
import { BellIcon, TrashIcon, CloseIcon } from './icons';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onClearAll: () => void;
  onDelete: (id: string) => void;
  parentRef: React.RefObject<HTMLButtonElement>;
}

const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onClearAll, onDelete, parentRef }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        parentRef.current &&
        !parentRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, parentRef]);


  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 transform opacity-0 animate-fade-in-down mx-4 sm:mx-0"
    >
      <div className="flex justify-between items-center p-4 border-b border-slate-700">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <BellIcon className="w-5 h-5 text-orange-500" />
            Alert Feed
        </h3>
        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-black text-slate-500 hover:text-orange-500 uppercase tracking-widest transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <BellIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-bold">No active signals</p>
            <p className="text-xs text-slate-500 mt-1">Subscribe to entities to track logistics changes.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-700/50">
            {notifications.map((notification, index) => (
              <li key={notification.id} className={`group p-4 flex gap-3 transition-colors ${index === 0 ? 'bg-orange-500/5' : 'hover:bg-slate-700/30'}`}>
                <div className="flex-grow">
                  <p className="text-slate-200 text-sm leading-relaxed">{notification.message}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">{formatTimeAgo(notification.timestamp)}</p>
                </div>
                <button 
                  onClick={() => onDelete(notification.id)}
                  className="p-1.5 h-fit text-slate-600 hover:text-orange-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Alert"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <style>{`
        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
            animation: fadeInDown 0.2s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};
