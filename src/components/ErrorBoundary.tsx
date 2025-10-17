import React, { ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

export type ErrorBoundaryFallbackProps = {
  error: Error;
  resetError: () => void;
  retry: () => void;
};

export type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackRender?: (props: ErrorBoundaryFallbackProps) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  onReset?: () => void;
  onRetry?: () => void;
  resetKeys?: Array<unknown>;
};

type ErrorBoundaryState = {
  error: Error | null;
};

const areResetKeysChanged = (
  prevKeys?: Array<unknown>,
  nextKeys?: Array<unknown>
): boolean => {
  if (prevKeys === nextKeys) {
    return false;
  }

  if (!prevKeys && !nextKeys) {
    return false;
  }

  if (!prevKeys || !nextKeys) {
    return true;
  }

  if (prevKeys.length !== nextKeys.length) {
    return true;
  }

  for (let index = 0; index < prevKeys.length; index += 1) {
    if (!Object.is(prevKeys[index], nextKeys[index])) {
      return true;
    }
  }

  return false;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.state.error &&
      areResetKeysChanged(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.reset();
    }
  }

  private reset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }

    this.setState({ error: null });
  };

  private retry = () => {
    if (this.props.onRetry) {
      this.props.onRetry();
    }

    this.setState({ error: null });
  };

  render() {
    const { children, fallback, fallbackRender } = this.props;
    const { error } = this.state;

    if (error) {
      const fallbackProps: ErrorBoundaryFallbackProps = {
        error,
        resetError: this.reset,
        retry: this.retry,
      };

      if (fallbackRender) {
        return fallbackRender(fallbackProps);
      }

      if (fallback) {
        return fallback;
      }

      return <DefaultFallback {...fallbackProps} />;
    }

    return children;
  }
}

const DefaultFallback = ({ error, resetError, retry }: ErrorBoundaryFallbackProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>Something went wrong</Text>
    <Text style={styles.message}>{error.message || 'An unexpected error occurred.'}</Text>
    <View style={styles.actions}>
      <Pressable
        accessibilityRole="button"
        onPress={retry}
        style={[styles.button, styles.buttonSpacing, styles.primaryButton]}
      >
        <Text style={[styles.buttonLabel, styles.primaryButtonLabel]}>Try again</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={resetError}
        style={[styles.button, styles.buttonSpacing]}
      >
        <Text style={styles.buttonLabel}>Reset app</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#101418',
    width: '100%',
    maxWidth: 480,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#d0d7de',
    textAlign: 'center',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  buttonSpacing: {
    marginHorizontal: 6,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButtonLabel: {
    color: '#ffffff',
  },
});

export { ErrorBoundary };
