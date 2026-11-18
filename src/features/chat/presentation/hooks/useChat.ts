import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { GetMessagesUseCase } from '@features/chat/application/use-cases/GetMessagesUseCase';
import { SendImageMessageUseCase } from '@features/chat/application/use-cases/SendImageMessageUseCase';
import { SendMessageUseCase } from '@features/chat/application/use-cases/SendMessageUseCase';
import { SubscribeToRoomUseCase } from '@features/chat/application/use-cases/SubscribeToRoomUseCase';
import { Message } from '@features/chat/domain/entities/Message';
import {
  IChatRepository,
  ImageToUpload,
} from '@features/chat/domain/repositories/IChatRepository';
import { SupabaseChatRepository } from '@features/chat/infrastructure/repositories/SupabaseChatRepository';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

const chatRepo: IChatRepository = new SupabaseChatRepository();
const sendMessageUseCase = new SendMessageUseCase(chatRepo);
const sendImageUseCase = new SendImageMessageUseCase(chatRepo);
const getMessagesUseCase = new GetMessagesUseCase(chatRepo);
const subscribeUseCase = new SubscribeToRoomUseCase(chatRepo);

export function useChat(roomId: string) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const messagesKey = ['messages', roomId];

  // Paso 1: historial de mensajes con cache
  const { data: messages = [], isLoading } = useQuery({
    queryKey: messagesKey,
    queryFn: () => getMessagesUseCase.execute(roomId),
    enabled: !!user,
    // El historial no se revalida solo: Realtime se encarga de los mensajes nuevos
    staleTime: Infinity,
  });

  // Paso 2: suscribirse al canal Realtime e inyectar mensajes en el cache
  // --- Helpers de cache compartidos por texto e imágenes ---
  const addMessage = useCallback(
    (msg: Message) => {
      queryClient.setQueryData<Message[]>(['messages', roomId], (old = []) =>
        old.some((m) => m.id === msg.id) ? old : [...old, msg],
      );
    },
    [queryClient, roomId],
  );

  const replaceTempMessage = useCallback(
    (tempId: string, realMsg: Message) => {
      queryClient.setQueryData<Message[]>(['messages', roomId], (old = []) => {
        const withoutTemp = old.filter((m) => m.id !== tempId);
        // Realtime pudo haber agregado el mensaje real antes que esta respuesta
        return withoutTemp.some((m) => m.id === realMsg.id)
          ? withoutTemp
          : [...withoutTemp, realMsg];
      });
    },
    [queryClient, roomId],
  );

  const removeTempMessage = useCallback(
    (tempId: string) => {
      queryClient.setQueryData<Message[]>(['messages', roomId], (old = []) =>
        old.filter((m) => m.id !== tempId),
      );
    },
    [queryClient, roomId],
  );

  useEffect(() => {
    const unsubscribe = subscribeUseCase.execute(roomId, (newMsg) => {
      addMessage(newMsg); // Evita duplicados si el optimistic update ya lo agregó
    });
    return unsubscribe; // Cleanup al desmontar: cierra el canal
  }, [roomId, addMessage]);

  // Paso 3: enviar mensaje de texto con optimistic update
  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessageUseCase.execute(roomId, user!.id, content),
    onMutate: (content: string) => {
      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        roomId,
        userId: user!.id,
        content,
        createdAt: new Date(),
        authorUsername: user!.username,
      };
      addMessage(tempMsg);
      return { tempMsg }; // Contexto para onError
    },
    onSuccess: (realMsg, _content, context) => {
      if (context?.tempMsg) replaceTempMessage(context.tempMsg.id, realMsg);
    },
    onError: (_err, _content, context) => {
      if (context?.tempMsg) removeTempMessage(context.tempMsg.id);
    },
  });

  // Paso 4: enviar imagen: el URI local se muestra al instante y luego se
  // reemplaza por la URL pública devuelta por Supabase Storage.
  const sendImageMutation = useMutation({
    mutationFn: (image: ImageToUpload) => sendImageUseCase.execute(roomId, user!.id, image),
    onMutate: (image: ImageToUpload) => {
      const tempMsg: Message = {
        id: `temp-${Date.now()}`,
        roomId,
        userId: user!.id,
        content: '',
        createdAt: new Date(),
        authorUsername: user!.username,
        imageUrl: image.uri,
      };
      addMessage(tempMsg);
      return { tempMsg };
    },
    onSuccess: (realMsg, _image, context) => {
      if (context?.tempMsg) replaceTempMessage(context.tempMsg.id, realMsg);
    },
    onError: (_err, _image, context) => {
      if (context?.tempMsg) removeTempMessage(context.tempMsg.id);
    },
  });

  return {
    messages,
    sendMessage: sendMutation.mutate,
    isLoading,
    isSending: sendMutation.isPending,
    sendImage: sendImageMutation.mutate,
    isSendingImage: sendImageMutation.isPending,
    imageError: sendImageMutation.error?.message ?? null,
  };
}
