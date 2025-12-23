import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';
import '@testing-library/jest-dom';

// Mocks
jest.mock('next/navigation', () => ({
    usePathname: () => '/',
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
    useSearchParams: () => ({ get: jest.fn(), toString: jest.fn() }),
}));

jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

jest.mock('use-debounce', () => ({
    useDebouncedCallback: (fn: Function) => fn,
}));

jest.mock('@/context/WishlistContext', () => ({
    useWishlist: () => ({ wishlist: [] }),
}));

describe('Navbar', () => {
    it('renders the title', () => {
        render(<Navbar locale="en" />);
        expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('renders search input', () => {
        render(<Navbar locale="en" />);
        expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    });

    it('renders How it Works link', () => {
        render(<Navbar locale="en" />);
        expect(screen.getByText('How it Works')).toBeInTheDocument();
    });
});
