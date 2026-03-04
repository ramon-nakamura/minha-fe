import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export type MessageType = 'prayer' | 'grace' | 'sin';

export interface FaithMessage {
  id: number;
  type: MessageType;
  content: string;
  likesCount: number;
  isPardoned: boolean;
  isSpecial: boolean;
  isPrivate: boolean;
  createdAt: string;
  authorName?: string;
  authorImage?: string;
}

export interface CreateMessageInput {
  type: MessageType;
  content: string;
  isSpecial?: boolean;
  isPrivate?: boolean;
}

export function useMessages(params?: { type?: MessageType | 'all', authorId?: string }) {
  return useQuery<FaithMessage[]>({
    queryKey: ["/api/messages", params],
    queryFn: async () => {
      let url = "/api/messages";
      const searchParams = new URLSearchParams();
      if (params?.type && params.type !== 'all') searchParams.append('type', params.type);
      if (params?.authorId) searchParams.append('authorId', params.authorId);
      
      if (searchParams.toString()) url += `?${searchParams.toString()}`;
      
      const res = await apiRequest("GET", url);
      return res.json();
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/messages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });
}

export function useDeleteMessages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: number[]) => {
      await apiRequest("POST", "/api/messages/delete-bulk", { ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateMessageInput) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });
}

export function useLikeMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/messages/${id}/like`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });
}

export function usePardonMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/messages/${id}/pardon`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });
}
