import { useState, useCallback } from 'react';
import * as eventService from '../services/eventService';
import { 
  Event, 
  EventCreateData, 
  EventUpdateData 
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
}

interface EventParams {
  page?: number;
  limit?: number;
  search?: string;
  categories?: string;
  status?: string;
  from?: string;
  to?: string;
  sort?: string;
  approvalStatus?: string;
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
    }
  });

  // Buscar lista de eventos
  const fetchEvents = useCallback(async (params: EventParams = {}) => {
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
  const createEvent = useCallback(async (eventData: EventCreateData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const event = await eventService.createEvent(eventData);
      setState(prev => ({
        ...prev,
        event,
        loading: false,
        success: true
      }));
      return event;
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
  const updateEvent = useCallback(async (id: string, eventData: EventUpdateData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const event = await eventService.updateEvent(id, eventData);
      setState(prev => ({
        ...prev,
        event,
        loading: false,
        success: true,
        // Atualizar o evento na lista se ele estiver nela
        events: prev.events.map(e => e._id === id ? event : e)
      }));
      return event;
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
          e._id === id ? { ...e, approvalStatus: 'approved' } : e
        ),
        event: prev.event?._id === id 
          ? { ...prev.event, approvalStatus: 'approved' } 
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
          e._id === id ? { ...e, approvalStatus: 'rejected' } : e
        ),
        event: prev.event?._id === id 
          ? { ...prev.event, approvalStatus: 'rejected' } 
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
    approveEvent,
    rejectEvent,
    clearState,
    clearError
  };
}; 