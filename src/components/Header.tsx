import React from 'react';
import { FileText, History, Ticket } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'historico';
  onTabChange: (tab: 'home' | 'historico') => void;
  historicoCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  historicoCount,
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100/90 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200/70">
              <Ticket className="w-5 h-5 text-amber-900" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-stone-800 uppercase tracking-wide bg-stone-100 border border-stone-200/90 px-3 py-1.5 rounded-xl inline-block leading-snug">
                FORMULÁRIO PADRÃO PARA PEDIDO INFORMAL DE INGRESSO PARA EVENTO
              </h1>
            </div>
          </div>

          <div className="flex items-center bg-stone-100/90 p-1 rounded-xl border border-stone-200/70 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onTabChange('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>HOME</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('historico')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'historico'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <History className="w-4 h-4 text-amber-700" />
              <span>Histórico</span>
              {historicoCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-amber-200/80 text-amber-900">
                  {historicoCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
