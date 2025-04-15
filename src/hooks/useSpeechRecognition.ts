
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export const useSpeechRecognition = (
  onTranscriptChange: (transcript: string) => void
) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const speechRecognition = useRef<any>(null);

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = true;
      speechRecognition.current.interimResults = true;
      speechRecognition.current.lang = 'en-US'; // Default language
      
      speechRecognition.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
          
        onTranscriptChange(transcript);
      };
      
      speechRecognition.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      speechRecognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onTranscriptChange]);

  const toggleListening = () => {
    if (isListening) {
      speechRecognition.current.stop();
      setIsListening(false);
    } else {
      speechRecognition.current.start();
      setIsListening(true);
      toast.info('Listening... Speak now');
    }
  };

  const stopListening = () => {
    if (isListening && speechRecognition.current) {
      speechRecognition.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    isSpeechSupported,
    toggleListening,
    stopListening
  };
};
