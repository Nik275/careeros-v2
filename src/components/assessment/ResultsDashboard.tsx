'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Target, Heart, Briefcase, TrendingUp, Users, Clock, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { ease, duration, stagger } from '@/lib/motion';
import { AssessmentData } from '@/app/assessment/page';

interface ResultsDashboardProps {
  data: AssessmentData;
  onRestart: () => void;
}

// Mock results based on assessment data
const mockResults = {
  archetype: {
    name: 'The Strategic Creator',
    description: 'You thrive when combining analytical thinking with creative problem-solving. You value autonomy and meaningful impact.',
    match: 94,
  },
  topCareers: [
    { name: 'Product Manager', match: 96, growth: 'High', salary: '$95K-$180K' },
    { name: 'UX Researcher', match: 91, growth: 'Very High', salary: '$75K-$145K' },
    { name: 'Strategy Consultant', match: 88, growth: 'High', salary: '$85K-$200K' },
  ],
  insights: [
    { title: 'Your Strength', description: 'You excel at connecting ideas and seeing patterns others miss.', icon: Sparkles },
    { title: 'Ideal Environment', description: 'You need autonomy with collaborative touchpoints.', icon: Users },
    { title: 'Growth Path', description: 'Leadership roles that leverage your strategic thinking.', icon: TrendingUp },
  ],
};

