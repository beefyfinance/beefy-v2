import ContentLoader from 'react-content-loader';

export const StatLoader = ({
  backgroundColor = '#313759',
  foregroundColor = '#8585A6',
  width = 64,
  height = 16,
}) => {
  return (
    <ContentLoader
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
    >
      <rect x="0" y="0" width={width} height={height} />
    </ContentLoader>
  );
};
