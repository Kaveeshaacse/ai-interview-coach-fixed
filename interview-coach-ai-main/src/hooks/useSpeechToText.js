import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Reusable Web Speech API Custom Hook
 * Provides continuous speech-to-text recognition with support for appending to existing typed text.
 */
export function useSpeechToText({ onTranscriptChange } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = useCallback((currentText = '', onUpdateText) => {
    setError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Capture base text before speech begins
      let baseText = currentText ? currentText.trim() : '';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let transcriptSegment = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcriptSegment += event.results[i][0].transcript;
        }

        const fullText = baseText
          ? `${baseText} ${transcriptSegment.trim()}`
          : transcriptSegment.trim();

        if (onUpdateText) {
          onUpdateText(fullText);
        }
        if (onTranscriptChange) {
          onTranscriptChange(fullText);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setError('Microphone access was denied. Please allow microphone access in your browser settings and try again.');
        } else if (event.error === 'no-speech') {
          // Subtle no-speech, keep listener alive or reset silently
        } else if (event.error === 'network') {
          setError('Network error during voice recognition. Please check your internet connection.');
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Start listening error:', err);
      setError('Could not start microphone. Please check browser settings.');
      setIsListening(false);
    }
  }, [onTranscriptChange]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  }, []);

  const resetSpeech = useCallback(() => {
    stopListening();
    setError(null);
  }, [stopListening]);

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetSpeech,
  };
}

export default useSpeechToText;
