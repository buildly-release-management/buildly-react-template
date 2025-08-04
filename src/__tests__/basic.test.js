import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple component test
describe('Basic Test Setup', () => {
  test('renders a simple component', () => {
    const TestComponent = () => <div>Hello Test</div>;
    render(<TestComponent />);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  test('basic math works', () => {
    expect(2 + 2).toBe(4);
  });

  test('array operations work', () => {
    const items = ['apple', 'banana', 'cherry'];
    expect(items).toHaveLength(3);
    expect(items[0]).toBe('apple');
  });

  test('object operations work', () => {
    const user = { name: 'John', age: 30 };
    expect(user.name).toBe('John');
    expect(user.age).toBe(30);
  });

  test('async operations work', async () => {
    const promise = Promise.resolve('test value');
    const result = await promise;
    expect(result).toBe('test value');
  });
});
