import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, User, Users, ArrowRight } from 'lucide-react';
import { pageVariants, itemFadeUp, staggerContainer } from '../animations/variants';

export default function TravelerOnboarding() {
  const navigate = useNavigate();

  const [companion, setCompanion] = useState('Solo');
  const [interest, setInterest] = useState('Heritage');

  const handleFinishOnboarding = () => {
    // Initialise search parameters with default values
    const searchParams = {
      startingLocation: 'Hyderabad',
      destination: 'Hampi',
      daysCount: 3,
      travelersCount: companion === 'Solo' ? 1 : 2,
      budgetLimit: 15000
    };
    
    localStorage.setItem('travexa_search', JSON.stringify(searchParams));
    navigate('/plan');
  };

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-lg mx-auto py-10 space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3" 
          style={{ background: 'var(--brand-primary-soft)' }}>
          <Sparkles className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
          Tell Us About Yourself
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Help us personalize your budget journey.
        </p>
      </div>

      {/* Card */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="rounded-2xl p-8 space-y-8"
        style={{ 
          background: 'var(--bg-elevated)', 
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        
        {/* Companion Style Selection */}
        <motion.div variants={itemFadeUp} className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wide" 
            style={{ color: 'var(--text-tertiary)' }}>
            What type of traveler are you?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'Solo', label: 'Solo Traveler', icon: User },
              { id: 'Couple', label: 'Couple Trip', icon: Users },
              { id: 'Friends', label: 'Friends Group', icon: Users },
              { id: 'Family', label: 'Family Holiday', icon: Users }
            ].map(item => {
              const Icon = item.icon;
              const isActive = companion === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setCompanion(item.id)}
                  className="p-4 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-2.5"
                  style={{ 
                    background: isActive ? 'var(--brand-primary-soft)' : 'var(--bg-surface)',
                    border: isActive ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
                    color: isActive ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Interests */}
        <motion.div variants={itemFadeUp} className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wide" 
            style={{ color: 'var(--text-tertiary)' }}>
            What interests you?
          </label>
          <div className="flex flex-wrap gap-2">
            {['Heritage', 'Nature', 'Spiritual', 'Adventure', 'Leisure'].map(tag => {
              const active = interest === tag;
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setInterest(tag)}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: active ? 'var(--brand-primary)' : 'var(--bg-surface)',
                    color: active ? 'var(--text-on-brand)' : 'var(--text-tertiary)',
                    border: active ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemFadeUp}>
          <button
            type="button"
            onClick={handleFinishOnboarding}
            className="btn btn-primary btn-lg w-full"
          >
            Start Planning
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
