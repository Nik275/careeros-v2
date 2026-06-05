/**
 * CareerOS Outcome Tracking System - Store
 *
 * Phase 8.9: Outcome Tracking System
 *
 * Data persistence and retrieval layer for outcome records.
 * Supports in-memory, localStorage, and extensible for database backends.
 *
 * @module intelligence/outcome-tracking
 * @version 1.0.0
 */

import {
  type StudentOutcomeRecord,
  type OutcomeRecordId,
  type StudentId,
  type OutcomeAggregationQuery,
  type IOutcomeStore,
  type OutcomeTimepoint,
} from './outcome-types.js';

// ============================================================================
// IN-MEMORY STORE IMPLEMENTATION
// ============================================================================

/**
 * In-memory outcome store
 *
 * Primary storage for development and testing.
 * Suitable for single-instance deployments.
 */
export class InMemoryOutcomeStore implements IOutcomeStore {
  private records: Map<OutcomeRecordId, StudentOutcomeRecord> = new Map();
  private studentIndex: Map<StudentId, OutcomeRecordId> = new Map();

  /**
   * Save record to store
   */
  async save(record: StudentOutcomeRecord): Promise<void> {
    this.records.set(record.id, { ...record });
    this.studentIndex.set(record.studentId, record.id);
  }

  /**
   * Load record by ID
   */
  async load(recordId: OutcomeRecordId): Promise<StudentOutcomeRecord | null> {
    const record = this.records.get(recordId);
    return record ? { ...record } : null;
  }

  /**
   * Load record by student ID
   */
  async loadByStudent(studentId: StudentId): Promise<StudentOutcomeRecord | null> {
    const recordId = this.studentIndex.get(studentId);
    if (!recordId) return null;
    return this.load(recordId);
  }

  /**
   * Query records with filters
   */
  async query(query: OutcomeAggregationQuery): Promise<StudentOutcomeRecord[]> {
    let results = Array.from(this.records.values());

    // Apply time range filter
    if (query.timeRange) {
      results = results.filter(r =>
        r.createdAt >= query.timeRange!.start &&
        r.createdAt <= query.timeRange!.end
      );
    }

    // Apply path filter
    if (query.pathIds && query.pathIds.length > 0) {
      results = results.filter(r =>
        query.pathIds!.some(pathId =>
          r.baseline.recommendations.some(rec => rec.careerId === pathId)
        )
      );
    }

    // Apply data quality filter
    if (query.minDataQuality !== undefined) {
      results = results.filter(r =>
        r.metadata.dataQuality >= query.minDataQuality!
      );
    }

    // Filter inactive if needed
    if (!query.includeInactive) {
      results = results.filter(r => r.status === 'ACTIVE');
    }

    return results.map(r => ({ ...r }));
  }

  /**
   * Delete record
   */
  async delete(recordId: OutcomeRecordId): Promise<void> {
    const record = this.records.get(recordId);
    if (record) {
      this.records.delete(recordId);
      this.studentIndex.delete(record.studentId);
    }
  }

  /**
   * Check if record exists
   */
  has(recordId: OutcomeRecordId): boolean {
    return this.records.has(recordId);
  }

  /**
   * Check if student has record
   */
  hasStudent(studentId: StudentId): boolean {
    return this.studentIndex.has(studentId);
  }

  /**
   * Get all record IDs
   */
  getAllRecordIds(): OutcomeRecordId[] {
    return Array.from(this.records.keys());
  }

  /**
   * Get all student IDs
   */
  getAllStudentIds(): StudentId[] {
    return Array.from(this.studentIndex.keys());
  }

  /**
   * Get record count
   */
  getCount(): number {
    return this.records.size;
  }

  /**
   * Clear all records
   */
  clear(): void {
    this.records.clear();
    this.studentIndex.clear();
  }

  /**
   * Export all records
   */
  export(): StudentOutcomeRecord[] {
    return Array.from(this.records.values()).map(r => ({ ...r }));
  }

  /**
   * Import records
   */
  import(records: StudentOutcomeRecord[]): void {
    for (const record of records) {
      this.save(record);
    }
  }
}

// ============================================================================
// LOCALSTORAGE STORE IMPLEMENTATION
// ============================================================================

/**
 * LocalStorage-based outcome store
 *
 * Persistent storage for browser environments.
 * Suitable for client-side applications.
 */
export class LocalStorageOutcomeStore implements IOutcomeStore {
  private readonly prefix: string;
  private readonly indexKey: string;

  constructor(prefix = 'careeros:outcome:') {
    this.prefix = prefix;
    this.indexKey = `${prefix}index`;
  }

