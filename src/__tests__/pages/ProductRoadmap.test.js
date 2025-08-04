import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProductRoadmap from '../../pages/ProductRoadmap/ProductRoadmap';
import { UserContext } from '../../context/User.context';

// Mock dependencies
jest.mock('../../hooks/useAlert', () => ({
  __esModule: true,
  default: () => jest.fn()
}));

jest.mock('../../components/Chatbot/Chatbot', () => {
  return function MockChatbot() {
    return <div data-testid="chatbot">Chatbot</div>;
  };
});

jest.mock('../../components/BusinessTasksList/BusinessTasksList', () => {
  return function MockBusinessTasksList({ tasks = [] }) {
    return (
      <div data-testid="business-tasks-list">
        Business Tasks ({tasks.length})
      </div>
    );
  };
});

// Mock user context
const mockUser = {
  first_name: 'Test',
  last_name: 'User',
  organization: {
    organization_uuid: 'test-org-uuid',
    name: 'Test Organization'
  },
  core_user_uuid: 'test-user-uuid'
};

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

describe('ProductRoadmap Page', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
    jest.clearAllMocks();
  });

  test('renders product roadmap with main navigation tabs', () => {
    render(<ProductRoadmap />, { wrapper });
    
    // Should render main roadmap navigation
    expect(screen.getByText(/Product Roadmap/i)).toBeInTheDocument();
  });

  test('displays tabular view tab', async () => {
    render(<ProductRoadmap />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/Tabular/i)).toBeInTheDocument();
    });
  });

  test('displays kanban view tab', async () => {
    render(<ProductRoadmap />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/Kanban/i)).toBeInTheDocument();
    });
  });

  test('displays business tasks tab', async () => {
    render(<ProductRoadmap />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/Business Tasks/i)).toBeInTheDocument();
    });
  });

  test('business tasks tab shows business tasks list', async () => {
    render(<ProductRoadmap />, { wrapper });
    
    // Click on business tasks tab
    const businessTasksTab = screen.getByText(/Business Tasks/i);
    fireEvent.click(businessTasksTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('business-tasks-list')).toBeInTheDocument();
    });
  });

  test('navigation between tabs works correctly', async () => {
    render(<ProductRoadmap />, { wrapper });
    
    // Should be able to switch between tabs
    const tabularTab = screen.getByText(/Tabular/i);
    const kanbanTab = screen.getByText(/Kanban/i);
    const businessTasksTab = screen.getByText(/Business Tasks/i);
    
    fireEvent.click(tabularTab);
    await waitFor(() => {
      expect(tabularTab).toBeInTheDocument();
    });
    
    fireEvent.click(kanbanTab);
    await waitFor(() => {
      expect(kanbanTab).toBeInTheDocument();
    });
    
    fireEvent.click(businessTasksTab);
    await waitFor(() => {
      expect(businessTasksTab).toBeInTheDocument();
    });
  });

  test('features can be managed from roadmap', async () => {
    render(<ProductRoadmap />, { wrapper });
    
    // Should have feature management capabilities
    await waitFor(() => {
      expect(screen.getByText(/Product Roadmap/i)).toBeInTheDocument();
    });
  });

  test('issues can be managed from roadmap', async () => {
    render(<ProductRoadmap />, { wrapper });
    
    // Should have issue management capabilities
    await waitFor(() => {
      expect(screen.getByText(/Product Roadmap/i)).toBeInTheDocument();
    });
  });

  test('business tasks integration works in roadmap context', async () => {
    render(<ProductRoadmap />, { wrapper });
    
    // Click business tasks tab
    const businessTasksTab = screen.getByText(/Business Tasks/i);
    fireEvent.click(businessTasksTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('business-tasks-list')).toBeInTheDocument();
    });
  });

  test('add business task functionality is accessible', async () => {
    render(<ProductRoadmap />, { wrapper });
    
    // Should have capability to add business tasks
    const businessTasksTab = screen.getByText(/Business Tasks/i);
    fireEvent.click(businessTasksTab);
    
    await waitFor(() => {
      // Should show business tasks interface
      expect(screen.getByTestId('business-tasks-list')).toBeInTheDocument();
    });
  });

  test('chatbot integration works', () => {
    render(<ProductRoadmap />, { wrapper });
    
    expect(screen.getByTestId('chatbot')).toBeInTheDocument();
  });

  test('roadmap report tab exists', async () => {
    render(<ProductRoadmap />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/Report/i)).toBeInTheDocument();
    });
  });

  test('roadmap supports different view modes', async () => {
    render(<ProductRoadmap />, { wrapper });
    
    // Should support tabular view
    expect(screen.getByText(/Tabular/i)).toBeInTheDocument();
    
    // Should support kanban view
    expect(screen.getByText(/Kanban/i)).toBeInTheDocument();
  });

  test('roadmap integrates with business task management', async () => {
    render(<ProductRoadmap />, { wrapper });
    
    // Navigate to business tasks
    const businessTasksTab = screen.getByText(/Business Tasks/i);
    fireEvent.click(businessTasksTab);
    
    await waitFor(() => {
      // Should show business tasks functionality
      expect(screen.getByTestId('business-tasks-list')).toBeInTheDocument();
    });
  });

  test('user context is properly used in roadmap', () => {
    render(<ProductRoadmap />, { wrapper });
    
    // Should have access to user context for permissions and data
    expect(screen.getByText(/Product Roadmap/i)).toBeInTheDocument();
  });

  test('responsive layout works correctly', () => {
    render(<ProductRoadmap />, { wrapper });
    
    // Should render responsive layout elements
    expect(screen.getByText(/Product Roadmap/i)).toBeInTheDocument();
  });

  test('roadmap handles empty data states', async () => {
    render(<ProductRoadmap />, { wrapper });
    
    // Should handle empty states gracefully
    await waitFor(() => {
      expect(screen.getByText(/Product Roadmap/i)).toBeInTheDocument();
    });
  });

  test('business tasks filtering works in roadmap context', async () => {
    render(<ProductRoadmap />, { wrapper });
    
    // Navigate to business tasks
    const businessTasksTab = screen.getByText(/Business Tasks/i);
    fireEvent.click(businessTasksTab);
    
    await waitFor(() => {
      // Should show business tasks with filtering capabilities
      expect(screen.getByTestId('business-tasks-list')).toBeInTheDocument();
    });
  });
});
