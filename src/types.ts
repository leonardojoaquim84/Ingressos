export interface Interessado {
  id: number;
  nome: string;
  cpf: string;
}

export interface VeiculoInfo {
  marca: string;
  modelo: string;
  cor: string;
  placa: string;
}

export interface PedidoEvento {
  id: string;
  criadoEm: string;
  nomeEvento: string;
  local: string;
  opcao1Dia: string;
  opcao1Hora: string;
  opcao2Dia: string;
  opcao2Hora: string;
  interessados: Interessado[];
  veiculo: VeiculoInfo;
}
