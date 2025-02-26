import React from 'react';
import UserCenterLayoutWrapper from './Layout';

export function withUserCenterLayout<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithUserCenterLayout(props: P) {
    return (
      <UserCenterLayoutWrapper>
        <WrappedComponent {...props} />
      </UserCenterLayoutWrapper>
    );
  };
}