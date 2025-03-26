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
  pending: '/api/events/approval/pending',
  myEvents: '/api/events/my-events',
  participating: '/api/events/participating',
  participate: (id: string) => `/api/events/${id}/participate`,
  cancelParticipation: (id: string) => `/api/events/${id}/participate`,
  approvalStatus: (id: string) => `/api/events/${id}/approval-status`,
  adminAll: '/api/events/admin/all',
  activate: (id: string) => `/api/events/${id}/activate`,
  deactivate: (id: string) => `/api/events/${id}/deactivate`,
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
  capacity: number | null;
  price: number;
  organizer: EventOrganizer;
  status: 'active' | 'inactive' | 'canceled' | 'finished';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isFullyBooked: boolean;
  participantsCount: number;
  participants?: EventOrganizer[];
  tags?: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
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
  capacity: number | null;
  price?: number;
  tags?: string[];
  imageUrl?: string;
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
  organizer?: string;
  all?: boolean;
}

// Buscar lista de eventos com paginação e filtros
export const getEvents = async (params: EventQueryParams = {}) => {
  const response = await api.get<EventsResponse>(EVENT_ROUTES.list, { params });
  return response.data;
};

// Interface para resposta de eventos pendentes
export interface PendingEventsResponse {
  success: boolean;
  count: number;
  events: Array<{
    _id: string;
    title: string;
    organizer: {
      name: string;
      email: string;
    };
    category: {
      name: string;
      _id?: string;
    };
    description?: string;
    date?: string;
    createdAt?: string;
    updatedAt?: string;
    capacity?: number | null;
    price?: number;
    status?: string;
    approvalStatus?: string;
    location?: EventLocation;
    isFullyBooked?: boolean;
    participantsCount?: number;
  }>;
}

// Interface para resposta de status de aprovação
export interface ApprovalStatusResponse {
  success: boolean;
  data: {
    approvalStatus: 'pending' | 'approved' | 'rejected';
    approvedBy?: {
      name: string;
    };
    approvalDate?: Date;
    rejectionReason?: string;
  };
}

// Buscar eventos pendentes de aprovação (apenas para admin)
export const listPendingEvents = async () => {
  const response = await api.get<PendingEventsResponse>(EVENT_ROUTES.pending);
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
      status: 'inactive'
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
      status: 'inactive'
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
  const response = await api.put<{
    success: boolean;
    message: string;
    event: Event;
  }>(EVENT_ROUTES.approve(id));
  return response.data;
};

// Rejeitar um evento (apenas para admin)
export const rejectEvent = async (id: string, reason: string) => {
  const response = await api.put<{
    success: boolean;
    message: string;
    event: Event;
  }>(EVENT_ROUTES.reject(id), { reason });
  return response.data;
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
    inactive: number;
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

// Obter status de aprovação de um evento
export const getApprovalStatus = async (id: string) => {
  const response = await api.get<ApprovalStatusResponse>(EVENT_ROUTES.approvalStatus(id));
  return response.data;
};

// Interface para resposta de eventos administrativos (todos os eventos)
export interface AdminEventsResponse {
  events: Event[];
  page: number;
  pages: number;
  total: number;
  counts: {
    total: number;
    active: number;
    inactive: number;
    canceled: number;
    finished: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

// Buscar todos eventos (admin)
export const getAllEventsAdmin = async (params: EventQueryParams = {}) => {
  const response = await api.get<AdminEventsResponse>(EVENT_ROUTES.adminAll, { params });
  return response.data;
};

// Ativar um evento (apenas para admin)
export const activateEvent = async (id: string) => {
  const response = await api.put<{
    success: boolean;
    message: string;
    event: Event;
  }>(EVENT_ROUTES.activate(id));
  return response.data;
};

// Inativar um evento (apenas para admin)
export const deactivateEvent = async (id: string) => {
  const response = await api.put<{
    success: boolean;
    message: string;
    event: Event;
  }>(EVENT_ROUTES.deactivate(id));
  return response.data;
}; 