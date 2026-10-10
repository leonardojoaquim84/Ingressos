import React, { useRef, useState } from 'react';
import {
  Calendar,
  Car,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  MapPin,
  Send,
  Share2,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { PedidoEvento } from '../types';
import { formatDateBR, generateCondensedWhatsAppText } from '../utils/helpers';

interface ModalDetalhesPedidoProps {
  pedido: PedidoEvento;
  onClose: () => void;
}

export const ModalDetalhesPedido: React.FC<ModalDetalhesPedidoProps> = ({
  pedido,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [gerandoJpeg, setGerandoJpeg] = useState(false);
  const [jpegDataUrl, setJpegDataUrl] = useState<string | null>(null);
  const [copiadoTexto, setCopiadoTexto] = useState(false);
  const [mostrarModalWhatsApp, setMostrarModalWhatsApp] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const interessadosValidos = pedido.interessados.filter(
    (i) => i.nome.trim() !== '' || i.cpf.trim() !== ''
  );

  const temVeiculo =
    pedido.veiculo.marca ||
    pedido.veiculo.modelo ||
    pedido.veiculo.cor ||
    pedido.veiculo.placa;

  // Função para renderizar o card em JPEG com alta nitidez
  const gerarImagemJpeg = async (): Promise<{ dataUrl: string; blob: Blob } | null> => {
    if (!cardRef.current) return null;
    try {
      setGerandoJpeg(true);
      const dataUrl = await toJpeg(cardRef.current, {
        quality: 0.95,
        backgroundColor: '#faf8f5',
        pixelRatio: 2,
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      setJpegDataUrl(dataUrl);
      return { dataUrl, blob };
    } catch (err) {
      console.error('Erro ao gerar imagem JPEG:', err);
      setFeedbackMsg('Não foi possível gerar a imagem. Tente novamente.');
      return null;
    } finally {
      setGerandoJpeg(false);
    }
  };

  const handleBaixarJpeg = async () => {
    let url = jpegDataUrl;
    if (!url) {
      const gerado = await gerarImagemJpeg();
      if (!gerado) return;
      url = gerado.dataUrl;
    }

    const link = document.createElement('a');
    link.href = url;
    const nomeLimpo = (pedido.nomeEvento || 'pedido_ingresso')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
    link.download = `ingresso_${nomeLimpo}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFeedbackMsg('Imagem JPEG baixada com sucesso!');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleEncaminharWhatsApp = async () => {
    setMostrarModalWhatsApp(true);
    let url = jpegDataUrl;
    let blobImg: Blob | null = null;

    if (!url) {
      const gerado = await gerarImagemJpeg();
      if (gerado) {
        url = gerado.dataUrl;
        blobImg = gerado.blob;
      }
    } else {
      const res = await fetch(url);
      blobImg = await res.blob();
    }

    // Se o navegador suportar compartilhamento de arquivos via Web Share API
    if (blobImg && navigator.canShare) {
      try {
        const file = new File([blobImg], `pedido_ingresso_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        if (navigator.canShare({ files: [file] })) {
          // Disponibiliza o fluxo nativo
        }
      } catch (e) {
        // Fallback silencioso para botões manuais
      }
    }
  };

  const handleCompartilharNativo = async () => {
    try {
      let blobImg: Blob | null = null;
      if (jpegDataUrl) {
        const res = await fetch(jpegDataUrl);
        blobImg = await res.blob();
      } else {
        const gerado = await gerarImagemJpeg();
        if (gerado) blobImg = gerado.blob;
      }

      if (!blobImg) return;

      const file = new File([blobImg], `pedido_ingresso.jpg`, { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Pedido de Ingresso - ${pedido.nomeEvento}`,
          text: `Pedido informal de ingresso para: ${pedido.nomeEvento}`,
        });
      } else {
        // Fallback: faz o download da imagem e abre o WhatsApp com o texto
        handleBaixarJpeg();
        abrirWhatsAppWeb();
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        // Fallback direto
        handleBaixarJpeg();
        abrirWhatsAppWeb();
      }
    }
  };

  const abrirWhatsAppWeb = () => {
    const texto = encodeURIComponent(generateCondensedWhatsAppText(pedido));
    const url = `https://api.whatsapp.com/send?text=${texto}`;
    window.open(url, '_blank');
  };

  const handleCopiarTexto = () => {
    const texto = generateCondensedWhatsAppText(pedido);
    navigator.clipboard.writeText(texto).then(() => {
      setCopiadoTexto(true);
      setTimeout(() => setCopiadoTexto(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-stone-50 border border-stone-200 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Barra Superior do Modal */}
        <div className="px-5 py-3.5 bg-white border-b border-stone-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-800" />
            <span className="font-semibold text-stone-800 text-sm sm:text-base">
              Consulta Condensada do Evento
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificação Temporária */}
        {feedbackMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 font-medium text-center">
            {feedbackMsg}
          </div>
        )}

        {/* Conteúdo rolável */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* O CARD CONDENSADO QUE SERÁ EXPORTADO EM JPEG */}
          <div
            ref={cardRef}
            className="bg-[#faf8f5] border-2 border-stone-300/80 rounded-2xl p-5 sm:p-6 text-stone-800 shadow-sm relative overflow-hidden"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {/* Faixa Superior do Cartão */}
            <div className="border-b-2 border-stone-300 pb-3.5 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md inline-block mb-1">
                  Pedido Informal de Ingresso
                </span>
                <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
                  {pedido.nomeEvento || 'Evento Sem Nome'}
                </h2>
              </div>
              <div className="text-[11px] text-stone-500 font-mono self-start sm:self-auto">
                {new Date(pedido.criadoEm).toLocaleDateString('pt-BR')} •{' '}
                {new Date(pedido.criadoEm).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>

            {/* Informações do Local e Datas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-white/90 p-3 rounded-xl border border-stone-200/90">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block mb-1">
                  Local
                </span>
                <div className="flex items-start gap-1.5 text-xs sm:text-sm font-medium text-stone-800">
                  <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>{pedido.local || 'Não informado'}</span>
                </div>
              </div>

              <div className="bg-white/90 p-3 rounded-xl border border-stone-200/90 space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                  Opções de Data e Hora
                </span>
                <div className="text-xs text-stone-700 flex items-center justify-between">
                  <span className="font-semibold text-stone-800">Opção 1:</span>
                  <span>
                    {formatDateBR(pedido.opcao1Dia) || '-'} às {pedido.opcao1Hora || '-'}
                  </span>
                </div>
                <div className="text-xs text-stone-700 flex items-center justify-between border-t border-stone-100 pt-1">
                  <span className="font-semibold text-stone-800">Opção 2:</span>
                  <span>
                    {formatDateBR(pedido.opcao2Dia) || '-'} às {pedido.opcao2Hora || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Lista dos Interessados */}
            <div className="bg-white/90 p-3.5 rounded-xl border border-stone-200/90 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-emerald-700" />
                  Interessados Cadastrados ({interessadosValidos.length}/6)
                </span>
              </div>

              {interessadosValidos.length === 0 ? (
                <p className="text-xs text-stone-500 italic py-1">
                  Nenhum interessado preenchido neste formulário.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {interessadosValidos.map((interessado, idx) => (
                    <div
                      key={interessado.id}
                      className="bg-stone-50/90 p-2 rounded-lg border border-stone-200/70 text-xs"
                    >
                      <div className="font-medium text-stone-800 truncate">
                        <span className="text-stone-400 font-bold mr-1">{idx + 1}.</span>
                        {interessado.nome || 'Nome não inf.'}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono mt-0.5 pl-4">
                        CPF: {interessado.cpf || 'Não informado'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informações do Carro */}
            <div className="bg-white/90 p-3.5 rounded-xl border border-stone-200/90">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 flex items-center gap-1.5 mb-2">
                <Car className="w-3 h-3 text-amber-700" />
                Informações do Carro
              </span>

              {temVeiculo ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-stone-50/90 p-2 rounded-lg border border-stone-200/60">
                    <span className="text-[10px] text-stone-400 block font-semibold">Marca</span>
                    <span className="font-medium text-stone-800">{pedido.veiculo.marca || '-'}</span>
                  </div>
                  <div className="bg-stone-50/90 p-2 rounded-lg border border-stone-200/60">
                    <span className="text-[10px] text-stone-400 block font-semibold">Modelo</span>
                    <span className="font-medium text-stone-800">{pedido.veiculo.modelo || '-'}</span>
                  </div>
                  <div className="bg-stone-50/90 p-2 rounded-lg border border-stone-200/60">
                    <span className="text-[10px] text-stone-400 block font-semibold">Cor</span>
                    <span className="font-medium text-stone-800">{pedido.veiculo.cor || '-'}</span>
                  </div>
                  <div className="bg-stone-50/90 p-2 rounded-lg border border-stone-200/60">
                    <span className="text-[10px] text-stone-400 block font-semibold">Placa</span>
                    <span className="font-bold text-stone-900 font-mono">
                      {pedido.veiculo.placa || '-'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-500 italic">
                  Nenhum dado de veículo informado.
                </p>
              )}
            </div>

            {/* Rodapé do Cartão */}
            <div className="mt-4 pt-2.5 border-t border-stone-200/80 flex items-center justify-between text-[10px] text-stone-400">
              <span>Formulário padrão para pedido informal de ingresso para evento</span>
              <span className="font-mono">ID: {pedido.id.slice(-6)}</span>
            </div>
          </div>
        </div>

        {/* Barra de Ações Inferior */}
        <div className="p-4 bg-white border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopiarTexto}
            className="text-xs font-medium text-stone-700 hover:text-stone-900 px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiadoTexto ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copiar texto</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleBaixarJpeg}
              disabled={gerandoJpeg}
              className="text-xs font-medium text-stone-800 hover:text-stone-900 px-3.5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Baixar JPEG</span>
            </button>

            <button
              type="button"
              onClick={handleEncaminharWhatsApp}
              disabled={gerandoJpeg}
              className="text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4 text-emerald-100" />
              <span>Enviar via WhatsApp (JPEG)</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE ENCAMINHAMENTO POR WHATSAPP EM JPEG */}
      {mostrarModalWhatsApp && (
        <div className="fixed inset-0 z-60 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">
                    Encaminhar por WhatsApp em JPEG
                  </h3>
                  <p className="text-xs text-stone-500">
                    Compartilhe a imagem condensada do pedido
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalWhatsApp(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4">
              {jpegDataUrl ? (
                <div className="border border-stone-200 rounded-xl overflow-hidden bg-stone-100 max-h-56 overflow-y-auto">
                  <img
                    src={jpegDataUrl}
                    alt="Pré-visualização do ingresso em JPEG"
                    className="w-full h-auto block"
                  />
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center bg-stone-50 rounded-xl border border-dashed border-stone-300 text-xs text-stone-500">
                  <div className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full mb-2"></div>
                  Processando imagem JPEG...
                </div>
              )}

              <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                Você pode compartilhar a imagem diretamente para o WhatsApp no celular ou baixar o arquivo JPEG e abrir a conversa.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-stone-100">
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleCompartilharNativo}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar Imagem JPEG no WhatsApp</span>
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleBaixarJpeg}
                  className="w-full py-2.5 px-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>Baixar Imagem JPEG</span>
                </button>

                <button
                  type="button"
                  onClick={abrirWhatsAppWeb}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Abrir WhatsApp com Resumo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
