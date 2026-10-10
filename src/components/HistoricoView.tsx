import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Eye,
  FilePlus,
  History,
  MapPin,
  Send,
  Trash2,
  Users,
} from 'lucide-react';
import { PedidoEvento } from '../types';
import { deletePedidoFromStorage, formatDateBR } from '../utils/helpers';
import { ModalDetalhesPedido } from './ModalDetalhesPedido';

interface HistoricoViewProps {
  pedidos: PedidoEvento[];
  onAtualizarPedidos: (lista: PedidoEvento[]) => void;
  onNovoPedido: () => void;
  pedidoAbertoInicial?: PedidoEvento | null;
}

export const HistoricoView: React.FC<HistoricoViewProps> = ({
  pedidos,
  onAtualizarPedidos,
  onNovoPedido,
  pedidoAbertoInicial = null,
}) => {
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoEvento | null>(
    pedidoAbertoInicial
  );

  const handleExcluir = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const atualizados = deletePedidoFromStorage(id);
    onAtualizarPedidos(atualizados);
    if (pedidoSelecionado?.id === id) {
      setPedidoSelecionado(null);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Barra de Título do Histórico */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-800 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-700" />
            <span>Histórico de Pedidos Salvos</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Abra qualquer pedido salvo para consultar suas informações e encaminhar por WhatsApp em JPEG.
          </p>
        </div>

        <button
          type="button"
          onClick={onNovoPedido}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
        >
          <FilePlus className="w-4 h-4 text-emerald-400" />
          <span>Novo Pedido (HOME)</span>
        </button>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-10 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-base font-medium text-stone-800">
            Nenhum pedido salvo ainda
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
            Os pedidos de ingressos preenchidos na aba HOME aparecerão aqui automaticamente após serem salvos.
          </p>
          <button
            type="button"
            onClick={onNovoPedido}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>Preencher Primeiro Pedido</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pedidos.map((pedido) => {
            const countInteressados = pedido.interessados.filter(
              (i) => i.nome.trim() !== '' || i.cpf.trim() !== ''
            ).length;

            return (
              <div
                key={pedido.id}
                onClick={() => setPedidoSelecionado(pedido)}
                className="bg-white rounded-2xl border border-stone-200/80 p-5 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-stone-900 text-base group-hover:text-amber-900 transition-colors line-clamp-1">
                      {pedido.nomeEvento || 'Evento sem título'}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => handleExcluir(e, pedido.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                      title="Excluir do histórico"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {pedido.local && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-2.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{pedido.local}</span>
                    </div>
                  )}

                  <div className="bg-stone-50/70 rounded-xl p-2.5 border border-stone-200/60 mb-3 space-y-1 text-xs">
                    {(pedido.opcao1Dia || pedido.opcao1Hora) && (
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Calendar className="w-3 h-3 text-amber-700 shrink-0" />
                        <span className="font-medium text-stone-800">Opção 1:</span>
                        <span>
                          {formatDateBR(pedido.opcao1Dia) || '-'} {pedido.opcao1Hora ? `às ${pedido.opcao1Hora}` : ''}
                        </span>
                      </div>
                    )}
                    {(pedido.opcao2Dia || pedido.opcao2Hora) && (
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="font-medium text-stone-800">Opção 2:</span>
                        <span>
                          {formatDateBR(pedido.opcao2Dia) || '-'} {pedido.opcao2Hora ? `às ${pedido.opcao2Hora}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-500 mb-3">
                    <span className="flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      <Users className="w-3 h-3" />
                      {countInteressados} {countInteressados === 1 ? 'interessado' : 'interessados'}
                    </span>
                    {pedido.veiculo.placa && (
                      <span className="font-mono bg-stone-100 px-2 py-0.5 rounded-md text-stone-700 text-[11px]">
                        Placa: {pedido.veiculo.placa}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">
                    Salvo em {new Date(pedido.criadoEm).toLocaleDateString('pt-BR')}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 group-hover:underline">
                      <Send className="w-3 h-3" />
                      Abrir e Enviar
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DETALHES DO PEDIDO SELECIONADO */}
      {pedidoSelecionado && (
        <ModalDetalhesPedido
          pedido={pedidoSelecionado}
          onClose={() => setPedidoSelecionado(null)}
        />
      )}
    </div>
  );
};
