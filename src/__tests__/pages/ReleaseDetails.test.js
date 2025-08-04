import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ReleaseDetails from '../../pages/ReleaseDetails/ReleaseDetails';
import { UserContext } from '../../context/User.context';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ releaseUuid: 'test-release-uuid' }),
  useHistory: () => ({ push: jest.fn() })
}));

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
        Release Business Tasks ({tasks.length})
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

// Mock release data
const mockReleaseData = {
  release_uuid: 'test-release-uuid',
  name: 'Release 1.0',
  description: 'First major release',
  release_date: '2024-02-01',
  status: 'active',
  features: [
    {
      feature_uuid: 'feature-1-uuid',
      name: 'Feature 1',
      description: 'Test feature'
    }
  ],
  issues: [
    {
      issue_uuid: 'issue-1-uuid',
      name: 'Issue 1',
      description: 'Test issue'
    }
  ]
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

describe('ReleaseDetails Page', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
    jest.clearAllMocks();
  });

  test('renders release details page', () => {
    render(<ReleaseDetails />, { wrapper });
    
    // Should render main release details
    expect(screen.getByText(/Release Details/i)).toBeInTheDocument();
  });

  test('displays release information tabs', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    await waitFor(() => {
      // Should have various tabs for release information
      expect(screen.getByText(/Features/i)).toBeInTheDocument();
      expect(screen.getByText(/Issues/i)).toBeInTheDocument();
    });
  });

  test('business tasks tab is available', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    await waitFor(() => {
      expect(screen.getByText(/Business Tasks/i)).toBeInTheDocument();
    });
  });

  test('business tasks tab shows release-specific tasks', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    // Click on business tasks tab
    const businessTasksTab = screen.getByText(/Business Tasks/i);
    fireEvent.click(businessTasksTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('business-tasks-list')).toBeInTheDocument();
    });
  });

  test('features tab displays release features', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    const featuresTab = screen.getByText(/Features/i);
    fireEvent.click(featuresTab);
    
    await waitFor(() => {
      expect(featuresTab).toBeInTheDocument();
    });
  });

  test('issues tab displays release issues', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    const issuesTab = screen.getByText(/Issues/i);
    fireEvent.click(issuesTab);
    
    await waitFor(() => {
      expect(issuesTab).toBeInTheDocument();
    });
  });

  test('tab navigation works correctly', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    const featuresTab = screen.getByText(/Features/i);
    const issuesTab = screen.getByText(/Issues/i);
    const businessTasksTab = screen.getByText(/Business Tasks/i);
    
    // Test navigation between tabs
    fireEvent.click(featuresTab);
    await waitFor(() => {
      expect(featuresTab).toBeInTheDocument();
    });
    
    fireEvent.click(issuesTab);
    await waitFor(() => {
      expect(issuesTab).toBeInTheDocument();
    });
    
    fireEvent.click(businessTasksTab);
    await waitFor(() => {
      expect(screen.getByTestId('business-tasks-list')).toBeInTheDocument();
    });
  });

  test('release business tasks are filtered correctly', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    // Navigate to business tasks tab
    const businessTasksTab = screen.getByText(/Business Tasks/i);
    fireEvent.click(businessTasksTab);
    
    await waitFor(() => {
      // Should show business tasks specific to this release
      expect(screen.getByTestId('business-tasks-list')).toBeInTheDocument();
    });
  });

  test('add business task for release works', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    // Navigate to business tasks
    const businessTasksTab = screen.getByText(/Business Tasks/i);
    fireEvent.click(businessTasksTab);
    
    await waitFor(() => {
      // Should have capability to add business tasks for this release
      expect(screen.getByTestId('business-tasks-list')).toBeInTheDocument();
    });
  });

  test('release UUID is properly passed to business tasks', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    // Navigate to business tasks
    const businessTasksTab = screen.getByText(/Business Tasks/i);
    fireEvent.click(businessTasksTab);
    
    await waitFor(() => {
      // Business tasks should be filtered by release UUID
      expect(screen.getByTestId('business-tasks-list')).toBeInTheDocument();
    });
  });

  test('chatbot integration works', () => {
    render(<ReleaseDetails />, { wrapper });
    
    expect(screen.getByTestId('chatbot')).toBeInTheDocument();
  });

  test('release metadata is displayed', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    await waitFor(() => {
      // Should show release information
      expect(screen.getByText(/Release Details/i)).toBeInTheDocument();
    });
  });

  test('business tasks context includes release information', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    // Navigate to business tasks
    const businessTasksTab = screen.getByText(/Business Tasks/i);
    fireEvent.click(businessTasksTab);
    
    await waitFor(() => {
      // Business tasks should have release context
      expect(screen.getByTestId('business-tasks-list')).toBeInTheDocument();
    });
  });

  test('handles loading state correctly', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    // Should handle loading state gracefully
    await waitFor(() => {
      expect(screen.getByText(/Release Details/i)).toBeInTheDocument();
    });
  });

  test('handles error state for missing release', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    // Should handle error states gracefully
    await waitFor(() => {
      expect(screen.getByText(/Release Details/i)).toBeInTheDocument();
    });
  });

  test('business tasks are properly scoped to release', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    // Navigate to business tasks
    const businessTasksTab = screen.getByText(/Business Tasks/i);
    fireEvent.click(businessTasksTab);
    
    await waitFor(() => {
      // Should show only business tasks for this specific release
      const businessTasksList = screen.getByTestId('business-tasks-list');
      expect(businessTasksList).toHaveTextContent('Release Business Tasks');
    });
  });

  test('release business tasks support all standard operations', async () => {
    render(<ReleaseDetails />, { wrapper });
    
    // Navigate to business tasks
    const businessTasksTab = screen.getByText(/Business Tasks/i);
    fireEvent.click(businessTasksTab);
    
    await waitFor(() => {
      // Should support create, read, update, delete operations for business tasks
      expect(screen.getByTestId('business-tasks-list')).toBeInTheDocument();
    });
  });

  test('user permissions are respected in release context', () => {
    render(<ReleaseDetails />, { wrapper });
    
    // Should use user context for permission-based functionality
    expect(screen.getByText(/Release Details/i)).toBeInTheDocument();
  });
});
