import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ number, label, icon: Icon, isLive = false }) {
  return (
    <motion.div 
      className="stat-card"
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
    >
      <div className="stat-num">
        {isLive && <span className="pulse-dot" title="Real-time live" />}
        {Icon && <Icon size={20} className="muted" />}
        <span>{number}</span>
      </div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
}
