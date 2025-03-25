import { useState, useCallback } from 'react';
import * as eventService from '../services/eventService';
import { 
  Event, 
  EventCreateData, 
  EventUpdateData,
  EventQueryParams,
  PendingEventsResponse,
  getEvents, 
  createEvent as apiCreateEvent, 
  updateEvent as apiUpdateEvent, 
  deleteEvent as apiDeleteEvent,
  approveEvent as apiApproveEvent,
  rejectEvent as apiRejectEvent,
  listPendingEvents,
  getEventById
} from '../services/eventService';

interface UseEventsState {
  events: Event[];
  event: Event | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
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

export interface ApiError {
  message: string;
  status?: number;
}

export const useEvents = () => {
  const [state, setState] = useState<UseEventsState>({
    events: [],
    event: null,
    loading: false,
    error: null,
    success: false,
    pagination: {
      page: 1,
      pages: 1,
      total: 0
    },
    counts: {
      total: 0,
      active: 0,
      canceled: 0,
      finished: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    }
  });

  // Buscar lista de eventos
  const fetchEvents = useCallback(async (params: EventQueryParams = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await eventService.getEvents(params);
      setState(prev => ({
        ...prev,
        events: response.events,
        loading: false,
        success: true,
        pagination: {
          page: response.page,
          pages: response.pages,
          total: response.total
        }
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar eventos';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Buscar eventos pendentes (admin)
  const fetchPendingEvents = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await listPendingEvents();
      setState(prev => ({
        ...prev,
        events: response.events.map(event => ({
          _id: event.id,
          title: event.title,
          organizer: event.organizer,
          category: event.category
        } as Event)),
        loading: false,
        success: true
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (err as ApiError)?.message || 'Erro ao carregar eventos pendentes';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
    }
  }, []);

  // Buscar evento por ID
  const fetchEventById = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const event = await getEventById(id);
      setState(prev => ({
        ...prev,
        event,
        loading: false,
        success: true
      }));
      return event;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar evento';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Criar evento
  const createEvent = useCallback(async (data: EventCreateData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await getEvents(data);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        events: [response.event, ...prev.events]
      }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar evento';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Atualizar evento
  const updateEvent = useCallback(async (id: string, data: EventUpdateData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await apiUpdateEvent(id, data);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        // Atualizar o status do evento na lista
        events: prev.events.map(e => 
          e._id === id ? { ...e, ...result, approvalStatus: 'pending', status: 'inactive' } : e
        ),
        event: prev.event?._id === id 
          ? { ...prev.event, ...result, approvalStatus: 'pending', status: 'inactive' } 
          : prev.event
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar evento';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Excluir evento
  const deleteEvent = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await apiDeleteEvent(id);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        // Remover o evento da lista
        events: prev.events.filter(e => e._id !== id),
        event: prev.event?._id === id ? null : prev.event
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir evento';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Aprovar evento
  const handleApproveEvent = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiApproveEvent(id);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true
      }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (err as ApiError)?.message || 'Erro ao aprovar evento';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw err;
    }
  }, []);

  // Rejeitar evento
  const handleRejectEvent = useCallback(async (id: string, reason: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await apiRejectEvent(id, reason);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true
      }));
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (err as ApiError)?.message || 'Erro ao rejeitar evento';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw err;
    }
  }, []);

  // Buscar eventos criados pelo usuário
  const fetchMyEvents = useCallback(async (params: EventQueryParams = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await eventService.getMyEvents(params);
      setState(prev => ({
        ...prev,
        events: response.events,
        loading: false,
        success: true,
        pagination: {
          page: response.page,
          pages: response.pages,
          total: response.total
        },
        counts: response.counts || {}
      }));
      return response.events;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar meus eventos';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Buscar eventos que o usuário está participando
  const fetchParticipatingEvents = useCallback(async (params: EventQueryParams = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await eventService.getParticipatingEvents(params);
      setState(prev => ({
        ...prev,
        events: response.events,
        loading: false,
        success: true,
        pagination: {
          page: response.page,
          pages: response.pages,
          total: response.total
        },
        counts: response.counts || {}
      }));
      return response.events;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar eventos que estou participando';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Cancelar participação em um evento
  const cancelEventParticipation = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await eventService.cancelParticipation(id);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        // Remover o evento da lista de participando se estiver sendo mostrado
        events: prev.events.filter(e => e._id !== id)
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao cancelar participação';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Cancelar evento
  const cancelEvent = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await eventService.cancelEvent(id);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        // Atualizar o status do evento na lista
        events: prev.events.map(e => 
          e._id === id ? { ...e, status: 'canceled' } : e
        ),
        event: prev.event?._id === id 
          ? { ...prev.event, status: 'canceled' } 
          : prev.event
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao cancelar evento';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Participar de um evento
  const participateInEvent = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await eventService.participateInEvent(id);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        // Atualizar o evento atual se estiver sendo visualizado
        event: prev.event?._id === id 
          ? { ...prev.event, participantsCount: (prev.event.participantsCount || 0) + 1 } 
          : prev.event
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao participar do evento';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Limpar estado
  const clearState = useCallback(() => {
    setState({
      events: [],
      event: null,
      loading: false,
      error: null,
      success: false,
      pagination: {
        page: 1,
        pages: 1,
        total: 0
      },
      counts: {
        total: 0,
        active: 0,
        canceled: 0,
        finished: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      }
    });
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchEvents,
    fetchPendingEvents,
    fetchEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    approveEvent: handleApproveEvent,
    rejectEvent: handleRejectEvent,
    fetchMyEvents,
    fetchParticipatingEvents,
    participateInEvent,
    cancelEventParticipation,
    cancelEvent,
    clearState,
    clearError
  };
};

export default useEvents; 