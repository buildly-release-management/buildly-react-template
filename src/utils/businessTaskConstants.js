export const TASK_PRIORITIES = [
  { value: 'critical', label: 'Critical', color: '#d32f2f' },
  { value: 'high', label: 'High', color: '#f57c00' },
  { value: 'medium', label: 'Medium', color: '#1976d2' },
  { value: 'low', label: 'Low', color: '#388e3c' },
];

export const TASK_STATUSES = [
  { value: 'not_started', label: 'Not Started', color: '#9e9e9e' },
  { value: 'in_progress', label: 'In Progress', color: '#2196f3' },
  { value: 'blocked', label: 'Blocked', color: '#f44336' },
  { value: 'review', label: 'Under Review', color: '#ff9800' },
  { value: 'completed', label: 'Completed', color: '#4caf50' },
  { value: 'cancelled', label: 'Cancelled', color: '#757575' },
  { value: 'on_hold', label: 'On Hold', color: '#9c27b0' },
];

export const RECURRENCE_PATTERNS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
];

export const STANDARD_TASK_CATEGORIES = [
  { value: 'product_management', label: 'Product Management', icon: '📊' },
  { value: 'project_management', label: 'Project Management', icon: '📋' },
  { value: 'business_analysis', label: 'Business Analysis', icon: '📈' },
  { value: 'user_research', label: 'User Research', icon: '🔍' },
  { value: 'design_ui_ux', label: 'Design & UI/UX', icon: '🎨' },
  { value: 'content_marketing', label: 'Content & Marketing', icon: '📝' },
  { value: 'quality_assurance', label: 'Quality Assurance', icon: '✅' },
  { value: 'documentation', label: 'Documentation', icon: '📚' },
  { value: 'compliance_legal', label: 'Compliance & Legal', icon: '⚖️' },
  { value: 'stakeholder_management', label: 'Stakeholder Management', icon: '🤝' },
  { value: 'training_support', label: 'Training & Support', icon: '🎓' },
  { value: 'data_analytics', label: 'Data & Analytics', icon: '📊' },
  { value: 'vendor_management', label: 'Vendor Management', icon: '🏢' },
  { value: 'budget_finance', label: 'Budget & Finance', icon: '💰' },
  { value: 'risk_management', label: 'Risk Management', icon: '⚠️' },
  { value: 'communication', label: 'Communication', icon: '💬' },
  { value: 'testing_validation', label: 'Testing & Validation', icon: '🧪' },
  { value: 'deployment_operations', label: 'Deployment & Operations', icon: '🚀' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export const RISK_LEVELS = [
  { value: 'critical', label: 'Critical', color: '#d32f2f' },
  { value: 'high', label: 'High', color: '#f57c00' },
  { value: 'medium', label: 'Medium', color: '#1976d2' },
  { value: 'low', label: 'Low', color: '#388e3c' },
];

export const getStatusColor = (status) => {
  const statusObj = TASK_STATUSES.find(s => s.value === status);
  return statusObj ? statusObj.color : '#9e9e9e';
};

export const getPriorityColor = (priority) => {
  const priorityObj = TASK_PRIORITIES.find(p => p.value === priority);
  return priorityObj ? priorityObj.color : '#1976d2';
};

export const getRiskColor = (riskLevel) => {
  const riskObj = RISK_LEVELS.find(r => r.value === riskLevel);
  return riskObj ? riskObj.color : '#1976d2';
};

export const getCategoryIcon = (categoryValue) => {
  const category = STANDARD_TASK_CATEGORIES.find(c => c.value === categoryValue);
  return category ? category.icon : '📦';
};
