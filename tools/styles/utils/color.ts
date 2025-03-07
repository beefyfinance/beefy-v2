const validHexLengths = [
  4, // #rgb
  5, // #rgba
  7, // #rrggbb
  9, // #rrggbbaa
];

function isHexColor(color: string): boolean {
  return validHexLengths.includes(color.length) && /^#[0-9A-F]+$/i.test(color);
}

export function setColorOpacity(inputColor: string, opacity: number) {
  const color = inputColor.toLowerCase();
  if (!isHexColor(color)) {
    throw new Error(`Only hex colors are supported: ${inputColor}`);
  }
  if (opacity < 0 || opacity > 1) {
    throw new Error('Opacity must be a number between 0 and 1');
  }

  const opacityHex = Math.max(0, Math.min(Math.round(opacity * 255), 255))
    .toString(16)
    .padStart(2, '0');

  if (color.length === 4 || color.length === 5) {
    const solid = color.slice(0, 4);
    if (opacityHex[0] === opacityHex[1]) {
      return solid + opacityHex[0];
    }
    return '#' + solid[1].repeat(2) + solid[2].repeat(2) + solid[3].repeat(2) + opacityHex;
  }

  return color.slice(0, 7) + opacityHex;
}
