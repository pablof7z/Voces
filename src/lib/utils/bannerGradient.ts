/**
 * Generate a deterministic HSL gradient from a pubkey
 * Uses the first characters of the pubkey to create consistent, visually pleasing colors
 */
export function generateBannerGradient(pubkey: string): string {
  if (!pubkey || pubkey.length < 8) {
    // Fallback gradient if pubkey is invalid
    return 'linear-gradient(135deg, hsl(220, 70%, 50%), hsl(280, 70%, 50%))';
  }

  // Use first 8 characters to generate two hue values
  const hex1 = pubkey.slice(0, 4);
  const hex2 = pubkey.slice(4, 8);

  // Convert hex to decimal and map to hue range (0-360)
  const hue1 = parseInt(hex1, 16) % 360;
  const hue2 = parseInt(hex2, 16) % 360;

  // Use consistent saturation and lightness for visual appeal
  // Higher saturation (60-80%) and medium lightness (45-55%) work well
  const sat1 = 60 + (parseInt(pubkey.slice(8, 10) || '00', 16) % 20);
  const sat2 = 60 + (parseInt(pubkey.slice(10, 12) || '00', 16) % 20);
  const light1 = 45 + (parseInt(pubkey.slice(12, 14) || '00', 16) % 10);
  const light2 = 45 + (parseInt(pubkey.slice(14, 16) || '00', 16) % 10);

  return `linear-gradient(135deg, hsl(${hue1}, ${sat1}%, ${light1}%), hsl(${hue2}, ${sat2}%, ${light2}%))`;
}
