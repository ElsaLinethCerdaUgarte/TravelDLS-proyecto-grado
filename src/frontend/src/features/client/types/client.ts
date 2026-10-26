export type Page<T> = {
  data: T[];
  meta: { total: number; currentPage: number; lastPage: number; perPage: number };
  summary?: { totalAmount: number };
};

export type ClientProfile = {
  idClient: number;
  companyName: string;
  ruc: string;
  address: string;
  typeClient: "legal" | "natural";
  photoUrl: string | null;
};

export type Company = {
  idCompany: number;
  businessName: string;
  ruc?: string;
  photoUrl?: string | null;
};

export type OrderDetail = {
  idDetails: number;
  idOrder: number;
  cargoDescription: string;
  amount: number;
  unitWeight: string;
  deliveryAddress: string;
  typePackaging: string;
  rate?: number | null;
  deletedAt?: string | null;
  driver?: { user?: { name?: string }; name?: string } | null;
};

export type Order = {
  idOrder: number;
  idClient: number;
  idCompany: number;
  status: string;
  createdAt: string;
  company?: Company;
  details?: OrderDetail[];
  payment?: Payment | null;
};

export type Payment = {
  idPayment: number;
  idOrder: number;
  amount: number;
  status: string;
  method: "card" | "transfer";
  billingEmail: string;
  referenceCode: string;
  last4?: string | null;
  transferReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
  order?: { idOrder: number; status: string } | null;
  company?: Company | null;
};

export type Tracking = {
  latitude: number;
  longitude: number;
  updatedAt: string;
};

export type NewDetail = {
  cargoDescription: string;
  amount: number;
  unitWeight: string;
  deliveryAddress: string;
  typePackaging: string;
};

export const packagingTypes = [
  { value: "pallet", label: "Pallet" },
  { value: "caja", label: "Caja" },
  { value: "granel", label: "Granel" },
  { value: "contenedor", label: "Contenedor" },
  { value: "bidon", label: "Bidón" },
  { value: "saco", label: "Saco" },
  { value: "atado", label: "Atado" },
  { value: "otro", label: "Otro" },
];

export const orderStatusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  esperando_aprobacion: "Cotización recibida",
  aceptado: "Aceptado",
  denegado: "Rechazado",
  en_transito: "En tránsito",
  entregado: "Entregado",
  cancelado: "Cancelado",
  anulado: "Anulado",
};

export type OrderFilter = "all" | "pendiente" | "esperando_aprobacion" | "en_transito" | "entregado" | "cancelled";

export function matchesOrderFilter(status: string, filter: OrderFilter) {
  if (filter === "all") return true;
  if (filter === "cancelled") return ["cancelado", "anulado", "denegado"].includes(status);
  return status === filter;
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("es-NI");
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "NIO",
  }).format(value);
}
