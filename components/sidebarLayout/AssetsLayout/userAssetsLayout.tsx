import React from 'react';
import AssetsLayoutWrapper from './Layout';
export function withAssetsLayout<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function withAssetsLayout(props: P) {
    return (
      <AssetsLayoutWrapper>
        <WrappedComponent {...props}  />
      </AssetsLayoutWrapper>
    );
  };
}