/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { FormularioHome } from './components/FormularioHome';
import { HistoricoView } from './components/HistoricoView';
import { ModalDetalhesPedido } from './components/ModalDetalhesPedido';
import { PedidoEvento } from './types';
import { getSavedPedidos } from './utils/helpers';

export default function App() {
  // O app DEVE sempre abrir na aba HOME conforme instrução
  const [activeTab, setActiveTab] = useState<'home' | 'historico'>('home');
  const [pedidos, setPedidos] = useState<PedidoEvento[]>([]);
  const [pedidoRecemSalvo, setPedidoRecemSalvo] = useState<PedidoEvento | null>(null);

  useEffect(() => {
    // Carregar pedidos salvos do armazenamento local
    const saved = getSavedPedidos();
    setPedidos(saved);
  }, []);

  const handlePedidoSalvo = (novoPedido: PedidoEvento) => {
    // Atualiza a lista com o novo pedido
    setPedidos((prev) => [novoPedido, ...prev.filter((p) => p.id !== novoPedido.id)]);
    setPedidoRecemSalvo(novoPedido);
    // Vai diretamente para a aba Histórico conforme solicitado
    setActiveTab('historico');
  };

  const handleNovoPedidoFromHistorico = () => {
    setPedidoRecemSalvo(null);
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-stone-800 flex flex-col font-sans selection:bg-amber-200/60 selection:text-stone-900">
      {/* Cabeçalho de Navegação */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'home') setPedidoRecemSalvo(null);
        }}
        historicoCount={pedidos.length}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {activeTab === 'home' ? (
          <FormularioHome onPedidoSalvo={handlePedidoSalvo} />
        ) : (
          <HistoricoView
            pedidos={pedidos}
            onAtualizarPedidos={setPedidos}
            onNovoPedido={handleNovoPedidoFromHistorico}
            pedidoAbertoInicial={pedidoRecemSalvo}
          />
        )}
      </main>

      {/* Rodapé sutil com tons pastéis */}
      <footer className="mt-auto border-t border-stone-200/60 py-4 text-center text-xs text-stone-500 bg-[#f4f1ea]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Formulário padrão para pedido informal de ingresso para evento</span>
          <span className="text-stone-400">Armazenamento local seguro e envio em JPEG</span>
        </div>
      </footer>
    </div>
  );
}
