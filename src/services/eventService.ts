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
  myEvents: '/api/events/my-events',
  participating: '/api/events/participating',
  participate: (id: string) => `/api/events/${id}/participate`,
  cancelParticipation: (id: string) => `/api/events/${id}/participate`,
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
  status: 'ativo' | 'inativo' | 'cancelado' | 'finalizado';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isFullyBooked: boolean;
  participantsCount: number;
  participants?: EventOrganizer[];
  tags?: string[];
  imageUrl?: string;
}

export interface EventsResponse {
  events: Event[];
  page: number;
  pages: number;
  total: number;
  filters?: Record<string, unknown>;
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

export type EventUpdateData = Partial<EventCreateData>;

// Parâmetros para consulta de eventos
export interface EventQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categories?: string;
  status?: string;
  from?: string;
  to?: string;
  sort?: string;
  approvalStatus?: string;
  when?: string;
}

// Buscar lista de eventos com paginação e filtros
export const getEvents = async (params: EventQueryParams = {}) => {
  const response = await api.get<EventsResponse>(EVENT_ROUTES.list, { params });
  return response.data;
};

// Buscar eventos pendentes de aprovação (apenas para admin)
export const getPendingEvents = async () => {
  const response = await api.get<Event[]>(EVENT_ROUTES.pending);
  return response.data;
};

// Buscar um evento específico por ID
export const getEventById = async (id: string) => {
  const response = await api.get<Event>(EVENT_ROUTES.detail(id));
  return response.data;
};

// Criar um novo evento
export const createEvent = async (data: EventCreateData) => {
  const response = await api.post(EVENT_ROUTES.create, data);
  return {
    success: true,
    message: 'Evento criado com sucesso!',
    event: {
      ...response.data,
      approvalStatus: 'pending',
      status: 'inativo'
    }
  };
};

// Atualizar um evento existente
export const updateEvent = async (id: string, data: EventUpdateData) => {
  const response = await api.put(EVENT_ROUTES.update(id), data);
  return {
    success: true,
    message: 'Evento atualizado com sucesso!',
    event: {
      ...response.data,
      approvalStatus: 'pending',
      status: 'inativo'
    }
  };
};

// Deletar um evento
export const deleteEvent = async (id: string) => {
  const response = await api.delete(EVENT_ROUTES.delete(id));
  return response.data;
};

// Aprovar um evento (apenas para admin)
export const approveEvent = async (id: string) => {
  const response = await api.put(EVENT_ROUTES.approve(id));
  return {
    success: true,
    message: 'Evento aprovado com sucesso!',
    event: {
      ...response.data,
      approvalStatus: 'approved',
      status: 'ativo'
    }
  };
};

// Rejeitar um evento (apenas para admin)
export const rejectEvent = async (id: string, reason: string) => {
  const response = await api.put(EVENT_ROUTES.reject(id), { reason });
  return {
    success: true,
    message: 'Evento rejeitado com sucesso!',
    event: {
      ...response.data,
      approvalStatus: 'rejected',
      status: 'inativo'
    }
  };
};

// Cancelar um evento
export const cancelEvent = async (id: string) => {
  const response = await api.put(EVENT_ROUTES.cancelEvent(id));
  return response.data;
};

// Interface para resposta de eventos criados pelo usuário
export interface MyEventsResponse {
  events: Event[];
  page: number;
  pages: number;
  total: number;
  counts: {
    total: number;
    active: number;
    canceled: number;
    finished: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

// Buscar eventos criados pelo usuário logado
export const getMyEvents = async (params: EventQueryParams = {}) => {
  const response = await api.get<MyEventsResponse>(EVENT_ROUTES.myEvents, { params });
  return response.data;
};

// Interface para resposta de eventos que o usuário participa
export interface ParticipatingEventsResponse {
  events: Event[];
  page: number;
  pages: number;
  total: number;
  counts: {
    upcoming: number;
    past: number;
    canceled: number;
  };
}

// Buscar eventos em que o usuário está participando
export const getParticipatingEvents = async (params: EventQueryParams = {}) => {
  const response = await api.get<ParticipatingEventsResponse>(EVENT_ROUTES.participating, { params });
  return response.data;
};

// Participar de um evento
export const participateInEvent = async (id: string) => {
  const response = await api.post(EVENT_ROUTES.participate(id));
  return response.data;
};

// Cancelar participação em um evento
export const cancelParticipation = async (id: string) => {
  const response = await api.delete(EVENT_ROUTES.cancelParticipation(id));
  return response.data;
}; 