"use client";
import { motion } from 'framer-motion';

export default function SpinWheel({ onSpin }: { onSpin: () => void }) {
  return (
    <motion.button whileHover={{ scale: 1.05 }} onClick={onSpin} className="px-4 py-2 bg-brand text-white rounded">
      Spin the Wheel 🎯
    </motion.button>
  );
}
