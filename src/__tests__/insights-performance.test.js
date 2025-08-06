/**
 * Insights Performance and Data Loading Tests
 * Tests the improvements made to fix slow loading and stale data issues
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import Insights from '../pages/Insights/Insights';
import { UserContext } from '../context/User.context';

// Mock all the query functions
jest.mock('../react-query/queries/product/getAllProductQuery', () => ({
  getAllProductQuery: jest.fn(() => Promise.resolve([
    { product_uuid: 'test-uuid-1', name: 'Test Product 1' },
    { product_uuid: 'test-uuid-2', name: 'Test Product 2' }
  ]))
}));

jest.mock('../react-query/queries/budget/getProductBudgetQuery', () => ({
  getProductBudgetQuery: jest.fn((product_uuid) => {
    if (product_uuid === 'test-uuid-1') {
      return Promise.resolve({
        budget_uuid: 'budget-1',
        product_uuid: product_uuid,
        total_budget: 100000,
        release_budgets: [],
        last_updated: new Date().toISOString()
      });
    }
    // Simulate 404 for product 2
    const error = new Error('Not found');
    error.response = { status: 404 };
    return Promise.reject(error);
  })
}));

jest.mock('../react-query/queries/product/getProductReportQuery', () => ({
  getProductReportQuery: jest.fn(() => Promise.resolve({
    architecture_type: 'microservices',
    budget: 100000,
    budget_range: [80000, 120000],
    components_tree: [],
    feature_suggestions: []
  }))
}));

jest.mock('../react-query/queries/release/getReleaseProductReportQuery', () => ({
  getReleaseProductReportQuery: jest.fn(() => Promise.resolve([]))
}));

jest.mock('../react-query/queries/release/getAllFeatureQuery', () => ({
  getAllFeatureQuery: jest.fn(() => Promise.resolve([]))
}));

jest.mock('../react-query/queries/release/getAllIssueQuery', () => ({
  getAllIssueQuery: jest.fn(() => Promise.resolve([]))
}));

jest.mock('../react-query/queries/release/getAllReleaseQuery', () => ({
  getAllReleaseQuery: jest.fn(() => Promise.resolve([]))
}));

jest.mock('../react-query/queries/release/getAllStatusQuery', () => ({
  getAllStatusQuery: jest.fn(() => Promise.resolve([]))
}));

// Mock hooks
jest.mock('../hooks/useAlert', () => ({
  __esModule: true,
  default: () => ({
    displayAlert: jest.fn()
  })
}));

jest.mock('../zustand/product/productStore', () => ({
  useStore: () => ({
    activeProduct: null,
    setActiveProduct: jest.fn()
  })
}));

const mockUserContext = {
  user: { user_uuid: 'test-user' },
  organization: { organization_uuid: 'test-org' }
};

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 0,
      cacheTime: 0
    }
  }
});

const renderInsights = (queryClient = createTestQueryClient()) => {
  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <UserContext.Provider value={mockUserContext}>
          <Insights />
        </UserContext.Provider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Insights Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show loader for essential data only', async () => {
    const { getAllProductQuery } = require('../react-query/queries/product/getAllProductQuery');
    
    // Make product query slow to test loading state
    getAllProductQuery.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve([
        { product_uuid: 'test-uuid-1', name: 'Test Product 1' }
      ]), 100)
    ));

    renderInsights();

    // Should show loader initially
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for products to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('should handle budget 404 errors gracefully', async () => {
    renderInsights();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByDisplayValue('test-uuid-1')).toBeInTheDocument();
    });

    // Change to product that doesn't have budget (404 error)
    const productSelect = screen.getByLabelText('Product Options');
    fireEvent.change(productSelect, { target: { value: 'test-uuid-2' } });

    // Should not show error alerts for expected 404s
    await waitFor(() => {
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  test('should clear stale data when switching products', async () => {
    const queryClient = createTestQueryClient();
    renderInsights(queryClient);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByDisplayValue('test-uuid-1')).toBeInTheDocument();
    });

    // Spy on query client methods
    const removeQueriesSpy = jest.spyOn(queryClient, 'removeQueries');

    // Change product
    const productSelect = screen.getByLabelText('Product Options');
    fireEvent.change(productSelect, { target: { value: 'test-uuid-2' } });

    // Should clear relevant queries
    expect(removeQueriesSpy).toHaveBeenCalledWith(['productReport']);
    expect(removeQueriesSpy).toHaveBeenCalledWith(['productBudget']);
    expect(removeQueriesSpy).toHaveBeenCalledWith(['allFeatures']);
  });

  test('should show secondary loading indicator for non-essential data', async () => {
    const { getAllFeatureQuery } = require('../react-query/queries/release/getAllFeatureQuery');
    
    // Make features query slow
    getAllFeatureQuery.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve([]), 500)
    ));

    renderInsights();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByDisplayValue('test-uuid-1')).toBeInTheDocument();
    });

    // Should show secondary loading indicator
    await waitFor(() => {
      expect(screen.getByText(/Loading additional insights data/i)).toBeInTheDocument();
    });

    // Should eventually disappear
    await waitFor(() => {
      expect(screen.queryByText(/Loading additional insights data/i)).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('should not refetch on window focus', async () => {
    const { getProductBudgetQuery } = require('../react-query/queries/budget/getProductBudgetQuery');
    
    renderInsights();

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByDisplayValue('test-uuid-1')).toBeInTheDocument();
    });

    const initialCallCount = getProductBudgetQuery.mock.calls.length;

    // Simulate window focus
    window.dispatchEvent(new Event('focus'));

    // Wait a bit to see if refetch happens
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should not have made additional calls
    expect(getProductBudgetQuery.mock.calls.length).toBe(initialCallCount);
  });

  test('should handle query failures gracefully', async () => {
    const { getProductReportQuery } = require('../react-query/queries/product/getProductReportQuery');
    
    // Make report query fail
    getProductReportQuery.mockRejectedValue(new Error('Network error'));

    renderInsights();

    // Should still render without crashing
    await waitFor(() => {
      expect(screen.getByText('Insights')).toBeInTheDocument();
    });
  });

  test('should retry budget queries with proper logic', async () => {
    const { getProductBudgetQuery } = require('../react-query/queries/budget/getProductBudgetQuery');
    
    // Make budget query fail with 500 (should retry)
    const error = new Error('Server error');
    error.response = { status: 500 };
    getProductBudgetQuery.mockRejectedValueOnce(error);
    getProductBudgetQuery.mockResolvedValueOnce({
      budget_uuid: 'budget-1',
      product_uuid: 'test-uuid-1',
      total_budget: 100000,
      release_budgets: []
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: (failureCount, error) => {
            if (error?.response?.status === 404) {return false;}
            return failureCount < 2;
          },
          refetchOnWindowFocus: false
        }
      }
    });

    renderInsights(queryClient);

    // Should eventually succeed after retry
    await waitFor(() => {
      expect(getProductBudgetQuery).toHaveBeenCalledTimes(2);
    });
  });
});
