import type {
  AuthSession,
  ConfirmDonationReceiptInput,
  ConfirmLotDestinationInput,
  CreateHarvestLotInput,
  CreateOrderInput,
  Donation,
  HarvestLot,
  ImpactIndicators,
  Offer,
  Order,
  PhotoUploadUrl,
  RegisterBuyerInput,
  RegisterNgoInput,
  RegisterProducerInput,
  RegisterServiceProviderInput,
  SearchOffersInput,
} from '@colheita/contracts';
import { ApiError } from './api-error';
import { SessionStorage } from './session-storage';

export interface LotDestinationResult {
  harvestLotId: string;
  destination: string;
  offerId: string | null;
  donationId: string | null;
}

export interface FarmSummary {
  periodDays: number;
  revenue: number;
  expenses: number;
  profit: number;
  stock: Array<{ crop: string; boxesAvailable: number; boxesAwaitingClassification: number }>;
  recentExpenses: Array<{ id: string; description: string; category: string; amount: number; spentAt: string }>;
}

export interface RegisterExpenseInput {
  description: string;
  category: 'SEEDS' | 'FERTILIZER' | 'PESTICIDE' | 'LABOR' | 'FUEL' | 'PACKAGING' | 'EQUIPMENT' | 'OTHER';
  amount: number;
  crop?: string;
}

export interface DonationBoard {
  available: Donation[];
  accepted: Donation[];
}

/** Cliente HTTP único da Colheita Direta (web e mobile). Renova o token de acesso automaticamente. */
export class ColheitaApiClient {
  private refreshInFlight: Promise<AuthSession | null> | null = null;

  constructor(
    private readonly baseUrl: string,
    private readonly sessionStorage: SessionStorage,
    private readonly onSessionExpired: () => void = () => {},
  ) {}

  // ---------- Autenticação ----------
  requestOtp(phoneNumber: string) {
    return this.request<void>('POST', '/auth/otp/request', { phoneNumber }, { authenticated: false });
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<AuthSession> {
    const session = await this.request<AuthSession>('POST', '/auth/otp/verify', { phoneNumber, code }, { authenticated: false });
    await this.sessionStorage.save(session);
    return session;
  }

  async logout(): Promise<void> {
    await this.sessionStorage.clear();
  }

  // ---------- Cadastros (devolvem sessão nova com o papel) ----------
  registerProducer(input: RegisterProducerInput) {
    return this.requestNewSession('/producers', input);
  }
  registerBuyer(input: RegisterBuyerInput) {
    return this.requestNewSession('/buyers', input);
  }
  registerServiceProvider(input: RegisterServiceProviderInput) {
    return this.requestNewSession('/service-providers', input);
  }
  registerNgo(input: RegisterNgoInput) {
    return this.requestNewSession('/ngos', input);
  }

  // ---------- Lotes ----------
  createPhotoUploadUrls(photoCount: number, contentType: string) {
    return this.request<PhotoUploadUrl[]>('POST', '/harvest-lots/photo-upload-urls', { photoCount, contentType });
  }

  async uploadPhoto(uploadUrl: string, photo: Blob, contentType: string): Promise<void> {
    const response = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: photo });
    if (!response.ok) throw new ApiError(response.status, 'UPLOAD_FAILED', 'Não foi possível enviar a foto');
  }

  createHarvestLot(input: CreateHarvestLotInput) {
    return this.request<HarvestLot>('POST', '/harvest-lots', input);
  }
  listHarvestLots() {
    return this.request<HarvestLot[]>('GET', '/harvest-lots');
  }
  getHarvestLot(harvestLotId: string) {
    return this.request<HarvestLot>('GET', `/harvest-lots/${harvestLotId}`);
  }
  confirmLotDestination(harvestLotId: string, input: ConfirmLotDestinationInput) {
    return this.request<LotDestinationResult>('POST', `/harvest-lots/${harvestLotId}/destination`, input);
  }

  // ---------- Marketplace e pedidos ----------
  searchOffers(filters: SearchOffersInput) {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === '' || (Array.isArray(value) && !value.length)) return;
      query.set(key, Array.isArray(value) ? value.join(',') : String(value));
    });
    return this.request<Offer[]>('GET', `/offers?${query.toString()}`, undefined, { authenticated: false });
  }
  getOffer(offerId: string) {
    return this.request<Offer>('GET', `/offers/${offerId}`, undefined, { authenticated: false });
  }
  createOrder(input: CreateOrderInput) {
    return this.request<Order[]>('POST', '/orders', input);
  }
  listOrders() {
    return this.request<Order[]>('GET', '/orders');
  }
  acceptOrder(orderId: string) {
    return this.request<Order>('POST', `/orders/${orderId}/acceptance`);
  }
  confirmOrderDelivery(orderId: string) {
    return this.request<Order>('POST', `/orders/${orderId}/delivery-confirmation`);
  }

  // ---------- Gestão do produtor ----------
  getFarmSummary() {
    return this.request<FarmSummary>('GET', '/farm/summary');
  }
  registerExpense(input: RegisterExpenseInput) {
    return this.request<unknown>('POST', '/farm/expenses', input);
  }

  // ---------- Doações ----------
  listDonations() {
    return this.request<DonationBoard>('GET', '/donations');
  }
  acceptDonation(donationId: string) {
    return this.request<void>('POST', `/donations/${donationId}/acceptance`);
  }
  confirmDonationReceipt(donationId: string, input: ConfirmDonationReceiptInput) {
    return this.request<void>('POST', `/donations/${donationId}/receipt`, input);
  }

  // ---------- Indicadores ----------
  getImpactIndicators() {
    return this.request<ImpactIndicators>('GET', '/impact-indicators', undefined, { authenticated: false });
  }

  // ---------- Infraestrutura ----------
  private async requestNewSession(path: string, body: unknown): Promise<AuthSession> {
    const session = await this.request<AuthSession>('POST', path, body);
    await this.sessionStorage.save(session);
    return session;
  }

  private async request<ResponseBody>(
    method: string,
    path: string,
    body?: unknown,
    options: { authenticated: boolean; isRetry?: boolean } = { authenticated: true },
  ): Promise<ResponseBody> {
    const session = options.authenticated ? await this.sessionStorage.load() : null;
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.status === 401 && options.authenticated && !options.isRetry) {
      const renewedSession = await this.refreshSession();
      if (renewedSession) return this.request(method, path, body, { ...options, isRetry: true });
      this.onSessionExpired();
    }
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorBody.code ?? 'UNKNOWN', errorBody.message ?? 'Algo deu errado. Tente de novo.');
    }
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as ResponseBody;
  }

  /** Uma renovação por vez, mesmo com várias requisições recebendo 401 juntas. */
  private refreshSession(): Promise<AuthSession | null> {
    this.refreshInFlight ??= (async () => {
      const session = await this.sessionStorage.load();
      if (!session) return null;
      try {
        const renewed = await this.request<AuthSession>(
          'POST',
          '/auth/refresh',
          { refreshToken: session.refreshToken },
          { authenticated: false },
        );
        await this.sessionStorage.save(renewed);
        return renewed;
      } catch {
        await this.sessionStorage.clear();
        return null;
      }
    })().finally(() => {
      this.refreshInFlight = null;
    });
    return this.refreshInFlight;
  }
}
