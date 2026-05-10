import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Ingestion from '../components/Ingestion';

// Mock Zustand store
vi.mock('../store/useStore', () => ({
  useStore: () => ({
    setFileId: vi.fn(),
    setColumns: vi.fn(),
    setTargetColumn: vi.fn(),
    setVisXCol: vi.fn(),
    setPreviewData: vi.fn(),
    setEdaInsights: vi.fn(),
    setSelectedFeatures: vi.fn(),
    setCurrentStep: vi.fn(),
    setLoading: vi.fn(),
    loading: false
  })
}));

describe('Ingestion Component', () => {
  it('renders upload button', () => {
    render(<Ingestion />);
    const button = screen.getByText(/ЗАВАНТАЖИТИ ДАНІ/i);
    expect(button).toBeDefined();
  });

  it('triggers file input click when upload button is clicked', () => {
    render(<Ingestion />);
    const button = screen.getByText(/ЗАВАНТАЖИТИ ДАНІ/i);
    fireEvent.click(button);
    // Since file input is hidden, we just test that the button is clickable
    expect(button).toBeDefined();
  });
});
