
import { render, screen } from '@testing-library/react';
import LoginPage from '../page';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

describe('Login Page', () => {
  it('renders the main heading', () => {
    render(<LoginPage />);
    const heading = screen.getByRole('heading', {
      name: /نظام إدارة مكتب النائب/i,
    });
    expect(heading).toBeInTheDocument();
  });
});
