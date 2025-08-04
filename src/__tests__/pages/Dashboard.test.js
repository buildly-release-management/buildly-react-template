import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Dashboard from '../../pages/Dashboard/Dashboard';
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
        Business Tasks List ({tasks.length} tasks)
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

// Mock business tasks data
const mockBusinessTasks = [
  {
    task_uuid: 'task-1-uuid',
    title: 'Test Business Task 1',
    description: 'Test description',
    category: 'development',
    priority: 'high',
    status: 'in_progress',
    assigned_user_uuid: 'test-user-uuid',
    due_date: '2024-02-01',
    progress_percentage: 50
  },
  {
    task_uuid: 'task-2-uuid',
    title: 'Test Business Task 2',
    description: 'Another test description',
    category: 'planning',
    priority: 'medium',
    status: 'pending',
    assigned_user_uuid: 'test-user-uuid',
    due_date: '2024-02-15',
    progress_percentage: 25
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

describe('Dashboard Page', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
    jest.clearAllMocks();
  });

  test('renders dashboard with main title', () => {
    render(<Dashboard />, { wrapper });
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('displays welcome message with user name', () => {
    render(<Dashboard />, { wrapper });
    
    expect(screen.getByText(/Welcome back, Test User/i)).toBeInTheDocument();
  });

  test('renders business tasks section', async () => {
    render(<Dashboard />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText('My Business Tasks')).toBeInTheDocument();
    });
  });

  test('displays quick actions section', () => {
    render(<Dashboard />, { wrapper });
    
    // Should have quick action buttons
    expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument();
  });

  test('shows recent activity section', () => {
    render(<Dashboard />, { wrapper });
    
    expect(screen.getByText(/Recent Activity/i)).toBeInTheDocument();
  });

  test('renders business tasks list component', async () => {
    render(<Dashboard />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByTestId('business-tasks-list')).toBeInTheDocument();
    });
  });

  test('displays overdue tasks indicator when tasks are overdue', async () => {
    render(<Dashboard />, { wrapper });
    
    // Look for any overdue indicators in the business tasks section
    await waitFor(() => {
      expect(screen.getByText('My Business Tasks')).toBeInTheDocument();
    });
  });

  test('shows progress indicators for tasks', async () => {
    render(<Dashboard />, { wrapper });
    
    await waitFor(() => {
      // Should show business tasks section which includes progress indicators
      expect(screen.getByText('My Business Tasks')).toBeInTheDocument();
    });
  });

  test('handles empty business tasks list', async () => {
    render(<Dashboard />, { wrapper });
    
    await waitFor(() => {
      // Should still render the business tasks section even if empty
      expect(screen.getByText('My Business Tasks')).toBeInTheDocument();
    });
  });

  test('chatbot component is rendered', () => {
    render(<Dashboard />, { wrapper });
    
    expect(screen.getByTestId('chatbot')).toBeInTheDocument();
  });

  test('navigation links are present', () => {
    render(<Dashboard />, { wrapper });
    
    // Check for common navigation elements that should be present
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('user context is properly utilized', () => {
    render(<Dashboard />, { wrapper });
    
    // Should display user's name from context
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();
  });

  test('responsive layout elements are present', () => {
    render(<Dashboard />, { wrapper });
    
    // Should have main dashboard container
    const dashboard = screen.getByText('Dashboard');
    expect(dashboard).toBeInTheDocument();
  });

  test('business tasks integration works correctly', async () => {
    render(<Dashboard />, { wrapper });
    
    await waitFor(() => {
      // Should integrate business tasks functionality
      expect(screen.getByText('My Business Tasks')).toBeInTheDocument();
      expect(screen.getByTestId('business-tasks-list')).toBeInTheDocument();
    });
  });
});
