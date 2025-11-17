import { memo, useMemo } from 'react';
import qrcode from 'qrcode';
import { isDefined } from '../../features/data/utils/array-utils.ts';

export type QRCodeProps = {
  url: string;
  className?: string;
  width?: number;
  height?: number;
};

export const QRCode = memo(function QRCode({ url, ...props }: QRCodeProps) {
  const { path, size } = useMemo(() => {
    const qr = qrcode.create(url, { errorCorrectionLevel: 'Q' });
    const cellSize = 10;
    let sx = 0;
    let sy = 0;
    let px = -1;
    let py = -1;
    const path = Array.from(qr.modules.data, (black, i) => {
      const x = i % qr.modules.size;
      const y = Math.floor(i / qr.modules.size);
      if (!black) {
        return undefined;
      }
      return {
        x,
        y,
      };
    })
      .filter(isDefined)
      .reduce((acc, { x, y }, i, all) => {
        if (x !== px + 1 || y !== py + 1 || i === all.length - 1) {
          const x1 = sx * cellSize;
          const y1 = sy * cellSize;
          const x2 = (px + 1) * cellSize;
          const y2 = (py + 1) * cellSize;
          acc.push(`M${x1} ${y1}h${x2 - x1}v${y2 - y1}h${x1 - x2}Z`);
          sx = x;
          sy = y;
        }
        px = x;
        py = y;
        return acc;
      }, [] as Array<string>)
      .join(' ');
    return { path, size: qr.modules.size * cellSize };
  }, [url]);

  return (
    <svg
      {...props}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x={0} y={0} width={size} height={size} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  );
});
