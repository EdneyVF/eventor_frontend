import api from './api';

const EVENT_ROUTES = {
  list: '/api/events',
  detail: (id: string) => `/api/events/${id}`,
  create: '/api/events',
  update: (id: string) => `/api/events/${id}`,
  delete: (id: string) => `/api/events/${id}`,
  approve: (id: string) => `/api/events/${id}/approve`,
  reject: (id: string) => `/api/events/${id}/reject`,
  cancelEvent: (id: string) => `/api/events/${id}/cancel`,
  pending: '/api/events/pending',
};

// Interfaces
export interface EventLocation {
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface EventCategory {
  _id: string;
  name: string;
}

export interface EventOrganizer {
  _id: string;
  name: string;
  email: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: EventLocation;
  category: EventCategory;
  capacity: number;
  price: number;
  organizer: EventOrganizer;
  status: 'ativo' | 'cancelado' | 'finalizado';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isFullyBooked: boolean;
  participantsCount: number;
  tags?: string[];
}

export interface EventsResponse {
  events: Event[];
  page: number;
  pages: number;
  total: number;
  filters?: any;
}

export interface EventCreateData {
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: {
    address: string;
    city: string;
    state: string;
    country?: string;
  };
  category: string;
  capacity: number;
  price?: number;
  tags?: string[];
}

export interface EventUpdateData extends Partial<EventCreateData> {}

// Buscar lista de eventos com paginação e filtros
export const getEvents = async (params: any = {}) => {
  try {
    const response = await api.get<EventsResponse>(EVENT_ROUTES.list, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Buscar eventos pendentes de aprovação (apenas para admin)
export const getPendingEvents = async () => {
  try {
    const response = await api.get<Event[]>(EVENT_ROUTES.pending);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Buscar um evento específico por ID
export const getEventById = async (id: string) => {
  try {
    const response = await api.get<Event>(EVENT_ROUTES.detail(id));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Criar um novo evento
export const createEvent = async (eventData: EventCreateData) => {
  try {
    const response = await api.post<Event>(EVENT_ROUTES.create, eventData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Atualizar um evento existente
export const updateEvent = async (id: string, eventData: EventUpdateData) => {
  try {
    const response = await api.put<Event>(EVENT_ROUTES.update(id), eventData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Deletar um evento
export const deleteEvent = async (id: string) => {
  try {
    const response = await api.delete(EVENT_ROUTES.delete(id));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Aprovar um evento (apenas para admin)
export const approveEvent = async (id: string) => {
  try {
    const response = await api.put(EVENT_ROUTES.approve(id));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Rejeitar um evento (apenas para admin)
export const rejectEvent = async (id: string, reason: string) => {
  try {
    const response = await api.put(EVENT_ROUTES.reject(id), { reason });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cancelar um evento
export const cancelEvent = async (id: string) => {
  try {
    const response = await api.put(EVENT_ROUTES.cancelEvent(id));
    return response.data;
  } catch (error) {
    throw error;
  }
}; 