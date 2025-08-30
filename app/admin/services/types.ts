export interface ServiceOption {
  id: string;
  price: string;
  coverage: string;
  meals: string;
  team: string;
  idealFor: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  type: 'TIERED' | 'PER_HEAD';
  options: ServiceOption[] | null; // JSON field
  price: string | null; // For per-head services
  minGuests: string | null; // For per-head services
}
