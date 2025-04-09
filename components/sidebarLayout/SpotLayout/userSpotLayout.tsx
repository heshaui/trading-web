import React from 'react';
import SpotLayoutWrapper from './Layout';
export function withSpotLayout<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function withSpotLayout(props: P) {
    return (
      <SpotLayoutWrapper>
        <WrappedComponent {...props}  />
      </SpotLayoutWrapper>
    );
  };
}