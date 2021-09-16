import React from 'react';
import ContentLoader from 'react-content-loader';

const ValueLoader = props => {
  const isDarkTheme = localStorage.getItem('nightMode') === 'true' ? true : false;
  return (
    <ContentLoader
      width={64}
      height={16}
      viewBox="0 0 64 16"
      backgroundColor={isDarkTheme ? '#313759' : '#F9F6F1'}
      foregroundColor={isDarkTheme ? '#8585A6' : '#FFF'}
      {...props}
    >
      <rect x="0" y="0" width="64" height="16" />
    </ContentLoader>
  );
};

export default ValueLoader;
