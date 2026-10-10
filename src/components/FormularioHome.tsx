import React, { useState } from 'react';
import { Calendar, Car, Clock, MapPin, Save, Trash2, User, Users } from 'lucide-react';
import { Interessado, PedidoEvento, VeiculoInfo } from '../types';
import { formatCPF, formatPlaca, savePedidoToStorage } from '../utils/helpers';

interface FormularioHomeProps {
  onPedidoSalvo: (novoPedido: PedidoEvento) => void;
}

const initialInteressados: Interessado[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  nome: '',
  cpf: '',
}));

const initialVeiculo: VeiculoInfo = {
  marca: '',
  modelo: '',
  cor: '',
  placa: '',
};

export const FormularioHome: React.FC<FormularioHomeProps> = ({ onPedidoSalvo }) => {
  const [nomeEvento, setNomeEvento] = useState('');
  const [local, setLocal] = useState('');
  const [opcao1Dia, setOpcao1Dia] = useState('');
  const [opcao1Hora, setOpcao1Hora] = useState('');
  const [opcao2Dia, setOpcao2Dia] = useState('');
  const [opcao2Hora, setOpcao2Hora] = useState('');

  const [interessados, setInteressados] = useState<Interessado[]>(initialInteressados);
  const [veiculo, setVeiculo] = useState<VeiculoInfo>(initialVeiculo);

  const [erro, setErro] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInteressadoChange = (index: number, campo: 'nome' | 'cpf', valor: string) => {
    const formatted = campo === 'cpf' ? formatCPF(valor) : valor;
    setInteressados((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [campo]: formatted };
      return copy;
    });
  };

  const handleLimparInteressado = (index: number) => {
    setInteressados((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], nome: '', cpf: '' };
      return copy;
    });
  };

  const handleLimparTodosInteressados = () => {
    setInteressados(Array.from({ length: 6 }, (_, index) => ({ id: index + 1, nome: '', cpf: '' })));
  };

  const handleLimparEvento = () => {
    setNomeEvento('');
    setLocal('');
    setOpcao1Dia('');
    setOpcao1Hora('');
    setOpcao2Dia('');
    setOpcao2Hora('');
  };

  const handleLimparOpcao1 = () => {
    setOpcao1Dia('');
    setOpcao1Hora('');
  };

  const handleLimparOpcao2 = () => {
    setOpcao2Dia('');
    setOpcao2Hora('');
  };

  const handleVeiculoChange = (campo: keyof VeiculoInfo, valor: string) => {
    const formatted = campo === 'placa' ? formatPlaca(valor) : valor;
    setVeiculo((prev) => ({
      ...prev,
      [campo]: formatted,
    }));
  };

  const handleLimparVeiculo = () => {
    setVeiculo({ marca: '', modelo: '', cor: '', placa: '' });
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!nomeEvento.trim()) {
      setErro('Por favor, informe o Nome do Evento.');
      const el = document.getElementById('nomeEvento');
      el?.focus();
      return;
    }

    setIsSubmitting(true);

    const novoPedido: PedidoEvento = {
      id: `ped_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      criadoEm: new Date().toISOString(),
      nomeEvento: nomeEvento.trim(),
      local: local.trim(),
      opcao1Dia,
      opcao1Hora,
      opcao2Dia,
      opcao2Hora,
      interessados,
      veiculo,
    };

    savePedidoToStorage(novoPedido);

    // Limpar formulário para próximo preenchimento
    setNomeEvento('');
    setLocal('');
    setOpcao1Dia('');
    setOpcao1Hora('');
    setOpcao2Dia('');
    setOpcao2Hora('');
    setInteressados(Array.from({ length: 6 }, (_, index) => ({ id: index + 1, nome: '', cpf: '' })));
    setVeiculo({ marca: '', modelo: '', cor: '', placa: '' });
    setIsSubmitting(false);

    // Direcionar para a aba Histórico com o pedido recém-criado
    onPedidoSalvo(novoPedido);
  };

  return (
    <form onSubmit={handleSalvar} className="space-y-6 pb-12">
      {erro && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <span>{erro}</span>
          <button
            type="button"
            onClick={() => setErro(null)}
            className="text-xs font-semibold underline ml-3 text-rose-700"
          >
            Fechar
          </button>
        </div>
      )}

      {/* BLOCO 1: DADOS DO EVENTO */}
      <section className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider">
                Dados do Evento
              </h3>
              <p className="text-xs text-stone-500">
                Nome do evento, local e duas opções de data e horário
              </p>
            </div>
          </div>

          {/* Lixeira para apagar rapidamente todos os dados do evento */}
          {(nomeEvento || local || opcao1Dia || opcao1Hora || opcao2Dia || opcao2Hora) && (
            <button
              type="button"
              onClick={handleLimparEvento}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-stone-200/70 hover:border-rose-200 transition-colors cursor-pointer"
              title="Apagar dados do evento"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar dados</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label
              htmlFor="nomeEvento"
              className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
            >
              Nome do Evento <span className="text-rose-500">*</span>
            </label>
            <input
              id="nomeEvento"
              type="text"
              required
              value={nomeEvento}
              onChange={(e) => setNomeEvento(e.target.value)}
              placeholder="Ex: Jogo da Final, Peça Teatral, Concerto de Música..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="local"
              className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
            >
              Local do Evento
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                id="local"
                type="text"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Ex: Estádio do Maracanã, Centro de Convenções, Sala 3..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Opção 1 de Dia e Hora */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Opção 1 de Dia e Hora</span>
              </div>
              {(opcao1Dia || opcao1Hora) && (
                <button
                  type="button"
                  onClick={handleLimparOpcao1}
                  className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Apagar Opção 1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Dia
                </label>
                <input
                  type="date"
                  value={opcao1Dia}
                  onChange={(e) => setOpcao1Dia(e.target.value)}
                  className="w-38 px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Hora
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
                  <input
                    type="time"
                    value={opcao1Hora}
                    onChange={(e) => setOpcao1Hora(e.target.value)}
                    className="w-28 pl-8 pr-2 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Opção 2 de Dia e Hora */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Opção 2 de Dia e Hora</span>
              </div>
              {(opcao2Dia || opcao2Hora) && (
                <button
                  type="button"
                  onClick={handleLimparOpcao2}
                  className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Apagar Opção 2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Dia
                </label>
                <input
                  type="date"
                  value={opcao2Dia}
                  onChange={(e) => setOpcao2Dia(e.target.value)}
                  className="w-38 px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Hora
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
                  <input
                    type="time"
                    value={opcao2Hora}
                    onChange={(e) => setOpcao2Hora(e.target.value)}
                    className="w-28 pl-8 pr-2 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 2: 6 ESPAÇOS PARA PREENCHIMENTO DOS INTERESSADOS (SEPARADAMENTE) */}
      <section className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <span>Interessados</span>
                <Users className="w-4 h-4 text-stone-400" />
              </h3>
              <p className="text-xs text-stone-500">
                Preencha o Nome e CPF de cada um dos interessados no ingresso
              </p>
            </div>
          </div>

          {/* Lixeira para apagar todos os interessados */}
          {interessados.some((i) => i.nome || i.cpf) && (
            <button
              type="button"
              onClick={handleLimparTodosInteressados}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-stone-200/70 hover:border-rose-200 transition-colors cursor-pointer"
              title="Apagar todos os interessados"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar todos</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {interessados.map((interessado, index) => {
            const isFilled = Boolean(interessado.nome.trim() || interessado.cpf.trim());
            return (
              <div
                key={interessado.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isFilled
                    ? 'bg-emerald-50/30 border-emerald-200/70'
                    : 'bg-stone-50/40 border-stone-200/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 text-[11px] font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-stone-700">
                      Interessado {index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isFilled && (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        Preenchido
                      </span>
                    )}

                    {/* Lixeira ao lado de cada interessado para apagar rapidamente */}
                    <button
                      type="button"
                      onClick={() => handleLimparInteressado(index)}
                      disabled={!isFilled}
                      className={`p-1 rounded-md transition-colors ${
                        isFilled
                          ? 'text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                          : 'text-stone-300 cursor-not-allowed opacity-40'
                      }`}
                      title={`Apagar interessado ${index + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-500 mb-0.5">
                      Nome completo
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={interessado.nome}
                        onChange={(e) => handleInteressadoChange(index, 'nome', e.target.value)}
                        placeholder={`Nome do interessado ${index + 1}`}
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-500 mb-0.5">
                      CPF
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={interessado.cpf}
                      onChange={(e) => handleInteressadoChange(index, 'cpf', e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BLOCO 3: INFORMAÇÕES DO CARRO (SEPARADO ABAIXO) */}
      <section className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-2">
                <span>Informações do Carro</span>
                <Car className="w-4 h-4 text-stone-400" />
              </h3>
              <p className="text-xs text-stone-500">
                Marca, modelo, cor e placa do veículo para acesso ou estacionamento
              </p>
            </div>
          </div>

          {/* Lixeira ao lado das informações do carro para apagar rapidamente */}
          {(veiculo.marca || veiculo.modelo || veiculo.cor || veiculo.placa) && (
            <button
              type="button"
              onClick={handleLimparVeiculo}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-stone-200/70 hover:border-rose-200 transition-colors cursor-pointer"
              title="Apagar dados do veículo"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar veículo</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Marca
            </label>
            <input
              type="text"
              value={veiculo.marca}
              onChange={(e) => handleVeiculoChange('marca', e.target.value)}
              placeholder="Ex: Fiat, Toyota..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Modelo
            </label>
            <input
              type="text"
              value={veiculo.modelo}
              onChange={(e) => handleVeiculoChange('modelo', e.target.value)}
              placeholder="Ex: Argo, Corolla, Gol..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Cor
            </label>
            <input
              type="text"
              value={veiculo.cor}
              onChange={(e) => handleVeiculoChange('cor', e.target.value)}
              placeholder="Ex: Prata, Preto, Branco..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Placa
            </label>
            <input
              type="text"
              value={veiculo.placa}
              onChange={(e) => handleVeiculoChange('placa', e.target.value)}
              placeholder="ABC-1234 ou ABC1D23"
              maxLength={8}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-800 text-sm uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white"
            />
          </div>
        </div>
      </section>

      {/* BOTÃO PARA SALVAR */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow active:scale-[0.99] cursor-pointer"
        >
          <Save className="w-4 h-4 text-emerald-400" />
          <span>Salvar e ir para o Histórico</span>
        </button>
      </div>
    </form>
  );
};

