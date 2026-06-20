// @vitest-environment happy-dom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from '../empty-state';

describe('EmptyState Component', () => {
  it('renders the title and description correctly', () => {
    render(<EmptyState title="No transactions" description="Try creating one" />);
    
    expect(screen.getByText('No transactions')).toBeInTheDocument();
    expect(screen.getByText('Try creating one')).toBeInTheDocument();
  });

  it('renders the action button when provided', () => {
    const actionButton = <button>Add Item</button>;
    render(<EmptyState title="No transactions" action={actionButton} />);
    
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });
});
