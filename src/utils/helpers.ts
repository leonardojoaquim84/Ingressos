import { PedidoEvento } from '../types';

export const STORAGE_KEY = 'pedidos_ingresso_eventos_v1';

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function formatPlaca(value: string): string {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  if (clean.length > 3) {
    // If standard 3 letters + 4 digits
    if (/^[A-Z]{3}[0-9]{4}$/.test(clean)) {
      return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    }
    // Mercosul format (3 letters + 1 number + 1 letter + 2 numbers)
    return clean;
  }
  return clean;
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function getSavedPedidos(): PedidoEvento[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao ler pedidos do localStorage:', e);
    return [];
  }
}

export function savePedidoToStorage(pedido: PedidoEvento): PedidoEvento[] {
  const current = getSavedPedidos();
  const updated = [pedido, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deletePedidoFromStorage(id: string): PedidoEvento[] {
  const current = getSavedPedidos();
  const updated = current.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function generateCondensedWhatsAppText(pedido: PedidoEvento): string {
  const linhas: string[] = [
    `🎟️ *PEDIDO INFORMAL DE INGRESSO PARA EVENTO*`,
    `📌 *Evento:* ${pedido.nomeEvento || 'Não informado'}`,
    `📍 *Local:* ${pedido.local || 'Não informado'}`,
    ``,
    `🗓️ *Opções de Data e Hora:*`,
    `• *Opção 1:* ${formatDateBR(pedido.opcao1Dia) || 'Não inf.'} às ${pedido.opcao1Hora || 'Não inf.'}`,
    `• *Opção 2:* ${formatDateBR(pedido.opcao2Dia) || 'Não inf.'} às ${pedido.opcao2Hora || 'Não inf.'}`,
    ``,
    `👥 *Interessados:*`,
  ];

  const interessadosPreenchidos = pedido.interessados.filter(
    (i) => i.nome.trim() !== '' || i.cpf.trim() !== ''
  );

  if (interessadosPreenchidos.length === 0) {
    linhas.push(`_Nenhum interessado informado._`);
  } else {
    interessadosPreenchidos.forEach((item, index) => {
      linhas.push(`${index + 1}. *Nome:* ${item.nome || 'Não inf.'} | *CPF:* ${item.cpf || 'Não inf.'}`);
    });
  }

  linhas.push(``);
  linhas.push(`🚗 *Informações do Veículo:*`);
  const v = pedido.veiculo;
  if (!v.marca && !v.modelo && !v.cor && !v.placa) {
    linhas.push(`_Não informado._`);
  } else {
    linhas.push(`• Marca: ${v.marca || '-'}`);
    linhas.push(`• Modelo: ${v.modelo || '-'}`);
    linhas.push(`• Cor: ${v.cor || '-'}`);
    linhas.push(`• Placa: ${v.placa || '-'}`);
  }

  return linhas.join('\n');
}
