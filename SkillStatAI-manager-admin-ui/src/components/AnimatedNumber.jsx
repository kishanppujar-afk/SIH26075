import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

function AnimatedNumber({ value }) {
  const spring = useSpring(0, { stiffness: 90, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [text, setText] = useState(0);

  useEffect(() => {
    spring.set(value);
    const unsub = display.on('change', (v) => setText(v));
    return unsub;
  }, [value]);

  return <motion.span>{text}</motion.span>;
}

export default AnimatedNumber;