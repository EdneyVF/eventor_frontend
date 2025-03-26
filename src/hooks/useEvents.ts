import { useState, useCallback } from 'react';
import * as eventService from '../services/eventService';
import { 
  Event, 
  EventCreateData, 
  EventUpdateData,
  EventQueryParams,
  EventOrganizer,
  updateEvent as apiUpdateEvent, 
  deleteEvent as apiDeleteEvent,
  approveEvent as apiApproveEvent,
  rejectEvent as apiRejectEvent,
  listPendingEvents,
  getEventById,
  getAllEventsAdmin
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
    inactive: number;
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
      inactive: 0,
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
      
      // Map the PendingEventsResponse events to Event objects
      const mappedEvents = response.events.map(event => ({
        _id: event._id,
        title: event.title,
        organizer: event.organizer as EventOrganizer,
        category: {
          _id: event.category._id || 'unknown',
          name: event.category.name
        },
        description: event.description || '',
        date: event.date || new Date().toISOString(),
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        status: event.status || 'inactive',
        approvalStatus: event.approvalStatus || 'pending',
        capacity: event.capacity,
        location: event.location || { address: '', city: '', state: '', country: '' },
        price: event.price || 0,
        isFullyBooked: event.isFullyBooked || false,
        participantsCount: event.participantsCount || 0
      })) as Event[];

      setState(prev => ({
        ...prev,
        events: mappedEvents,
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
      const response = await eventService.createEvent(data);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        events: response.event ? [response.event, ...prev.events] : prev.events
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
      
      // Atualizar o evento na lista
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        // Usar o evento retornado pela API, que já terá o status correto 
        // (pendente para usuários normais ou aprovado para admins)
        events: prev.events.map(e => 
          e._id === id ? { ...e, ...result.event } : e
        ),
        // Atualizar o evento atual se for o mesmo
        event: prev.event?._id === id ? { ...prev.event, ...result.event } : prev.event
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
        counts: {
          total: response.counts?.upcoming + response.counts?.past + response.counts?.canceled || 0,
          active: response.counts?.upcoming || 0,
          inactive: 0,
          canceled: response.counts?.canceled || 0,
          finished: response.counts?.past || 0,
          pending: 0,
          approved: 0,
          rejected: 0
        }
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
        inactive: 0,
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

  // Buscar todos os eventos (admin)
  const fetchAllEvents = useCallback(async (params: EventQueryParams = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await getAllEventsAdmin(params);
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
        counts: response.counts
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

  return {
    ...state,
    fetchEvents,
    fetchPendingEvents,
    fetchAllEvents,
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