export function ResultsDashboard({ data, onRestart }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'careers' | 'path'>('overview');
  const [isHovered, setIsHovered] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger.relaxed,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.slow, ease: ease.luxury },
    },
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.normal, ease: ease.luxury }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          paddingTop: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: '#8052ff' }}
          >
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="currentColor"
            />
          </svg>
          <span
            style={{
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '14px',
              letterSpacing: '-0.02em',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            CareerOS
          </span>
        </div>

        <motion.button
          onClick={onRestart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: 450,
            color: 'rgba(255, 255, 255, 0.8)',
            transition: 'all 0.2s ease',
          }}
        >
          Start Over
        </motion.button>
      </motion.div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Success Message */}
        <motion.div
          variants={itemVariants}
          style={{
            textAlign: 'center',
            padding: '32px 24px',
            background: 'linear-gradient(135deg, rgba(128, 82, 255, 0.08) 0%, rgba(108, 66, 219, 0.06) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(128, 82, 255, 0.15)',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: duration.normal, delay: 0.3, ease: ease.luxury }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(128, 82, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '1px solid rgba(128, 82, 255, 0.25)',
            }}
          >
            <Target size={28} strokeWidth={1.5} style={{ color: 'rgba(128, 82, 255, 0.9)' }} />
          </motion.div>
          <h2
            style={{
              fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
              fontSize: '24px',
              fontWeight: 640,
              color: '#ffffff',
              margin: '0 0 8px 0',
            }}
          >
            Your Career Clarity Report
          </h2>
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.55)',
              margin: 0,
            }}
          >
            Based on your psychology and preferences
          </p>
        </motion.div>

        {/* Archetype Card */}
        <motion.div
          variants={itemVariants}
          style={{
            padding: '28px',
            background: 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(10,10,15,0.85) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(128, 82, 255, 0.15) 0%, rgba(108, 66, 219, 0.12) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(128, 82, 255, 0.2)',
                flexShrink: 0,
              }}
            >
              <Sparkles size={22} strokeWidth={1.5} style={{ color: 'rgba(128, 82, 255, 0.85)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '4px',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '20px',
                    fontWeight: 640,
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  {mockResults.archetype.name}
                </h3>
                <span
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(128, 82, 255, 0.12)',
                    borderRadius: '6px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'rgba(128, 82, 255, 1)',
                  }}
                >
                  {mockResults.archetype.match}% match
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.6)',
                  margin: 0,
                }}
              >
                {mockResults.archetype.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Top Career Matches */}
        <motion.div variants={itemVariants}>
          <h3
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 580,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.45)',
              margin: '0 0 16px 0',
            }}
          >
            Top Career Matches
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mockResults.topCareers.map((career, index) => (
              <motion.div
                key={career.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: duration.normal,
                  delay: 0.5 + index * stagger.tight,
                  ease: ease.luxury,
                }}
                whileHover={{
                  scale: 1.01,
                  y: -2,
                  transition: { duration: duration.instant, ease: ease.snappy },
                }}
                style={{
                  padding: '20px 24px',
                  background: 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(10,10,15,0.85) 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.04)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: index === 0 
                        ? 'rgba(128, 82, 255, 0.12)' 
                        : index === 1 
                        ? 'rgba(108, 66, 219, 0.12)' 
                        : 'rgba(150, 100, 255, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: index === 0 
                        ? '1px solid rgba(128, 82, 255, 0.2)' 
                        : index === 1 
                        ? '1px solid rgba(108, 66, 219, 0.2)' 
                        : '1px solid rgba(150, 100, 255, 0.2)',
                    }}
                  >
                    <Briefcase
                      size={20}
                      strokeWidth={1.5}
                      style={{
                        color: index === 0 
                          ? 'rgba(128, 82, 255, 0.85)' 
                          : index === 1 
                          ? 'rgba(108, 66, 219, 0.85)' 
                          : 'rgba(150, 100, 255, 0.85)',
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#ffffff',
                        marginBottom: '2px',
                      }}
                    >
                      {career.name}
                    </div>
                    <div
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '13px',
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      {career.salary} • {career.growth} growth
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: index === 0 
                        ? 'rgba(128, 82, 255, 1)' 
                        : index === 1 
                        ? 'rgba(108, 66, 219, 1)' 
                        : 'rgba(150, 100, 255, 1)',
                    }}
                  >
                    {career.match}%
                  </span>
                  <ChevronRight size={18} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Insights */}
        <motion.div variants={itemVariants}>
          <h3
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 580,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.45)',
              margin: '0 0 16px 0',
            }}
          >
            Key Insights
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}
          >
            {mockResults.insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: duration.normal,
                    delay: 0.7 + index * stagger.tight,
                    ease: ease.luxury,
                  }}
                  style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(10,10,15,0.85) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    style={{
                      color: 'rgba(128, 82, 255, 0.7)',
                      marginBottom: '12px',
                    }}
                  />
                  <h4
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#ffffff',
                      margin: '0 0 6px 0',
                    }}
                  >
                    {insight.title}
                  </h4>
                  <p
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      color: 'rgba(255, 255, 255, 0.55)',
                      margin: 0,
                    }}
                  >
                    {insight.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={itemVariants}
          style={{
            padding: '32px',
            background: 'linear-gradient(135deg, rgba(128, 82, 255, 0.08) 0%, rgba(108, 66, 219, 0.06) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(128, 82, 255, 0.12)',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '18px',
              fontWeight: 640,
              color: '#ffffff',
              margin: '0 0 8px 0',
            }}
          >
            Want the full report?
          </h3>
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.55)',
              margin: '0 0 24px 0',
            }}
          >
            Get detailed career paths, skill recommendations, and next steps.
          </p>
          <motion.button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{
              scale: 1.02,
              y: -2,
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              height: '52px',
              padding: '0 28px',
              borderRadius: '999px',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'Inter, system-ui, sans-serif',
              color: 'white',
              background: isHovered
                ? 'linear-gradient(180deg, #9065ff 0%, #7c52eb 100%)'
                : 'linear-gradient(180deg, #8052ff 0%, #6c42db 100%)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isHovered
                ? '0 16px 40px rgba(128,82,255,0.35), 0 6px 16px rgba(0,0,0,0.1)'
                : '0 12px 32px rgba(128,82,255,0.25), 0 4px 12px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
            }}
          >
            <span>Unlock Full Report</span>
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={itemVariants}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.35)',
            textAlign: 'center',
            marginTop: '16px',
          }}
        >
          This is a preview based on your assessment. Full reports include detailed action plans.
        </motion.p>
      </motion.div>
    </div>
  );
}
