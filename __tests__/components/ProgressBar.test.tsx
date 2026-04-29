import React from 'react';
import { render } from '@testing-library/react-native';
import ProgressBar from '../../src/components/ProgressBar';

describe('ProgressBar', () => {
  it('renders without crashing with default props', () => {
    expect(() => render(<ProgressBar progress={0.5} />)).not.toThrow();
  });

  it('renders an empty bar for progress=0', () => {
    const { UNSAFE_getAllByType } = render(<ProgressBar progress={0} />);
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    // The inner bar view has width: '0%'
    const barView = views.find(
      (v: any) => v.props.style && JSON.stringify(v.props.style).includes('"0%"'),
    );
    expect(barView).toBeDefined();
  });

  it('renders a full bar for progress=1', () => {
    const { UNSAFE_getAllByType } = render(<ProgressBar progress={1} />);
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    const barView = views.find(
      (v: any) => v.props.style && JSON.stringify(v.props.style).includes('"100%"'),
    );
    expect(barView).toBeDefined();
  });

  it('clamps progress below 0 to 0%', () => {
    const { UNSAFE_getAllByType } = render(<ProgressBar progress={-0.5} />);
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    const barView = views.find(
      (v: any) => v.props.style && JSON.stringify(v.props.style).includes('"0%"'),
    );
    expect(barView).toBeDefined();
  });

  it('clamps progress above 1 to 100%', () => {
    const { UNSAFE_getAllByType } = render(<ProgressBar progress={1.5} />);
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    const barView = views.find(
      (v: any) => v.props.style && JSON.stringify(v.props.style).includes('"100%"'),
    );
    expect(barView).toBeDefined();
  });

  it('accepts size="sm" without error', () => {
    expect(() => render(<ProgressBar progress={0.5} size="sm" />)).not.toThrow();
  });

  it('accepts size="md" without error', () => {
    expect(() => render(<ProgressBar progress={0.5} size="md" />)).not.toThrow();
  });

  it('accepts size="lg" without error', () => {
    expect(() => render(<ProgressBar progress={0.5} size="lg" />)).not.toThrow();
  });

  it('accepts variant="brand" without error', () => {
    expect(() => render(<ProgressBar progress={0.5} variant="brand" />)).not.toThrow();
  });

  it('accepts variant="success" without error', () => {
    expect(() => render(<ProgressBar progress={0.5} variant="success" />)).not.toThrow();
  });

  it('accepts variant="default" without error', () => {
    expect(() => render(<ProgressBar progress={0.5} variant="default" />)).not.toThrow();
  });
});
