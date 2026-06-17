'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Target,
  Briefcase,
  TrendingUp,
  ShieldAlert,
  Compass,
  RefreshCw,
  BadgeIndianRupee,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { ease, duration, stagger } from '@/lib/motion';
import type { AssessmentData } from '@/app/assessment/page';
import { generateCareerResultIntelligence, type CareerRecommendation } from './resultIntelligence';

interface ResultsDashboardProps {
  data: AssessmentData;
  onRestart: () => void;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '12px',
        fontWeight: 620,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'rgba(255, 255, 255, 0.46)',
        margin: '0 0 14px 0',
      }}
    >
      {children}
    </h3>
  );
}

function IntelligenceCard({
  title,
  children,
  accent = 'rgba(128, 82, 255, 0.16)',
}: {
  title: string;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <div
      style={{
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(20,20,25,0.92) 0%, rgba(10,10,15,0.86) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 2px 14px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          width: '30px',
          height: '3px',
          borderRadius: '999px',
          background: accent,
          marginBottom: '12px',
        }}
      />
      <h4
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: 650,
          color: '#ffffff',
          margin: '0 0 8px 0',
        }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}

function SmallText({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '13px',
        lineHeight: '1.55',
        color: 'rgba(255, 255, 255, 0.58)',
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

function PathMiniCard({
  label,
  path,
  icon,
}: {
  label: string;
  path: CareerRecommendation;
  icon: ReactNode;
}) {
  return (
    <div
      style={{
        padding: '18px',
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'rgba(128,82,255,0.13)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(128,82,255,0.2)',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '11px',
            fontWeight: 650,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.44)',
            marginBottom: '4px',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '15px',
            fontWeight: 680,
            color: '#ffffff',
            marginBottom: '4px',
          }}
        >
          {path.title}
        </div>
        <SmallText>{path.salaryRange}</SmallText>
      </div>
    </div>
  );
}

function RecommendationCard({ career, index }: { career: CareerRecommendation; index: number }) {
  const accent =
    index === 0
      ? 'rgba(128, 82, 255, 0.9)'
      : index === 1
        ? 'rgba(87, 181, 255, 0.82)'
        : 'rgba(69, 214, 160, 0.78)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: duration.normal,
        delay: 0.55 + index * stagger.tight,
        ease: ease.luxury,
      }}
      style={{
        padding: '22px',
        background: 'linear-gradient(135deg, rgba(20,20,25,0.94) 0%, rgba(10,10,15,0.88) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.055)',
        boxShadow: '0 2px 14px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 9px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.045)',
              color: 'rgba(255,255,255,0.56)',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 650,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            Path {index + 1}
          </div>
          <h4
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '19px',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 8px 0',
            }}
          >
            {career.title}
          </h4>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.72)',
              }}
            >
              <BadgeIndianRupee size={15} strokeWidth={1.7} style={{ color: accent }} />
              {career.salaryRange}
            </span>
          </div>
        </div>

        <div
          style={{
            minWidth: '68px',
            height: '68px',
            borderRadius: '16px',
            background: 'rgba(128,82,255,0.1)',
            border: '1px solid rgba(128,82,255,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '20px',
              fontWeight: 760,
              color: accent,
              lineHeight: 1,
            }}
          >
            {career.fitScore}%
          </span>
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.42)',
              marginTop: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Fit
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        <IntelligenceCard title="Why-fit" accent={accent}>
          <SmallText>{career.whyFits}</SmallText>
        </IntelligenceCard>
        <IntelligenceCard title="Answer pattern" accent={accent}>
          <SmallText>{career.answerPattern}</SmallText>
        </IntelligenceCard>
        <IntelligenceCard title="Tradeoff" accent="rgba(255, 180, 90, 0.45)">
          <SmallText>{career.tradeoff}</SmallText>
        </IntelligenceCard>
        <IntelligenceCard title="Next-step" accent="rgba(69, 214, 160, 0.5)">
          <SmallText>{career.nextStep}</SmallText>
        </IntelligenceCard>
        <IntelligenceCard title="Avoid-if" accent="rgba(255, 100, 120, 0.45)">
          <SmallText>{career.avoidIf}</SmallText>
        </IntelligenceCard>
      </div>
    </motion.div>
  );
}

