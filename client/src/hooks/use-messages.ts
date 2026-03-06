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
    onMutate: async (id: number) => {
      // Cancela queries em andamento para não sobrescrever o optimistic update
      await queryClient.cancelQueries({ queryKey: ["/api/messages"] });

      // Snapshot do estado anterior para rollback
      const previousMessages = queryClient.getQueriesData({ queryKey: ["/api/messages"] });

      // Atualiza todas as caches de mensagens imediatamente
      queryClient.setQueriesData({ queryKey: ["/api/messages"] }, (old: FaithMessage[] | undefined) => {
        if (!old) return old;
        return old.map(msg =>
          msg.id === id ? { ...msg, likesCount: msg.likesCount + 1 } : msg
        );
      });

      return { previousMessages };
    },
    onError: (_err, _id, context) => {
      // Reverte em caso de erro
      if (context?.previousMessages) {
        context.previousMessages.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
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
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["/api/messages"] });

      const previousMessages = queryClient.getQueriesData({ queryKey: ["/api/messages"] });

      queryClient.setQueriesData({ queryKey: ["/api/messages"] }, (old: FaithMessage[] | undefined) => {
        if (!old) return old;
        return old.map(msg =>
          msg.id === id ? { ...msg, isPardoned: true } : msg
        );
      });

      return { previousMessages };
    },
    onError: (_err, _id, context) => {
      if (context?.previousMessages) {
        context.previousMessages.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
  });
}
