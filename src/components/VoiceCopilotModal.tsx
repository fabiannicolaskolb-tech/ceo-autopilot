import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { X, Mic, MicOff, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface TranscriptEntry {
  role: 'user' | 'agent';
  text: string;
}

interface VoiceCopilotModalProps {
  open: boolean;
  onClose: () => void;
  onInsightsSaved: () => void;
}

export function VoiceCopilotModal({ open, onClose, onInsightsSaved }: VoiceCopilotModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const transcriptsRef = useRef<TranscriptEntry[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const conversation = useConversation({
    onConnect: () => {
      console.log('Voice Copilot connected');
    },
    onDisconnect: () => {
      console.log('Voice Copilot disconnected');
    },
    onMessage: (message: any) => {
      if (message.type === 'user_transcript' && message.user_transcription_event?.user_transcript) {
        transcriptsRef.current.push({
          role: 'user',
          text: message.user_transcription_event.user_transcript,
        });
      }
      if (message.type === 'agent_response' && message.agent_response_event?.agent_response) {
        transcriptsRef.current.push({
          role: 'agent',
          text: message.agent_response_event.agent_response,
        });
      }
    },
    onError: (error: any) => {
      console.error('Voice Copilot error:', error);
      toast({
        title: 'Verbindungsfehler',
        description: 'Die Verbindung zum Sparringspartner konnte nicht hergestellt werden.',
        variant: 'destructive',
      });
    },
  });

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    transcriptsRef.current = [];
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const { data, error } = await supabase.functions.invoke('voice-copilot-token');
      if (error || !data?.token) {
        throw new Error(error?.message || 'Kein Token erhalten');
      }

      await conversation.startSession({
        conversationToken: data.token,
        connectionType: 'webrtc',
      });
    } catch (err: any) {
      console.error('Failed to start conversation:', err);
      toast({
        title: 'Fehler',
        description: err?.message || 'Konnte Gespräch nicht starten.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, toast]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
    setIsSaving(true);

    try {
      const transcripts = transcriptsRef.current;
      const fullTranscript = transcripts
        .map(t => `${t.role === 'user' ? 'Sie' : 'Copilot'}: ${t.text}`)
        .join('\n\n');

      // Extract key points from user statements (filter short filler)
      const keyPoints = transcripts
        .filter(t => t.role === 'user' && t.text.trim().length > 20)
        .map(t => t.text.trim());

      if (keyPoints.length === 0) {
        toast({ title: 'Keine Erkenntnisse', description: 'Das Gespräch war zu kurz für verwertbare Inhalte.' });
        onClose();
        return;
      }

      const conversationId = conversation.getId?.() || crypto.randomUUID();

      const { error } = await supabase.from('voice_insights' as any).insert({
        user_id: user!.id,
        conversation_id: conversationId,
        transcript: fullTranscript,
        key_points: keyPoints,
      });

      if (error) throw error;

      toast({ title: 'Erkenntnisse gespeichert', description: `${keyPoints.length} Key Points aus dem Gespräch extrahiert.` });
      onInsightsSaved();
    } catch (err: any) {
      console.error('Error saving insights:', err);
      toast({ title: 'Fehler beim Speichern', description: err?.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
      onClose();
    }
  }, [conversation, user, toast, onClose, onInsightsSaved]);

  // Waveform visualizer
  useEffect(() => {
    if (!open || conversation.status !== 'connected') {
      cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      let frequencyData: Uint8Array | undefined;
      try {
        frequencyData = conversation.isSpeaking
          ? conversation.getOutputByteFrequencyData?.()
          : conversation.getInputByteFrequencyData?.();
      } catch {
        // SDK may not support these methods
      }

      const barCount = 48;
      const barWidth = width / barCount - 2;
      const centerY = height / 2;

      for (let i = 0; i < barCount; i++) {
        const value = frequencyData ? frequencyData[i * 2] || 0 : Math.random() * 30;
        const barHeight = Math.max(4, (value / 255) * centerY * 1.6);

        const hue = conversation.isSpeaking ? 220 : 160;
        ctx.fillStyle = `hsla(${hue}, 60%, 70%, 0.8)`;

        const x = i * (barWidth + 2);
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [open, conversation.status, conversation.isSpeaking]);

  // Auto-start on open
  useEffect(() => {
    if (open && conversation.status === 'disconnected' && !isConnecting) {
      startConversation();
    }
  }, [open]);

  if (!open) return null;

  const isConnected = conversation.status === 'connected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'hsl(222 50% 6% / 0.95)' }}>
      <div className="relative w-full max-w-lg mx-4 flex flex-col items-center gap-8 py-12">
        {/* Close */}
        <button
          onClick={() => {
            if (isConnected) endConversation();
            else onClose();
          }}
          className="absolute top-0 right-0 p-2 text-white/50 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Status */}
        <div className="text-center space-y-2">
          <h2 className="text-white font-playfair text-2xl font-semibold">
            {isSaving
              ? 'Erkenntnisse werden gespeichert...'
              : isConnecting
                ? 'Verbinde mit Sparringspartner...'
                : isConnected
                  ? conversation.isSpeaking
                    ? 'Copilot spricht...'
                    : 'Ich höre zu...'
                  : 'Bereit für Ihr Gespräch'
            }
          </h2>
          <p className="text-white/50 text-sm max-w-sm mx-auto">
            Erzählen Sie von Ihrem Tag, einer Erkenntnis oder einer Herausforderung. Ich filtere die besten Geschichten für LinkedIn heraus.
          </p>
        </div>

        {/* Waveform */}
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          className="w-full max-w-[400px]"
          style={{ opacity: isConnected ? 1 : 0.2 }}
        />

        {/* Mic indicator */}
        <div className={`p-6 rounded-full transition-all duration-500 ${
          isConnected
            ? conversation.isSpeaking
              ? 'bg-primary/20 ring-2 ring-primary/40'
              : 'bg-emerald-500/20 ring-2 ring-emerald-500/40 animate-pulse'
            : 'bg-white/5'
        }`}>
          {isConnecting || isSaving ? (
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          ) : isConnected ? (
            <Mic className="h-8 w-8 text-white" />
          ) : (
            <MicOff className="h-8 w-8 text-white/40" />
          )}
        </div>

        {/* Actions */}
        {isConnected && (
          <Button
            onClick={endConversation}
            variant="outline"
            className="border-white/20 text-white bg-white/5 hover:bg-white/10 rounded-sm"
          >
            Gespräch beenden & Erkenntnisse extrahieren
          </Button>
        )}
      </div>
    </div>
  );
}
