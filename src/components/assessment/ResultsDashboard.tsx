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
import {
  generateCareerResultIntelligence,
  type CareerRecommendation,
  type CareerResultIntelligence,
} from './resultIntelligence';

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
        padding: '18px',
        background: 'linear-gradient(135deg, rgba(18,18,24,0.97) 0%, rgba(8,8,13,0.93) 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.075)',
        boxShadow: '0 12px 30px rgba(0,0,0,0.16)',
        backdropFilter: 'blur(18px)',
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
        lineHeight: '1.5',
        color: 'rgba(255, 255, 255, 0.66)',
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

function buildTopVerdict(results: CareerResultIntelligence): string {
  const pathTitle = results.paths.balanced.title;
  const archetype = results.archetype.name.toLowerCase();

  if (archetype.includes('builder')) {
    return `Your strongest direction is practical tech-building, with paid proof-building before a big commitment.`;
  }

  if (archetype.includes('stabilizer')) {
    return `Your profile points toward stability-first paths, with careful upside and a clear earning route.`;
  }

  if (archetype.includes('people-impact')) {
    return `Your best fit is people-facing problem solving, but you need proof before committing to ${pathTitle}.`;
  }

  return `Your best next move is to test ${pathTitle} with visible proof before locking in a career label.`;
}

function buildConfidenceExplanation(results: CareerResultIntelligence): string {
  const fitLevel = results.archetype.match >= 90 ? 'High' : results.archetype.match >= 82 ? 'Good' : 'Moderate';

  return `${fitLevel} identity fit means your personality and signals match this direction. ${results.confidence.label} means CareerOS still wants the recommendation tested because confidence is based on signal consistency, not just fit percentage.`;
}

function buildConsensusInsight(results: CareerResultIntelligence): string {
  const titles = [
    results.paths.naturalFit.title,
    results.paths.longTermOutcome.title,
    results.paths.balanced.title,
  ];
  const repeatedTitle = titles.find((title, index) => titles.indexOf(title) !== index);

  if (repeatedTitle) {
    const count = titles.filter((title) => title === repeatedTitle).length;
    return `${repeatedTitle} appears in ${count} recommendation roles because it wins across more than one lens: fit, long-term outcome, and risk-adjusted balance.`;
  }

  return 'These three paths separate day-to-day fit, long-term upside, and the balanced choice so the recommendation is easier to compare.';
}

function buildPathRoleCopy(label: string, path: CareerRecommendation, results: CareerResultIntelligence): string {
  const isRepeated = [
    results.paths.naturalFit.title,
    results.paths.longTermOutcome.title,
    results.paths.balanced.title,
  ].filter((title) => title === path.title).length > 1;

  if (isRepeated) {
    return 'Consensus signal: this path wins in more than one recommendation lens.';
  }

  if (label === 'Natural Fit Path') return 'Best day-to-day match for your current psychology and work style.';
  if (label === 'Best Long-Term Outcome') return 'Highest upside after adjusting for your current fit signals.';
  return 'Most practical first bet after balancing fit, risk, income, and constraints.';
}

function PathMiniCard({
  label,
  path,
  icon,
  reason,
}: {
  label: string;
  path: CareerRecommendation;
  icon: ReactNode;
  reason: string;
}) {
  return (
    <div
      style={{
        padding: '18px',
        background: 'rgba(8,8,13,0.86)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
        boxShadow: '0 12px 28px rgba(0,0,0,0.14)',
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
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '12px',
            lineHeight: 1.45,
            color: 'rgba(255,255,255,0.58)',
            margin: '8px 0 0 0',
          }}
        >
          {reason}
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  title,
  children,
  accent,
}: {
  title: string;
  children: ReactNode;
  accent: string;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(92px, 0.32fr) minmax(0, 1fr)',
        gap: '14px',
        padding: '14px 0',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '12px',
          fontWeight: 680,
          color: accent,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>
      <SmallText>{children}</SmallText>
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
        background: 'linear-gradient(135deg, rgba(18,18,24,0.97) 0%, rgba(7,7,12,0.94) 100%)',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 18px 42px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(18px)',
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}
        >
          <IntelligenceCard title="Why-fit" accent={accent}>
            <SmallText>{career.whyFits}</SmallText>
          </IntelligenceCard>
          <IntelligenceCard title="What your answers showed" accent={accent}>
            <SmallText>{career.answerPattern}</SmallText>
          </IntelligenceCard>
        </div>

        <div>
          <DetailRow title="Tradeoff" accent="rgba(255, 190, 110, 0.86)">
            {career.tradeoff}
          </DetailRow>
          <DetailRow title="Next-step" accent="rgba(88, 222, 170, 0.86)">
            {career.nextStep}
          </DetailRow>
          <DetailRow title="Avoid-if" accent="rgba(255, 120, 140, 0.86)">
            {career.avoidIf}
          </DetailRow>
        </div>
      </div>
    </motion.div>
  );
}

