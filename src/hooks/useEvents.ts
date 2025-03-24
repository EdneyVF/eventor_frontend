import { useState, useCallback } from 'react';
import * as eventService from '../services/eventService';
import { 
  Event, 
  EventCreateData, 
  EventUpdateData,
  EventQueryParams
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
    // Para eventos criados pelo usuário
    total?: number;
    active?: number;
    inactive?: number;
    canceled?: number;
    finished?: number;
    pending?: number;
    approved?: number;
    rejected?: number;
    
    // Para eventos que o usuário participa
    upcoming?: number;
    past?: number;
  };
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
    counts: {}
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
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const events = await eventService.getPendingEvents();
      setState(prev => ({
        ...prev,
        events,
        loading: false,
        success: true
      }));
      return events;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar eventos pendentes';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Buscar evento por ID
  const fetchEventById = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const event = await eventService.getEventById(id);
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
      const result = await eventService.updateEvent(id, data);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        // Atualizar o status do evento na lista
        events: prev.events.map(e => 
          e._id === id ? { ...e, ...result, approvalStatus: 'pending', status: 'inativo' } : e
        ),
        event: prev.event?._id === id 
          ? { ...prev.event, ...result, approvalStatus: 'pending', status: 'inativo' } 
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
      const result = await eventService.deleteEvent(id);
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

  // Aprovar evento (admin)
  const approveEvent = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await eventService.approveEvent(id);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        // Atualizar o status do evento na lista
        events: prev.events.map(e => 
          e._id === id ? { ...e, approvalStatus: 'approved', status: 'ativo' } : e
        ),
        event: prev.event?._id === id 
          ? { ...prev.event, approvalStatus: 'approved', status: 'ativo' } 
          : prev.event
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao aprovar evento';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
    }
  }, []);

  // Rejeitar evento (admin)
  const rejectEvent = useCallback(async (id: string, reason: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await eventService.rejectEvent(id, reason);
      setState(prev => ({
        ...prev,
        loading: false,
        success: true,
        // Atualizar o status do evento na lista
        events: prev.events.map(e => 
          e._id === id ? { ...e, approvalStatus: 'rejected', status: 'inativo' } : e
        ),
        event: prev.event?._id === id 
          ? { ...prev.event, approvalStatus: 'rejected', status: 'inativo' } 
          : prev.event
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao rejeitar evento';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false
      }));
      throw error;
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
          e._id === id ? { ...e, status: 'cancelado' } : e
        ),
        event: prev.event?._id === id 
          ? { ...prev.event, status: 'cancelado' } 
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
      counts: {}
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
    approveEvent,
    rejectEvent,
    fetchMyEvents,
    fetchParticipatingEvents,
    participateInEvent,
    cancelEventParticipation,
    cancelEvent,
    clearState,
    clearError
  };
}; 