  /**
   * Get storage key for record
   */
  private getKey(recordId: OutcomeRecordId): string {
    return `${this.prefix}record:${recordId}`;
  }

  /**
   * Get storage key for student mapping
   */
  private getStudentKey(studentId: StudentId): string {
    return `${this.prefix}student:${studentId}`;
  }

  /**
   * Get index of all records
   */
  private getIndex(): OutcomeRecordId[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.indexKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Update index
   */
  private setIndex(index: OutcomeRecordId[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.indexKey, JSON.stringify(index));
  }

  /**
   * Save record
   */
  async save(record: StudentOutcomeRecord): Promise<void> {
    if (typeof window === 'undefined') return;

    const key = this.getKey(record.id);
    localStorage.setItem(key, JSON.stringify(record));

    // Update student mapping
    const studentKey = this.getStudentKey(record.studentId);
    localStorage.setItem(studentKey, record.id);

    // Update index
    const index = this.getIndex();
    if (!index.includes(record.id)) {
      index.push(record.id);
      this.setIndex(index);
    }
  }

  /**
   * Load record by ID
   */
  async load(recordId: OutcomeRecordId): Promise<StudentOutcomeRecord | null> {
    if (typeof window === 'undefined') return null;

    const key = this.getKey(recordId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Load record by student ID
   */
  async loadByStudent(studentId: StudentId): Promise<StudentOutcomeRecord | null> {
    if (typeof window === 'undefined') return null;

    const studentKey = this.getStudentKey(studentId);
    const recordId = localStorage.getItem(studentKey);
    if (!recordId) return null;

    return this.load(recordId as OutcomeRecordId);
  }

  /**
   * Query records
   */
  async query(query: OutcomeAggregationQuery): Promise<StudentOutcomeRecord[]> {
    const index = this.getIndex();
    const records: StudentOutcomeRecord[] = [];

    for (const recordId of index) {
      const record = await this.load(recordId);
      if (record) {
        records.push(record);
      }
    }

    // Apply filters (same as in-memory)
    let results = records;

    if (query.timeRange) {
      results = results.filter(r =>
        r.createdAt >= query.timeRange!.start &&
        r.createdAt <= query.timeRange!.end
      );
    }

    if (query.pathIds && query.pathIds.length > 0) {
      results = results.filter(r =>
        query.pathIds!.some(pathId =>
          r.baseline.recommendations.some(rec => rec.careerId === pathId)
        )
      );
    }

    if (query.minDataQuality !== undefined) {
      results = results.filter(r =>
        r.metadata.dataQuality >= query.minDataQuality!
      );
    }

    if (!query.includeInactive) {
      results = results.filter(r => r.status === 'ACTIVE');
    }

    return results;
  }

  /**
   * Delete record
   */
  async delete(recordId: OutcomeRecordId): Promise<void> {
    if (typeof window === 'undefined') return;

    const record = await this.load(recordId);
    if (record) {
      localStorage.removeItem(this.getKey(recordId));
      localStorage.removeItem(this.getStudentKey(record.studentId));

      const index = this.getIndex();
      const newIndex = index.filter(id => id !== recordId);
      this.setIndex(newIndex);
    }
  }

  /**
   * Get storage size estimate
   */
  getStorageSize(): number {
    if (typeof window === 'undefined') return 0;

    let size = 0;
    const index = this.getIndex();

    for (const recordId of index) {
      const key = this.getKey(recordId);
      const data = localStorage.getItem(key);
      if (data) {
        size += data.length * 2; // UTF-16 encoding
      }
    }

    return size;
  }

  /**
   * Clear all records
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    const index = this.getIndex();
    for (const recordId of index) {
      localStorage.removeItem(this.getKey(recordId));
    }

    // Clear student mappings
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.prefix}student:`)) {
        localStorage.removeItem(key);
      }
    }

    localStorage.removeItem(this.indexKey);
  }
}

// ============================================================================
// CACHED STORE IMPLEMENTATION
// ============================================================================

/**
 * Cached store wrapper
 *
 * Adds LRU caching to any store implementation.
 */
export class CachedOutcomeStore implements IOutcomeStore {
  private store: IOutcomeStore;
  private cache: Map<OutcomeRecordId, StudentOutcomeRecord> = new Map();
  private studentCache: Map<StudentId, OutcomeRecordId> = new Map();
  private maxCacheSize: number;

  constructor(store: IOutcomeStore, maxCacheSize = 100) {
    this.store = store;
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Save record (updates cache)
   */
  async save(record: StudentOutcomeRecord): Promise<void> {
    await this.store.save(record);
    this.setCache(record.id, record);
    this.studentCache.set(record.studentId, record.id);
  }

  /**
   * Load record (uses cache)
   */
  async load(recordId: OutcomeRecordId): Promise<StudentOutcomeRecord | null> {
    const cached = this.cache.get(recordId);
    if (cached) return cached;

    const record = await this.store.load(recordId);
    if (record) {
      this.setCache(recordId, record);
    }
    return record;
  }

  /**
   * Load by student (uses cache)
   */
  async loadByStudent(studentId: StudentId): Promise<StudentOutcomeRecord | null> {
    const cachedId = this.studentCache.get(studentId);
    if (cachedId) {
      const cached = this.cache.get(cachedId);
      if (cached) return cached;
    }

    const record = await this.store.loadByStudent(studentId);
    if (record) {
      this.setCache(record.id, record);
      this.studentCache.set(studentId, record.id);
    }
    return record;
  }

  /**
   * Query (bypasses cache)
   */
  async query(query: OutcomeAggregationQuery): Promise<StudentOutcomeRecord[]> {
    return this.store.query(query);
  }

  /**
   * Delete (invalidates cache)
   */
  async delete(recordId: OutcomeRecordId): Promise<void> {
    const record = await this.load(recordId);
    if (record) {
      this.studentCache.delete(record.studentId);
    }
    this.cache.delete(recordId);
    await this.store.delete(recordId);
  }

  /**
   * Set cache entry with LRU eviction
   */
  private setCache(recordId: OutcomeRecordId, record: StudentOutcomeRecord): void {
    if (this.cache.size >= this.maxCacheSize && !this.cache.has(recordId)) {
      // Evict oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(recordId, record);
  }

  /**
   * Invalidate cache entry
   */
  invalidate(recordId: OutcomeRecordId): void {
    this.cache.delete(recordId);
  }

  /**
   * Invalidate all cache
   */
  invalidateAll(): void {
    this.cache.clear();
    this.studentCache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: 0, // Would need to track hits/misses
    };
  }
}

// ============================================================================
// VALIDATED STORE WRAPPER
// ============================================================================

/**
 * Validated store wrapper
 *
 * Adds schema validation to store operations.
 */
export class ValidatedOutcomeStore implements IOutcomeStore {
  private store: IOutcomeStore;

  constructor(store: IOutcomeStore) {
    this.store = store;
  }

  /**
   * Validate record before saving
   */
  async save(record: StudentOutcomeRecord): Promise<void> {
    this.validateRecord(record);
    await this.store.save(record);
  }

  /**
   * Load record
   */
  async load(recordId: OutcomeRecordId): Promise<StudentOutcomeRecord | null> {
    const record = await this.store.load(recordId);
    if (record) {
      this.validateRecord(record);
    }
    return record;
  }

  /**
   * Load by student
   */
  async loadByStudent(studentId: StudentId): Promise<StudentOutcomeRecord | null> {
    const record = await this.store.loadByStudent(studentId);
    if (record) {
      this.validateRecord(record);
    }
    return record;
  }

  /**
   * Query records
   */
  async query(query: OutcomeAggregationQuery): Promise<StudentOutcomeRecord[]> {
    const records = await this.store.query(query);
    for (const record of records) {
      this.validateRecord(record);
    }
    return records;
  }

  /**
   * Delete record
   */
  async delete(recordId: OutcomeRecordId): Promise<void> {
    await this.store.delete(recordId);
  }

  /**
   * Validate record structure
   */
  private validateRecord(record: StudentOutcomeRecord): void {
    if (!record.id) throw new Error('Record must have an ID');
    if (!record.studentId) throw new Error('Record must have a student ID');
    if (!record.createdAt) throw new Error('Record must have a createdAt timestamp');
    if (!record.baseline) throw new Error('Record must have baseline data');

    // Validate required fields
    if (typeof record.metadata?.dataQuality !== 'number') {
      throw new Error('Record must have dataQuality in metadata');
    }
  }
}

// ============================================================================
// ENCRYPTED STORE WRAPPER
// ============================================================================

/**
 * Encrypted store wrapper
 *
 * Adds encryption for sensitive data at rest.
 * Note: This is a simplified implementation. Production should use proper crypto.
 */
export class EncryptedOutcomeStore implements IOutcomeStore {
  private store: IOutcomeStore;
  private encryptionKey: string;

  constructor(store: IOutcomeStore, encryptionKey: string) {
    this.store = store;
    this.encryptionKey = encryptionKey;
  }

  /**
   * Simple XOR encryption (for demonstration - use proper encryption in production)
   */
  private encrypt(data: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
      );
    }
    return btoa(result);
  }

  /**
   * Decrypt data
   */
  private decrypt(data: string): string {
    const decoded = atob(data);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
      );
    }
    return result;
  }

  /**
   * Save encrypted record
   */
  async save(record: StudentOutcomeRecord): Promise<void> {
    const encrypted: StudentOutcomeRecord = {
      ...record,
      // Encrypt sensitive fields
      baseline: {
        ...record.baseline,
        belief: this.encryptObject(record.baseline.belief),
      } as unknown as typeof record.baseline,
    };

    await this.store.save(encrypted);
  }

  /**
   * Load and decrypt record
   */
  async load(recordId: OutcomeRecordId): Promise<StudentOutcomeRecord | null> {
    const record = await this.store.load(recordId);
    if (!record) return null;

    return {
      ...record,
      baseline: {
        ...record.baseline,
        belief: this.decryptObject(record.baseline.belief as unknown as string),
      } as unknown as typeof record.baseline,
    };
  }

  /**
   * Load by student
   */
  async loadByStudent(studentId: StudentId): Promise<StudentOutcomeRecord | null> {
    const record = await this.store.loadByStudent(studentId);
    if (!record) return null;
    return this.load(record.id);
  }

  /**
   * Query records
   */
  async query(query: OutcomeAggregationQuery): Promise<StudentOutcomeRecord[]> {
    const records = await this.store.query(query);
    return Promise.all(records.map(r => this.load(r.id)!));
  }

  /**
   * Delete record
   */
  async delete(recordId: OutcomeRecordId): Promise<void> {
    await this.store.delete(recordId);
  }

  private encryptObject(obj: unknown): unknown {
    return JSON.parse(this.encrypt(JSON.stringify(obj)));
  }

  private decryptObject(str: string): unknown {
    return JSON.parse(this.decrypt(str));
  }
}

// ============================================================================
// STORE FACTORIES
// ============================================================================

/**
 * Create in-memory store
 */
export function createInMemoryStore(): InMemoryOutcomeStore {
  return new InMemoryOutcomeStore();
}

/**
 * Create localStorage store
 */
export function createLocalStorageStore(prefix?: string): LocalStorageOutcomeStore {
  return new LocalStorageOutcomeStore(prefix);
}

/**
 * Create cached store wrapper
 */
export function createCachedStore(store: IOutcomeStore, maxCacheSize?: number): CachedOutcomeStore {
  return new CachedOutcomeStore(store, maxCacheSize);
}

/**
 * Create validated store wrapper
 */
export function createValidatedStore(store: IOutcomeStore): ValidatedOutcomeStore {
  return new ValidatedOutcomeStore(store);
}

/**
 * Create encrypted store wrapper
 */
export function createEncryptedStore(store: IOutcomeStore, encryptionKey: string): EncryptedOutcomeStore {
  return new EncryptedOutcomeStore(store, encryptionKey);
}

/**
 * Create default store (in-memory with caching and validation)
 */
export function createDefaultStore(): IOutcomeStore {
  const memory = createInMemoryStore();
  const cached = createCachedStore(memory);
  return createValidatedStore(cached);
}

// ============================================================================
// STORE MIGRATION
// ============================================================================

/**
 * Migrate records between stores
 */
export async function migrateStore(
  source: IOutcomeStore,
  target: IOutcomeStore,
  options: { overwrite?: boolean; validate?: boolean } = {}
): Promise<{ migrated: number; errors: number }> {
  const { overwrite = false, validate = true } = options;

  let migrated = 0;
  let errors = 0;

  // Query all records from source
  const records = await source.query({ includeInactive: true });

  for (const record of records) {
    try {
      // Check if exists in target
      const existing = await target.load(record.id);

      if (existing && !overwrite) {
        continue;
      }

      // Validate if requested
      if (validate) {
        if (!record.id || !record.studentId) {
          throw new Error('Invalid record structure');
        }
      }

      await target.save(record);
      migrated++;
    } catch (err) {
      errors++;
      console.error(`Failed to migrate record ${record.id}:`, err);
    }
  }

  return { migrated, errors };
}

// ============================================================================
// STORE BACKUP/RESTORE
// ============================================================================

/**
 * Export store to JSON
 */
export async function exportStore(store: IOutcomeStore): Promise<string> {
  const records = await store.query({ includeInactive: true });
  return JSON.stringify(records, null, 2);
}

/**
 * Import store from JSON
 */
export async function importStore(store: IOutcomeStore, json: string): Promise<number> {
  const records: StudentOutcomeRecord[] = JSON.parse(json);

  for (const record of records) {
    await store.save(record);
  }

  return records.length;
}