export function ResultsDashboard({ data, onRestart }: ResultsDashboardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const results = useMemo(() => generateCareerResultIntelligence(data), [data]);

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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: '#8052ff' }}>
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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          width: '100%',
          maxWidth: '820px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          paddingBottom: '32px',
        }}
      >
        <motion.div
          variants={itemVariants}
          style={{
            textAlign: 'center',
            padding: '30px 22px',
            background: 'linear-gradient(135deg, rgba(128, 82, 255, 0.1) 0%, rgba(30, 30, 45, 0.78) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(128, 82, 255, 0.18)',
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
              fontSize: 'clamp(24px, 4vw, 34px)',
              fontWeight: 720,
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
              lineHeight: 1.55,
              color: 'rgba(255, 255, 255, 0.62)',
              margin: 0,
            }}
          >
            India-aware recommendations based on your motivations, strengths, work style, lifestyle, and risk signals.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          style={{
            padding: '26px',
            background: 'linear-gradient(135deg, rgba(20,20,25,0.93) 0%, rgba(10,10,15,0.88) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(128, 82, 255, 0.16) 0%, rgba(108, 66, 219, 0.12) 100%)',
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
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '7px',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: 0,
                  }}
                >
                  {results.archetype.name}
                </h3>
                <span
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(128, 82, 255, 0.12)',
                    borderRadius: '6px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '12px',
                    fontWeight: 650,
                    color: 'rgba(128, 82, 255, 1)',
                  }}
                >
                  {results.archetype.match}% identity fit
                </span>
                <span
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(69, 214, 160, 0.1)',
                    borderRadius: '6px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '12px',
                    fontWeight: 650,
                    color: 'rgba(69, 214, 160, 0.95)',
                  }}
                >
                  {results.confidence.label}
                </span>
              </div>
              <SmallText>{results.archetype.description}</SmallText>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            <IntelligenceCard title="Your decision pattern">
              <SmallText>{results.summary.decisionPattern}</SmallText>
            </IntelligenceCard>
            <IntelligenceCard title="Your strongest signals" accent="rgba(87, 181, 255, 0.45)">
              <SmallText>{results.summary.strongestSignals}</SmallText>
            </IntelligenceCard>
            <IntelligenceCard title="Your hidden tension" accent="rgba(255, 180, 90, 0.45)">
              <SmallText>{results.summary.hiddenTension}</SmallText>
            </IntelligenceCard>
            <IntelligenceCard title="What you should not ignore" accent="rgba(69, 214, 160, 0.45)">
              <SmallText>{results.summary.whatNotIgnore}</SmallText>
            </IntelligenceCard>
            <IntelligenceCard title="Result confidence" accent="rgba(69, 214, 160, 0.52)">
              <SmallText>
                {results.confidence.label} ({results.confidence.score}/100). {results.confidence.rationale}
              </SmallText>
            </IntelligenceCard>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <SectionLabel>CareerOS recommendation frame</SectionLabel>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            <PathMiniCard
              label="Natural Fit Path"
              path={results.paths.naturalFit}
              icon={<Compass size={19} strokeWidth={1.6} style={{ color: 'rgba(128,82,255,0.9)' }} />}
            />
            <PathMiniCard
              label="Best Long-Term Outcome"
              path={results.paths.longTermOutcome}
              icon={<TrendingUp size={19} strokeWidth={1.6} style={{ color: 'rgba(128,82,255,0.9)' }} />}
            />
            <PathMiniCard
              label="Balanced Recommendation"
              path={results.paths.balanced}
              icon={<ShieldAlert size={19} strokeWidth={1.6} style={{ color: 'rgba(128,82,255,0.9)' }} />}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <SectionLabel>Top 3 recommended paths</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {results.recommendations.map((career, index) => (
              <RecommendationCard key={career.id} career={career} index={index} />
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          style={{
            padding: '26px',
            background: 'linear-gradient(135deg, rgba(128, 82, 255, 0.1) 0%, rgba(10,10,15,0.86) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(128, 82, 255, 0.14)',
          }}
        >
          <SectionLabel>Come back reason</SectionLabel>
          <div style={{ display: 'grid', gap: '14px' }}>
            <IntelligenceCard title="Your next 7-day clarity action" accent="rgba(69, 214, 160, 0.52)">
              <SmallText>{results.nextSevenDayAction}</SmallText>
            </IntelligenceCard>
            <IntelligenceCard title="What to test before choosing" accent="rgba(255, 180, 90, 0.48)">
              <SmallText>{results.testBeforeChoosing}</SmallText>
            </IntelligenceCard>
            <IntelligenceCard title="Update your model" accent="rgba(128, 82, 255, 0.5)">
              <SmallText>{results.comebackPrompt}</SmallText>
            </IntelligenceCard>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          style={{
            padding: '30px',
            background: 'linear-gradient(135deg, rgba(20,20,25,0.92) 0%, rgba(10,10,15,0.86) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center',
          }}
        >
          <Briefcase size={22} strokeWidth={1.5} style={{ color: 'rgba(128,82,255,0.8)', marginBottom: '12px' }} />
          <h3
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '18px',
              fontWeight: 680,
              color: '#ffffff',
              margin: '0 0 8px 0',
            }}
          >
            Keep refining your CareerOS model
          </h3>
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.58)',
              margin: '0 0 22px 0',
              lineHeight: 1.55,
            }}
          >
            This staging result uses logic-based intelligence only. The next useful input is what happens after you test the recommended path.
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
              minHeight: '52px',
              padding: '0 24px',
              borderRadius: '999px',
              fontSize: '15px',
              fontWeight: 650,
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
            <RefreshCw size={17} />
            <span>Retake After the 7-Day Test</span>
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>

        <motion.p
          variants={itemVariants}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.38)',
            textAlign: 'center',
            marginTop: '4px',
            lineHeight: 1.5,
          }}
        >
          Salary ranges are approximate India-context bands for staging review. They should be validated with market data before public launch.
        </motion.p>
      </motion.div>
    </div>
  );
}
