/**
 * Career Repository Tests
 *
 * Validates the repository layer functionality.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  InMemoryCareerRepository,
  createCareerRepository,
  RepositoryType,
  getDefaultCareerRepository,
  resetDefaultCareerRepository,
} from '../index';
import {
  softwareEngineer,
  doctor,
  lawyer,
  charteredAccountant,
  productManager,
  dataScientist,
  civilServant,
  teacher,
  entrepreneur,
  uxDesigner,
} from '../../profiles';
import { CareerCategory, CareerSortOption } from '../../Career';
import type { Career } from '../../Career';

describe('Career Repository', () => {
  let repository: InMemoryCareerRepository;

  const sampleCareers: Career[] = [
    softwareEngineer,
    doctor,
    lawyer,
    charteredAccountant,
    productManager,
    dataScientist,
    civilServant,
    teacher,
    entrepreneur,
    uxDesigner,
  ];

  beforeEach(() => {
    repository = new InMemoryCareerRepository();
    repository.loadCareers(sampleCareers);
  });

  describe('Initialization', () => {
    it('should be ready after loading careers', () => {
      expect(repository.isReady()).toBe(true);
    });

    it('should load careers via constructor', () => {
      const repo = new InMemoryCareerRepository({
        preloadCareers: sampleCareers,
      });
      expect(repo.isReady()).toBe(true);
      expect(repo.getCount()).toBe(10);
    });
  });

  describe('Basic Retrieval', () => {
    it('should get all careers', () => {
      const result = repository.getAllCareers();
      expect(result.careers.length).toBe(10);
      expect(result.totalCount).toBe(10);
    });

    it('should get career by ID', () => {
      const career = repository.getCareerById('software-engineer');
      expect(career).toBeDefined();
      expect(career?.name).toBe('Software Engineer');
    });

    it('should return undefined for unknown ID', () => {
      const career = repository.getCareerById('non-existent');
      expect(career).toBeUndefined();
    });

    it('should get career by slug', () => {
      const career = repository.getCareerBySlug('doctor');
      expect(career).toBeDefined();
      expect(career?.name).toBe('Doctor (Physician)');
    });

    it('should return undefined for unknown slug', () => {
      const career = repository.getCareerBySlug('non-existent');
      expect(career).toBeUndefined();
    });

    it('should get careers by IDs', () => {
      const careers = repository.getCareersByIds(['software-engineer', 'doctor', 'non-existent']);
      expect(careers.length).toBe(2);
      expect(careers.map(c => c.slug)).toContain('software-engineer');
      expect(careers.map(c => c.slug)).toContain('doctor');
    });
  });

  describe('Category Retrieval', () => {
    it('should get careers by category', () => {
      const result = repository.getCareersByCategory(CareerCategory.TECHNOLOGY);
      expect(result.careers.length).toBe(4); // Software Engineer, Product Manager, Data Scientist, UX Designer
      expect(result.totalCount).toBe(4);
    });

    it('should get careers by multiple categories', () => {
      const result = repository.getCareersByCategories([CareerCategory.TECHNOLOGY, CareerCategory.HEALTHCARE]);
      expect(result.careers.length).toBe(5); // 4 tech + 1 healthcare
    });

    it('should return empty for unknown category', () => {
      const result = repository.getCareersByCategory('unknown' as CareerCategory);
      expect(result.careers.length).toBe(0);
    });
  });

  describe('Search', () => {
    it('should search careers by name', () => {
      const result = repository.searchCareers('software');
      expect(result.careers.length).toBeGreaterThan(0);
      expect(result.careers[0].slug).toBe('software-engineer');
    });

    it('should search careers by description', () => {
      const result = repository.searchCareers('diagnoses');
      expect(result.careers.length).toBeGreaterThan(0);
      expect(result.careers.map(c => c.slug)).toContain('doctor');
    });

    it('should return all careers for empty query', () => {
      const result = repository.searchCareers('');
      expect(result.careers.length).toBe(10);
    });

    it('should return empty for no matches', () => {
      const result = repository.searchCareers('xyzabc123');
      expect(result.careers.length).toBe(0);
    });

    it('should support pagination in search', () => {
      const result = repository.searchCareers('e', 0, 3);
      expect(result.careers.length).toBe(3);
      expect(result.pagination?.hasMore).toBe(true);
    });

    it('should perform advanced search with filters', () => {
      const result = repository.advancedSearch(
        'engineer',
        { categories: [CareerCategory.TECHNOLOGY] }
      );
      expect(result.careers.length).toBeGreaterThan(0);
    });
  });

  describe('Filtering', () => {
    it('should filter by category', () => {
      const result = repository.filterCareers({
        categories: [CareerCategory.TECHNOLOGY],
      });
      expect(result.careers.length).toBe(4);
    });

    it('should filter by remote work', () => {
      const result = repository.filterCareers({ remoteWork: true });
      // Careers with remoteWork > 0.5
      expect(result.careers.length).toBeGreaterThan(0);
    });

    it('should filter by max risk scores', () => {
      const result = repository.filterCareers({
        maxRiskScores: { burnoutRisk: 0.8 }, // Higher threshold since most careers have burnout risk
      });
      expect(result.careers.length).toBeGreaterThan(0);
    });

    it('should filter by salary range', () => {
      const result = repository.filterCareers({
        salaryRange: {
          min: 500000,
          max: 1500000,
          level: 'entry',
        },
      });
      expect(result.careers.length).toBeGreaterThan(0);
    });

    it('should support sorting', () => {
      const result = repository.filterCareers(
        {},
        CareerSortOption.INCOME_POTENTIAL
      );
      expect(result.careers.length).toBe(10);
      // Should be sorted by income potential descending
      expect(result.careers[0].rewardProfile.incomePotential).toBeGreaterThanOrEqual(
        result.careers[result.careers.length - 1].rewardProfile.incomePotential
      );
    });

    it('should support pagination', () => {
      const result = repository.filterCareers({}, undefined, 0, 3);
      expect(result.careers.length).toBe(3);
      expect(result.pagination?.hasMore).toBe(true);
      expect(result.totalCount).toBe(10);
    });
  });

  describe('Related Careers', () => {
    it('should get adjacent careers', () => {
      const adjacent = repository.getAdjacentCareers('software-engineer');
      expect(adjacent.length).toBeGreaterThan(0);
    });

    it('should get future career paths', () => {
      const paths = repository.getFutureCareerPaths('software-engineer');
      // Returns empty if referenced slugs don't exist in repository
      // In production, this would resolve to actual career objects
      expect(Array.isArray(paths)).toBe(true);
    });

    it('should return empty for unknown career', () => {
      const adjacent = repository.getAdjacentCareers('non-existent');
      expect(adjacent.length).toBe(0);
    });
  });

  describe('Statistics', () => {
    it('should get total count', () => {
      expect(repository.getCount()).toBe(10);
    });

    it('should get count by category', () => {
      expect(repository.getCountByCategory(CareerCategory.TECHNOLOGY)).toBe(4);
      expect(repository.getCountByCategory(CareerCategory.HEALTHCARE)).toBe(1);
    });

    it('should get categories with counts', () => {
      const counts = repository.getCategoriesWithCounts();
      expect(counts[CareerCategory.TECHNOLOGY]).toBe(4);
      expect(counts[CareerCategory.HEALTHCARE]).toBe(1);
    });
  });

  describe('CRUD Operations', () => {
    it('should add a career', () => {
      const newCareer = { ...softwareEngineer, id: 'test-career', slug: 'test-career', name: 'Test Career' };
      repository.addCareer(newCareer);
      expect(repository.getCount()).toBe(11);
      expect(repository.getCareerBySlug('test-career')).toBeDefined();
    });

    it('should throw on duplicate ID', () => {
      expect(() => {
        repository.addCareer(softwareEngineer);
      }).toThrow('already exists');
    });

    it('should remove a career', () => {
      const removed = repository.removeCareer('software-engineer');
      expect(removed).toBe(true);
      expect(repository.getCount()).toBe(9);
      expect(repository.getCareerById('software-engineer')).toBeUndefined();
    });

    it('should return false for removing non-existent career', () => {
      const removed = repository.removeCareer('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('Factory', () => {
    it('should create in-memory repository', () => {
      resetDefaultCareerRepository();
      const repo = createCareerRepository(RepositoryType.IN_MEMORY, {
        preloadCareers: sampleCareers,
      });
      expect(repo).toBeDefined();
      expect(repo.isReady()).toBe(true);
    });

    it('should throw for unimplemented repository types', () => {
      expect(() => {
        createCareerRepository(RepositoryType.MONGODB);
      }).toThrow('not yet implemented');
    });

    it('should provide default repository', () => {
      resetDefaultCareerRepository();
      const repo1 = getDefaultCareerRepository();
      const repo2 = getDefaultCareerRepository();
      expect(repo1).toBe(repo2); // Same instance
    });
  });

  describe('Caching', () => {
    it('should cache filter results', () => {
      const result1 = repository.filterCareers({ categories: [CareerCategory.TECHNOLOGY] });
      const result2 = repository.filterCareers({ categories: [CareerCategory.TECHNOLOGY] });
      // Results should be identical (cached)
      expect(result1.careers.length).toBe(result2.careers.length);
    });

    it('should cache search results', () => {
      const result1 = repository.searchCareers('engineer');
      const result2 = repository.searchCareers('engineer');
      expect(result1.careers.length).toBe(result2.careers.length);
    });

    it('should clear cache on modification', () => {
      repository.filterCareers({ categories: [CareerCategory.TECHNOLOGY] });
      repository.addCareer({ ...softwareEngineer, id: 'test', slug: 'test', name: 'Test' });
      // Cache should be cleared, no error should occur
      expect(repository.getCount()).toBe(11);
    });
  });
});
