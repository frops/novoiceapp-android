import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ErrorBoundary } from './ErrorBoundary';
import type { ErrorBoundaryProps } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  const Thrower = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Boom');
    }

    return <Text>Safe</Text>;
  };

  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Content</Text>
      </ErrorBoundary>
    );

    expect(getByText('Content')).toBeTruthy();
  });

  it('shows fallback UI when an error is thrown', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Thrower shouldThrow />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Boom')).toBeTruthy();
  });

  it('notifies listeners through onError', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <Thrower shouldThrow />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    const [errorArg, infoArg] = onError.mock.calls[0];
    expect(errorArg).toBeInstanceOf(Error);
    expect(infoArg).toHaveProperty('componentStack');
  });

  const renderHarness = (boundaryProps?: Partial<ErrorBoundaryProps>) => {
    const Harness = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);

      return (
        <ErrorBoundary
          {...boundaryProps}
          onRetry={() => {
            boundaryProps?.onRetry?.();
            setShouldThrow(false);
          }}
          onReset={() => {
            boundaryProps?.onReset?.();
            setShouldThrow(false);
          }}
        >
          <Thrower shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );
    };

    return render(<Harness />);
  };

  it('recovers rendering when retry is pressed', async () => {
    const onRetry = jest.fn();
    const { getByText, queryByText } = renderHarness({ onRetry });

    fireEvent.press(getByText('Try again'));

    await waitFor(() => expect(queryByText('Safe')).not.toBeNull());
    expect(onRetry).toHaveBeenCalled();
  });

  it('invokes reset callback when reset is pressed', async () => {
    const onReset = jest.fn();
    const { getByText, queryByText } = renderHarness({ onReset });

    fireEvent.press(getByText('Reset app'));

    await waitFor(() => expect(queryByText('Safe')).not.toBeNull());
    expect(onReset).toHaveBeenCalled();
  });
});
