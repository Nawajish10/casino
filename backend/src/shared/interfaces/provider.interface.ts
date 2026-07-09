export interface NormalizedProvider {
  providerCode: string;
  providerName: string;
  providerLogo?: string;
  status: boolean;
}

export interface NormalizedGame {
  providerGameId: string;
  gameCode: string;
  gameName: string;
  category?: string;
  thumbnail?: string;
  banner?: string;
}

export interface ProviderListResponse {
  status: number;
  msg: string;
  providers?: {
    code: string;
    name: string;
    status: number;
  }[];
}

export interface GameListResponse {
  status: number;
  msg: string;
  games?: {
    game_code: string;
    game_name: string;
    banner?: string;
    status: number;
  }[];
}
