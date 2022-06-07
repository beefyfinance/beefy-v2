import React from 'react';
import ContentLoader from 'react-content-loader';

export const StatLoader = ({ backgroundColor = '#313759', foregroundColor = '#8585A6' }) => {
  return (
    <ContentLoader
      width={64}
      height={16}
      viewBox="0 0 64 16"
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
    >
      <rect x="0" y="0" width="64" height="16" />
    </ContentLoader>
  );
};
