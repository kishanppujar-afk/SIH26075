import { useState, useEffect, useRef } from 'react';

/**
 * Animated counter hook using requestAnimationFrame and cubic ease-out.
 * Animates from previous value to target value without snapping.
 *
 * @param {number} targetValue Target number to count to.
 * @param {number} durationMs Animation duration in milliseconds (default: 800ms).
 * @param {number} decimals Number of decimal places to preserve (default: 0).
 * @returns {number|string} The smoothly interpolated current count value.
 */
export function useCountUp(targetValue, durationMs = 800, decimals = 0) {
  const [currentValue, setCurrentValue] = useState(0);
  const prevValueRef = useRef(0);
  const startTimeRef = useRef(null);
  const frameIdRef = useRef(null);

  useEffect(() => {
    const startVal = prevValueRef.current;
    const endVal = Number(targetValue) || 0;
    const change = endVal - startVal;

    // If no change or reduced motion is preferred, jump straight to target
    if (change === 0) {
      setCurrentValue(endVal);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setCurrentValue(endVal);
      prevValueRef.current = endVal;
      return;
    }

    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);

      // Cubic ease-out curve: 1 - (1 - t)^3
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const nextVal = startVal + change * easeOut;

      if (decimals > 0) {
        setCurrentValue(Number(nextVal.toFixed(decimals)));
      } else {
        setCurrentValue(Math.round(nextVal));
      }

      if (progress < 1) {
        frameIdRef.current = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = endVal;
        setCurrentValue(endVal);
      }
    };

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [targetValue, durationMs, decimals]);

  return currentValue;
}

export default useCountUp;
