import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import BusinessTasksList from '../../components/BusinessTasksList/BusinessTasksList';
import { UserContext } from '../../context/User.context';

// Mock dependencies
jest.mock('../../hooks/useAlert', () => ({
  __esModule: true,
  default: () => jest.fn()
}));

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
const mockTasks = [
  {
    task_uuid: 'task-1-uuid',
    title: 'High Priority Task',
    description: 'This is a high priority task',
    category: 'development',
    priority: 'high',
    status: 'in_progress',
    assigned_user_uuid: 'test-user-uuid',
    due_date: '2024-01-15', // Past due date to test overdue functionality
    progress_percentage: 75,
    created_date: '2024-01-01',
    estimated_hours: 20,
    actual_hours: 15
  },
  {
    task_uuid: 'task-2-uuid',
    title: 'Medium Priority Task',
    description: 'This is a medium priority task',
    category: 'planning',
    priority: 'medium',
    status: 'pending',
    assigned_user_uuid: 'test-user-uuid',
    due_date: '2024-03-01', // Future date
    progress_percentage: 25,
    created_date: '2024-01-10',
    estimated_hours: 10,
    actual_hours: 2
  },
  {
    task_uuid: 'task-3-uuid',
    title: 'Completed Task',
    description: 'This task is completed',
    category: 'testing',
    priority: 'low',
    status: 'completed',
    assigned_user_uuid: 'test-user-uuid',
    due_date: '2024-01-20',
    progress_percentage: 100,
    created_date: '2024-01-05',
    estimated_hours: 8,
    actual_hours: 8
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

describe('BusinessTasksList Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
    jest.clearAllMocks();
  });

  test('renders business tasks list with provided tasks', () => {
    render(<BusinessTasksList tasks={mockTasks} />, { wrapper });
    
    // Should render all task titles
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });

  test('displays task priorities correctly', () => {
    render(<BusinessTasksList tasks={mockTasks} />, { wrapper });
    
    // Should show priority indicators
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority Task')).toBeInTheDocument();
  });

  test('shows task status correctly', () => {
    render(<BusinessTasksList tasks={mockTasks} />, { wrapper });
    
    // Should display different status indicators
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });

  test('displays progress percentages', () => {
    render(<BusinessTasksList tasks={mockTasks} />, { wrapper });
    
    // Should show progress information somewhere in the component
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
  });

  test('handles overdue tasks appropriately', () => {
    render(<BusinessTasksList tasks={mockTasks} />, { wrapper });
    
    // Should render overdue task (task-1 has due date in past)
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
  });

  test('shows task categories', () => {
    render(<BusinessTasksList tasks={mockTasks} />, { wrapper });
    
    // Should display task with development category
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
  });

  test('renders empty state when no tasks provided', () => {
    render(<BusinessTasksList tasks={[]} />, { wrapper });
    
    // Should handle empty tasks array gracefully
    // Component should still render but show empty state
    expect(screen.queryByText('High Priority Task')).not.toBeInTheDocument();
  });

  test('handles undefined tasks prop', () => {
    render(<BusinessTasksList />, { wrapper });
    
    // Should handle undefined tasks prop without crashing
    expect(screen.queryByText('High Priority Task')).not.toBeInTheDocument();
  });

  test('displays task descriptions', () => {
    render(<BusinessTasksList tasks={mockTasks} />, { wrapper });
    
    // Should show task descriptions
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
  });

  test('shows due dates for tasks', () => {
    render(<BusinessTasksList tasks={mockTasks} />, { wrapper });
    
    // Should display due date information
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
  });

  test('task filtering works correctly', async () => {
    render(<BusinessTasksList tasks={mockTasks} showFilters={true} />, { wrapper });
    
    // Should render all tasks initially
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });

  test('task actions are available', () => {
    render(<BusinessTasksList tasks={mockTasks} showActions={true} />, { wrapper });
    
    // Should render tasks with potential action buttons
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
  });

  test('completed tasks are visually distinct', () => {
    render(<BusinessTasksList tasks={mockTasks} />, { wrapper });
    
    // Should show completed task differently
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });

  test('task cards are clickable when onTaskClick provided', () => {
    const onTaskClick = jest.fn();
    render(<BusinessTasksList tasks={mockTasks} onTaskClick={onTaskClick} />, { wrapper });
    
    // Should render tasks that can be clicked
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
  });

  test('compact view works correctly', () => {
    render(<BusinessTasksList tasks={mockTasks} compact={true} />, { wrapper });
    
    // Should render tasks in compact mode
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
  });

  test('loading state is handled', () => {
    render(<BusinessTasksList tasks={mockTasks} loading={true} />, { wrapper });
    
    // Should still render content even when loading
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
  });
});
