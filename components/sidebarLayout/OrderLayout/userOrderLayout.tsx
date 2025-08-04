import React from 'react';
import OrderLayoutWrapper from './Layout';
export function withOrderLayout<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function withOrderLayout(props: P) {
    return (
      <OrderLayoutWrapper>
        <WrappedComponent {...props}  />
      </OrderLayoutWrapper>
    );
  };
}