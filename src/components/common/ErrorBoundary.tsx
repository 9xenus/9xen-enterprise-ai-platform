import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorPage } from './ErrorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    (this as any).setState({
      error,
      errorInfo
    });
    console.error('[CRITICAL-UI-ERROR]', error, errorInfo);
    try {
      fetch('/api/diagnostics/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.toString(),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(err => console.error('Failed to report diagnostic error:', err));
    } catch (e) {
      console.error('Failed to send error diagnostic', e);
    }
  }

  private handleReset = () => {
    (this as any).setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorPage 
          error={this.state.error}
          errorInfo={this.state.errorInfo?.componentStack}
          resetErrorBoundary={this.handleReset}
          message="An unexpected client-side rendering exception has occurred. 9xenai's core process failed to paint this component. Standard fail-safe recovery mode is now active."
          statusCode="500_CLIENT_CRASH"
        />
      );
    }

    return (this as any).props.children;
  }
}
