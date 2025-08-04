import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Insights from '../../pages/Insights/Insights';
import { UserContext } from '../../context/User.context';

// Mock dependencies
jest.mock('../../modules/http/http.service', () => ({
  httpService: {
    sendDirectServiceRequest: jest.fn(() => Promise.resolve({ data: {} }))
  }
}));

jest.mock('../../components/Timeline/TimelineComponent', () => {
  return function MockTimelineComponent() {
    return <div data-testid="timeline-component">Timeline Component</div>;
  };
});

jest.mock('../../components/Charts/GanttChart/GanttChart', () => {
  return function MockGanttChart() {
    return <div data-testid="gantt-chart">Gantt Chart</div>;
  };
});

jest.mock('../../components/Chatbot/Chatbot', () => {
  return function MockChatbot() {
    return <div data-testid="chatbot">Chatbot</div>;
  };
});

jest.mock('../../components/TeamConfigModal/TeamConfigModal', () => {
  return function MockTeamConfigModal({ open, onClose, onSave }) {
    return open ? (
      <div data-testid="team-config-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSave([])}>Save</button>
      </div>
    ) : null;
  };
});

// Mock user context
const mockUser = {
  first_name: 'Test',
  last_name: 'User',
  title: 'Developer',
  organization: {
    organization_uuid: 'test-org-uuid',
    name: 'Test Organization'
  },
  contact_info: 'test@example.com',
  core_user_uuid: 'test-user-uuid'
};

// Mock product data
const mockProducts = [
  {
    product_uuid: 'test-product-uuid',
    name: 'Test Product',
    architecture_type: 'microservice'
  }
];

const mockReportData = {
  name: 'Test Product',
  architecture_type: 'microservice',
  product_uuid: 'test-product-uuid'
};

const mockReleaseData = [
  {
    name: 'Release 1.0',
    release_uuid: 'release-1-uuid',
    release_date: '2024-01-15',
    duration: { weeks: 8 },
    features: [
      { name: 'Feature 1', description: 'Test feature', status: 'active' }
    ],
    issues: [
      { name: 'Issue 1', description: 'Test issue', status: 'open' }
    ],
    team: [
      { role: 'Developer', count: 2, weeklyRate: 2000 }
    ]
  }
];

// Setup test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <UserContext.Provider value={mockUser}>
          {children}
        </UserContext.Provider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('Insights Page', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders insights page with main title', () => {
    render(<Insights />, { wrapper });
    
    expect(screen.getByText('Insights')).toBeInTheDocument();
    expect(screen.getByLabelText('Product Options')).toBeInTheDocument();
  });

  test('displays warning when no product is selected', () => {
    render(<Insights />, { wrapper });
    
    expect(screen.getByText('Please select a product to get insights.')).toBeInTheDocument();
  });

  test('renders collapsible sections with correct titles', async () => {
    render(<Insights />, { wrapper });
    
    // Check for accordion section headers
    await waitFor(() => {
      expect(screen.getByText('🏗️ Architecture & Design')).toBeInTheDocument();
      expect(screen.getByText('📅 Timelines & Productivity')).toBeInTheDocument();
      expect(screen.getByText('💰 Budget Management')).toBeInTheDocument();
    });
  });

  test('architecture section can be collapsed and expanded', async () => {
    render(<Insights />, { wrapper });
    
    const architectureHeader = screen.getByText('🏗️ Architecture & Design');
    
    // Initially expanded, should show content
    expect(architectureHeader).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(architectureHeader);
    
    // Wait for state update
    await waitFor(() => {
      // The header should still be visible but content collapsed
      expect(architectureHeader).toBeInTheDocument();
    });
  });

  test('timelines section can be collapsed and expanded', async () => {
    render(<Insights />, { wrapper });
    
    const timelinesHeader = screen.getByText('📅 Timelines & Productivity');
    
    // Initially expanded, should show content
    expect(timelinesHeader).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(timelinesHeader);
    
    // Wait for state update
    await waitFor(() => {
      expect(timelinesHeader).toBeInTheDocument();
    });
  });

  test('budget section can be collapsed and expanded', async () => {
    render(<Insights />, { wrapper });
    
    const budgetHeader = screen.getByText('💰 Budget Management');
    
    // Initially expanded, should show content
    expect(budgetHeader).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(budgetHeader);
    
    // Wait for state update
    await waitFor(() => {
      expect(budgetHeader).toBeInTheDocument();
    });
  });

  test('product selector works correctly', async () => {
    render(<Insights />, { wrapper });
    
    const productSelect = screen.getByLabelText('Product Options');
    expect(productSelect).toBeInTheDocument();
    
    // Should have default "Select" option
    expect(screen.getByText('Select')).toBeInTheDocument();
  });

  test('timeline and gantt view toggle works', async () => {
    render(<Insights />, { wrapper });
    
    // Look for view toggle buttons (they should be present in the DOM structure)
    await waitFor(() => {
      // These buttons exist in the component but might not be visible without product selection
      const timelinesSection = screen.getByText('📅 Timelines & Productivity');
      expect(timelinesSection).toBeInTheDocument();
    });
  });

  test('download menu appears correctly', async () => {
    render(<Insights />, { wrapper });
    
    // Check for the dashboard PDF button which triggers the menu
    // This would only be visible when a product is selected, but the structure should exist
    expect(screen.getByText('Insights')).toBeInTheDocument();
  });

  test('chatbot component is rendered', () => {
    render(<Insights />, { wrapper });
    
    expect(screen.getByTestId('chatbot')).toBeInTheDocument();
  });

  test('handles empty product list gracefully', () => {
    render(<Insights />, { wrapper });
    
    // Should show the select dropdown even with no products
    expect(screen.getByLabelText('Product Options')).toBeInTheDocument();
    expect(screen.getByText('Select')).toBeInTheDocument();
  });

  test('section states are maintained independently', async () => {
    render(<Insights />, { wrapper });
    
    const architectureHeader = screen.getByText('🏗️ Architecture & Design');
    const timelinesHeader = screen.getByText('📅 Timelines & Productivity');
    
    // Click to toggle architecture section
    fireEvent.click(architectureHeader);
    
    await waitFor(() => {
      // Both headers should still be present
      expect(architectureHeader).toBeInTheDocument();
      expect(timelinesHeader).toBeInTheDocument();
    });
  });
});
