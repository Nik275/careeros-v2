/**
 * CareerOS Market Intelligence - Data Source Layer
 *
 * Single ingestion point for all external market intelligence.
 *
 * RULE: No other module should directly consume external market data.
 * Everything must become MarketSignal before entering the intelligence system.
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type {
  DataSourceMetadata,
  DataSourceCategory,
  DataSourceStatus,
  UpdateFrequency,
  GeographicCoverage,
  RawMarketData,
  ExtractedSignal,
  DataProviderConfig,
  DataFetchResult,
  ProviderHealth,
  DataProvider,
  SignalAdapterConfig,
  SignalAdaptationResult,
  ProviderRegistration,
  ProviderQuery,
  RegistryStatistics,
} from './types';

// ============================================================================
// ADAPTERS
// ============================================================================

export {
  SignalAdapter,
  DEFAULT_ADAPTER_CONFIG,
  createSignalAdapter,
} from './adapters/SignalAdapter';

// ============================================================================
// RELIABILITY
// ============================================================================

export {
  SourceReliabilityEngine,
  CATEGORY_BASE_RELIABILITY,
  SOURCE_RELIABILITY_MAP,
  SIGNAL_TYPE_RELIABILITY,
  createSourceReliabilityEngine,
} from './reliability/SourceReliabilityEngine';

export type {
  ReliabilityMetrics,
  ReliabilityHistory,
} from './reliability/SourceReliabilityEngine';

// ============================================================================
// REGISTRY
// ============================================================================

export {
  ProviderRegistry,
  createProviderRegistry,
} from './registry/ProviderRegistry';

export type {
  ProviderRegistrationOptions,
  HealthCheckResult,
  RegistryFetchResult,
} from './registry/ProviderRegistry';

// ============================================================================
// GOVERNMENT PROVIDERS
// ============================================================================

export {
  NCSProvider,
  NCS_METADATA,
  DEFAULT_NCS_CONFIG,
  createNCSProvider,
} from './Government/NCSProvider';

export {
  NSDCProvider,
  NSDC_METADATA,
  DEFAULT_NSDC_CONFIG,
  createNSDCProvider,
} from './Government/NSDCProvider';

export {
  AICTEProvider,
  AICTE_METADATA,
  DEFAULT_AICTE_CONFIG,
  createAICTEProvider,
} from './Government/AICTEProvider';

export {
  UGCProvider,
  UGC_METADATA,
  DEFAULT_UGC_CONFIG,
  createUGCProvider,
} from './Government/UGCProvider';

export {
  MinistryLaborProvider,
  MINISTRY_LABOR_METADATA,
  DEFAULT_MINISTRY_LABOR_CONFIG,
  createMinistryLaborProvider,
} from './Government/MinistryLaborProvider';

// ============================================================================
// JOB MARKET PROVIDERS
// ============================================================================

export {
  NaukriProvider,
  NAUKRI_METADATA,
  DEFAULT_NAUKRI_CONFIG,
  createNaukriProvider,
} from './JobMarket/NaukriProvider';

export {
  FounditProvider,
  FOUNDIT_METADATA,
  DEFAULT_FOUNDIT_CONFIG,
  createFounditProvider,
} from './JobMarket/FounditProvider';

export {
  IndeedProvider,
  INDEED_METADATA,
  DEFAULT_INDEED_CONFIG,
  createIndeedProvider,
} from './JobMarket/IndeedProvider';

export {
  LinkedInProvider,
  LINKEDIN_METADATA,
  DEFAULT_LINKEDIN_CONFIG,
  createLinkedInProvider,
} from './JobMarket/LinkedInProvider';

// ============================================================================
// INDUSTRY PROVIDERS
// ============================================================================

export {
  NasscomProvider,
  NASSCOM_METADATA,
  DEFAULT_NASSCOM_CONFIG,
  createNasscomProvider,
} from './Industry/NasscomProvider';

export {
  StartupIndiaProvider,
  STARTUP_INDIA_METADATA,
  DEFAULT_STARTUP_INDIA_CONFIG,
  createStartupIndiaProvider,
} from './Industry/StartupIndiaProvider';

// ============================================================================
// GLOBAL PROVIDERS
// ============================================================================

export {
  WEFProvider,
  WEF_METADATA,
  DEFAULT_WEF_CONFIG,
  createWEFProvider,
} from './Global/WEFProvider';

export {
  ILOProvider,
  ILO_METADATA,
  DEFAULT_ILO_CONFIG,
  createILOProvider,
} from './Global/ILOProvider';

// ============================================================================
// PROVIDER CATALOG
// ============================================================================

/**
 * All available data source metadata.
 * Use this for provider discovery and documentation.
 */
