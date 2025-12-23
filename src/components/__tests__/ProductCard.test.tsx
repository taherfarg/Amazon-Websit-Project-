import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../ProductCard';
import '@testing-library/jest-dom';

// Mocks
jest.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

jest.mock('@/context/WishlistContext', () => ({
    useWishlist: () => ({
        wishlist: [],
        isInWishlist: jest.fn().mockReturnValue(false),
        addToWishlist: jest.fn(),
        removeFromWishlist: jest.fn(),
    }),
}));

const mockProduct = {
    id: 1,
    title_en: 'Test Product',
    title_ar: 'منتج تجريبي',
    description_en: 'Test Description',
    description_ar: 'وصف تجريبي',
    image_url: 'https://example.com/image.jpg',
    affiliate_link: 'https://amazon.com',
    category: 'Tech',
    rating: 4.5,
    is_featured: true,
};

describe('ProductCard', () => {
    it('renders product title in English', () => {
        render(<ProductCard product={mockProduct} locale="en" />);
        expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    it('renders product description', () => {
        render(<ProductCard product={mockProduct} locale="en" />);
        expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('renders category', () => {
        render(<ProductCard product={mockProduct} locale="en" />);
        expect(screen.getByText('Tech')).toBeInTheDocument();
    });

    it('renders rating', () => {
        render(<ProductCard product={mockProduct} locale="en" />);
        expect(screen.getByText('4.5')).toBeInTheDocument();
    });
});