export function ResultsDashboard({ data, onRestart }: ResultsDashboardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const results = useMemo(() => generateCareerResultIntelligence(data), [data]);
  const topVerdict = useMemo(() => buildTopVerdict(results), [results]);
  const confidenceExplanation = useMemo(() => buildConfidenceExplanation(results), [results]);
  const consensusInsight = useMemo(() => buildConsensusInsight(results), [results]);

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
        background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.64) 46%, rgba(0,0,0,0.82) 100%)',
        backdropFilter: 'blur(2px)',
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
            padding: '26px 22px',
            background: 'linear-gradient(135deg, rgba(15, 15, 22, 0.96) 0%, rgba(8, 8, 14, 0.92) 100%)',
            borderRadius: '18px',
            border: '1px solid rgba(128, 82, 255, 0.18)',
            boxShadow: '0 22px 55px rgba(0,0,0,0.24)',
            backdropFilter: 'blur(20px)',
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
              color: 'rgba(255, 255, 255, 0.68)',
              margin: 0,
            }}
          >
            India-aware recommendations based on your motivations, strengths, work style, lifestyle, and risk signals.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(128, 82, 255, 0.18) 0%, rgba(9, 9, 16, 0.96) 64%)',
            borderRadius: '18px',
            border: '1px solid rgba(128,82,255,0.22)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
            backdropFilter: 'blur(22px)',
          }}
        >
          <SectionLabel>30-second read</SectionLabel>
          <h3
            style={{
              fontFamily: 'Inter, "SF Pro Display", system-ui, sans-serif',
              fontSize: 'clamp(22px, 4.6vw, 32px)',
              lineHeight: 1.14,
              fontWeight: 740,
              color: '#ffffff',
              margin: '0 0 12px 0',
            }}
          >
            {topVerdict}
          </h3>
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '15px',
              lineHeight: 1.58,
              color: 'rgba(255,255,255,0.74)',
              margin: '0 0 18px 0',
            }}
          >
            {confidenceExplanation}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '12px',
            }}
          >
            <IntelligenceCard title="Best first bet" accent="rgba(128, 82, 255, 0.72)">
              <SmallText>{results.paths.balanced.title}</SmallText>
            </IntelligenceCard>
            <IntelligenceCard title="Proof to collect" accent="rgba(69, 214, 160, 0.62)">
              <SmallText>{results.nextSevenDayAction}</SmallText>
            </IntelligenceCard>
            <IntelligenceCard title="Watch-out" accent="rgba(255, 180, 90, 0.62)">
              <SmallText>{results.testBeforeChoosing}</SmallText>
            </IntelligenceCard>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(18,18,24,0.97) 0%, rgba(8,8,13,0.94) 100%)',
            borderRadius: '18px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 48px rgba(0,0,0,0.22)',
            backdropFilter: 'blur(20px)',
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
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <SectionLabel>CareerOS recommendation frame</SectionLabel>
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '14px',
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.64)',
              margin: '-6px 0 14px 0',
            }}
          >
            {consensusInsight}
          </p>
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
              reason={buildPathRoleCopy('Natural Fit Path', results.paths.naturalFit, results)}
            />
            <PathMiniCard
              label="Best Long-Term Outcome"
              path={results.paths.longTermOutcome}
              icon={<TrendingUp size={19} strokeWidth={1.6} style={{ color: 'rgba(128,82,255,0.9)' }} />}
              reason={buildPathRoleCopy('Best Long-Term Outcome', results.paths.longTermOutcome, results)}
            />
            <PathMiniCard
              label="Balanced Recommendation"
              path={results.paths.balanced}
              icon={<ShieldAlert size={19} strokeWidth={1.6} style={{ color: 'rgba(128,82,255,0.9)' }} />}
              reason={buildPathRoleCopy('Balanced Recommendation', results.paths.balanced, results)}
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
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(128, 82, 255, 0.12) 0%, rgba(8,8,13,0.94) 100%)',
            borderRadius: '18px',
            border: '1px solid rgba(128, 82, 255, 0.16)',
            boxShadow: '0 18px 42px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <SectionLabel>7-day action plan</SectionLabel>
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
            background: 'linear-gradient(135deg, rgba(18,18,24,0.97) 0%, rgba(8,8,13,0.94) 100%)',
            borderRadius: '18px',
            border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
            boxShadow: '0 18px 42px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(20px)',
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
            Your CareerOS model gets sharper when you test a path and come back with what felt energizing, boring, stressful, or natural.
          </p>
          <motion.button
            type="button"
            onClick={onRestart}
            aria-label="Retake assessment"
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
            <span>Retake Assessment</span>
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
          Salary ranges are approximate India-market ranges and may vary by city, company, skill proof, and experience.
        </motion.p>
      </motion.div>
    </div>
  );
}
