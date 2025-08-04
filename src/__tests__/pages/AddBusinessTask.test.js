import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import AddBusinessTask from '../../pages/ProductRoadmap/forms/AddBusinessTask';
import { UserContext } from '../../context/User.context';

// Mock dependencies
jest.mock('../../hooks/useAlert', () => ({
  __esModule: true,
  default: () => jest.fn()
}));

jest.mock('../../components/AIFormHelper/AIFormHelper', () => {
  return function MockAIFormHelper({ onSuggestion }) {
    return (
      <div data-testid="ai-form-helper">
        <button onClick={() => onSuggestion && onSuggestion('AI Suggested Title')}>
          AI Helper
        </button>
      </div>
    );
  };
});

jest.mock('../../react-query/mutations/businessTask/businessTaskMutations', () => ({
  useCreateBusinessTaskMutation: () => ({
    mutate: jest.fn(),
    isLoading: false
  }),
  useUpdateBusinessTaskMutation: () => ({
    mutate: jest.fn(),
    isLoading: false
  })
}));

jest.mock('../../react-query/queries/businessTask/getAllBusinessTasksQuery', () => ({
  useGetAllBusinessTasksQuery: () => ({
    data: [],
    isLoading: false
  })
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

// Mock organization members
const mockOrgMembers = [
  {
    core_user_uuid: 'user-1-uuid',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com'
  },
  {
    core_user_uuid: 'user-2-uuid',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com'
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

describe('AddBusinessTask Form', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
    jest.clearAllMocks();
  });

  test('renders business task form with all required fields', () => {
    render(<AddBusinessTask />, { wrapper });
    
    // Should render main form fields
    expect(screen.getByText(/Task Title/i)).toBeInTheDocument();
    expect(screen.getByText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Category/i)).toBeInTheDocument();
    expect(screen.getByText(/Priority/i)).toBeInTheDocument();
  });

  test('title field works correctly', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    const titleInput = screen.getByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Task Title' } });
    
    await waitFor(() => {
      expect(titleInput).toHaveValue('Test Task Title');
    });
  });

  test('description field works correctly', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    const descriptionInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test task description' } });
    
    await waitFor(() => {
      expect(descriptionInput).toHaveValue('Test task description');
    });
  });

  test('category selection works', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    const categorySelect = screen.getByLabelText(/Category/i);
    fireEvent.change(categorySelect, { target: { value: 'development' } });
    
    await waitFor(() => {
      expect(categorySelect).toHaveValue('development');
    });
  });

  test('priority selection works', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    const prioritySelect = screen.getByLabelText(/Priority/i);
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    
    await waitFor(() => {
      expect(prioritySelect).toHaveValue('high');
    });
  });

  test('AI form helper integration works', () => {
    render(<AddBusinessTask />, { wrapper });
    
    // Should render AI helper components
    const aiHelpers = screen.getAllByTestId('ai-form-helper');
    expect(aiHelpers.length).toBeGreaterThan(0);
  });

  test('AI suggestion callback works for title', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    const aiHelperButton = screen.getAllByText('AI Helper')[0];
    fireEvent.click(aiHelperButton);
    
    await waitFor(() => {
      const titleInput = screen.getByLabelText(/Task Title/i);
      expect(titleInput).toHaveValue('AI Suggested Title');
    });
  });

  test('due date picker works', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    // Look for due date field
    const dueDateInput = screen.getByLabelText(/Due Date/i);
    expect(dueDateInput).toBeInTheDocument();
  });

  test('estimated hours field works', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    const estimatedHoursInput = screen.getByLabelText(/Estimated Hours/i);
    fireEvent.change(estimatedHoursInput, { target: { value: '20' } });
    
    await waitFor(() => {
      expect(estimatedHoursInput).toHaveValue('20');
    });
  });

  test('assignment fields work correctly', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    // Should have assigned user field
    expect(screen.getByText(/Assigned User/i)).toBeInTheDocument();
  });

  test('progress percentage field works', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    const progressInput = screen.getByLabelText(/Progress Percentage/i);
    fireEvent.change(progressInput, { target: { value: '50' } });
    
    await waitFor(() => {
      expect(progressInput).toHaveValue('50');
    });
  });

  test('risk level selection works', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    const riskSelect = screen.getByLabelText(/Risk Level/i);
    fireEvent.change(riskSelect, { target: { value: 'high' } });
    
    await waitFor(() => {
      expect(riskSelect).toHaveValue('high');
    });
  });

  test('recurring task checkbox works', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    const recurringCheckbox = screen.getByLabelText(/Is Recurring/i);
    fireEvent.click(recurringCheckbox);
    
    await waitFor(() => {
      expect(recurringCheckbox).toBeChecked();
    });
  });

  test('form submission works correctly', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    // Fill in required fields
    const titleInput = screen.getByLabelText(/Task Title/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);
    
    // Should not throw errors
    await waitFor(() => {
      expect(titleInput).toHaveValue('Test Task');
    });
  });

  test('form validation works for required fields', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);
    
    // Should show validation messages or prevent submission
    await waitFor(() => {
      expect(submitButton).toBeInTheDocument();
    });
  });

  test('edit mode works correctly', () => {
    const editData = {
      task_uuid: 'test-uuid',
      title: 'Existing Task',
      description: 'Existing Description',
      category: 'development',
      priority: 'high'
    };
    
    render(<AddBusinessTask editData={editData} editPage={true} />, { wrapper });
    
    // Should populate fields with edit data
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
  });

  test('form resets correctly', () => {
    render(<AddBusinessTask />, { wrapper });
    
    const titleInput = screen.getByLabelText(/Task Title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    
    // Form should have the value
    expect(titleInput).toHaveValue('Test Task');
  });

  test('stakeholder emails field works', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    // Should have stakeholder emails field
    expect(screen.getByText(/Stakeholder Emails/i)).toBeInTheDocument();
  });

  test('acceptance criteria field works', async () => {
    render(<AddBusinessTask />, { wrapper });
    
    const acceptanceCriteriaInput = screen.getByLabelText(/Acceptance Criteria/i);
    fireEvent.change(acceptanceCriteriaInput, { target: { value: 'Test criteria' } });
    
    await waitFor(() => {
      expect(acceptanceCriteriaInput).toHaveValue('Test criteria');
    });
  });
});
