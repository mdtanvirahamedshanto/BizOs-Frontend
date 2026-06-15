import { useEffect, useRef } from 'react';

interface UseBarcodeOptions {
  onScan: (barcode: string) => void;
  enabled?: boolean;
  timeThreshold?: number; // max time between keystrokes in ms (default: 40ms)
  minCharacters?: number; // min barcode length (default: 4)
}

/**
 * Hook to capture inputs from USB barcode scanners functioning as "keyboard wedges".
 * Hardware scanners send character keys in extremely quick succession, terminated by an Enter key.
 */
export function useBarcode({
  onScan,
  enabled = true,
  timeThreshold = 40,
  minCharacters = 4,
}: UseBarcodeOptions) {
  const bufferRef = useRef<string[]>([]);
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events on text areas or input elements if they are focused
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' && 
        (target as HTMLInputElement).type !== 'button' &&
        (target as HTMLInputElement).type !== 'submit' &&
        !(target as HTMLInputElement).classList.contains('barcode-capture') // explicit class override
      ) {
        return; // Allow standard input typing to function normally
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // Handle termination character (normally Enter)
      if (e.key === 'Enter') {
        const barcodeString = bufferRef.current.join('').trim();
        bufferRef.current = []; // Clear buffer immediately

        if (barcodeString.length >= minCharacters) {
          e.preventDefault();
          e.stopPropagation();
          onScan(barcodeString);
        }
        return;
      }

      // Filter out non-character inputs (like Shift, Control, etc.)
      if (e.key.length !== 1) {
        return;
      }

      // If typing speed is too slow, reset buffer because it is likely regular human typing
      if (bufferRef.current.length > 0 && timeDiff > timeThreshold) {
        bufferRef.current = [];
      }

      bufferRef.current.push(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan, enabled, timeThreshold, minCharacters]);
}