export const DATA_SOURCE_CATALOG: Record<string, DataSourceMetadata> = {
  // Government
  'ncs-india': require('./Government/NCSProvider').NCS_METADATA,
  'nsdc': require('./Government/NSDCProvider').NSDC_METADATA,
  'aicte': require('./Government/AICTEProvider').AICTE_METADATA,
  'ugc': require('./Government/UGCProvider').UGC_METADATA,
  'ministry-labor': require('./Government/MinistryLaborProvider').MINISTRY_LABOR_METADATA,

  // Job Market
  'naukri': require('./JobMarket/NaukriProvider').NAUKRI_METADATA,
  'foundit': require('./JobMarket/FounditProvider').FOUNDIT_METADATA,
  'indeed': require('./JobMarket/IndeedProvider').INDEED_METADATA,
  'linkedin': require('./JobMarket/LinkedInProvider').LINKEDIN_METADATA,

  // Industry
  'nasscom': require('./Industry/NasscomProvider').NASSCOM_METADATA,
  'startup-india': require('./Industry/StartupIndiaProvider').STARTUP_INDIA_METADATA,

  // Global
  'wef': require('./Global/WEFProvider').WEF_METADATA,
  'ilo': require('./Global/ILOProvider').ILO_METADATA,
};

/**
 * Get all government providers metadata.
 */
export function getGovernmentProviders(): DataSourceMetadata[] {
  return [
    require('./Government/NCSProvider').NCS_METADATA,
    require('./Government/NSDCProvider').NSDC_METADATA,
    require('./Government/AICTEProvider').AICTE_METADATA,
    require('./Government/UGCProvider').UGC_METADATA,
    require('./Government/MinistryLaborProvider').MINISTRY_LABOR_METADATA,
  ];
}

/**
 * Get all job market providers metadata.
 */
export function getJobMarketProviders(): DataSourceMetadata[] {
  return [
    require('./JobMarket/NaukriProvider').NAUKRI_METADATA,
    require('./JobMarket/FounditProvider').FOUNDIT_METADATA,
    require('./JobMarket/IndeedProvider').INDEED_METADATA,
    require('./JobMarket/LinkedInProvider').LINKEDIN_METADATA,
  ];
}

/**
 * Get all industry providers metadata.
 */
export function getIndustryProviders(): DataSourceMetadata[] {
  return [
    require('./Industry/NasscomProvider').NASSCOM_METADATA,
    require('./Industry/StartupIndiaProvider').STARTUP_INDIA_METADATA,
  ];
}

/**
 * Get all global providers metadata.
 */
export function getGlobalProviders(): DataSourceMetadata[] {
  return [
    require('./Global/WEFProvider').WEF_METADATA,
    require('./Global/ILOProvider').ILO_METADATA,
  ];
}

/**
 * Get all providers metadata.
 */
export function getAllProviders(): DataSourceMetadata[] {
  return [
    ...getGovernmentProviders(),
    ...getJobMarketProviders(),
    ...getIndustryProviders(),
    ...getGlobalProviders(),
  ];
}

/**
 * Get provider metadata by source ID.
 */
export function getProviderMetadata(sourceId: string): DataSourceMetadata | undefined {
  return DATA_SOURCE_CATALOG[sourceId];
}

/**
 * Get providers by signal type.
 */
export function getProvidersBySignalType(signalType: string): DataSourceMetadata[] {
  return getAllProviders().filter((p) => p.signalTypes.includes(signalType as import('../models/MarketSignal').MarketSignalType));
}

/**
 * Get providers by minimum reliability.
 */
export function getProvidersByMinReliability(minScore: number): DataSourceMetadata[] {
  return getAllProviders().filter((p) => p.reliabilityScore >= minScore);
}

/**
 * Get reliability score for a source.
 */
export function getSourceReliability(sourceId: string): number {
  const metadata = getProviderMetadata(sourceId);
  return metadata?.reliabilityScore ?? 30; // Default to 30 for unknown
}
