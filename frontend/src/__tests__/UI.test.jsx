import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge, Button, ErrorMessage, EmptyState, Stat } from '../components/UI';

describe('Badge', () => {
  test('renders children', () => {
    render(<Badge>TEST</Badge>);
    expect(screen.getByText('TEST')).toBeInTheDocument();
  });
  test('applies danger variant class', () => {
    const { container } = render(<Badge variant="danger">Danger</Badge>);
    expect(container.firstChild.className).toMatch(/badge-danger/);
  });
});

describe('Button', () => {
  test('calls onClick handler', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when loading prop is true', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('ErrorMessage', () => {
  test('displays error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  test('shows retry button when onRetry provided', () => {
    render(<ErrorMessage message="Error" onRetry={() => {}} />);
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  test('does not show retry button without onRetry', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  test('renders title and message', () => {
    render(<EmptyState title="Nothing here" message="Try searching for something" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Try searching for something')).toBeInTheDocument();
  });
});

describe('Stat', () => {
  test('renders label and value', () => {
    render(<Stat label="Speed" value="12,000" unit="km/h" />);
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('12,000')).toBeInTheDocument();
    expect(screen.getByText('km/h')).toBeInTheDocument();
  });
});
