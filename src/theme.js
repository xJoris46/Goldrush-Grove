// Shared visual language for Goldrush Grove — a gold-rush frontier town.
// One place to keep colors/fonts consistent across screens instead of
// repeating hex codes everywhere.

export const color = {
  paper: "#FBF3E1",
  paperDeep: "#F3E5C4",
  parchment: "#FFFDF7",
  ink: "#3A2E1F",
  inkSoft: "#6B5B45",
  hairline: "#D9C69A",
  gold: "#C9902E",
  goldLight: "#E7B23C",
  brick: "#A6484A",
  pine: "#3F6B4A",
  slate: "#2E6E8E",
};

export const font = {
  // Wood-cut, saloon-sign display face — used sparingly, for the
  // wordmark and section titles only.
  display: "'Rye', 'Georgia', serif",
  // Readable serif for numbers, descriptions, body text.
  body: "'Source Serif 4', 'Georgia', 'Iowan Old Style', serif",
};

export const bgWash =
  "radial-gradient(circle at 15% 0%, #FEF8E9 0%, transparent 45%), linear-gradient(180deg, #FBF3E1 0%, #F1E1BB 100%)";

// A card with a pressed-wood-block shadow instead of a soft blurred one —
// reads as a physical tile, not a generic SaaS card.
export function blockShadow(depth = 5) {
  return `0 ${depth}px 0 rgba(58,46,31,0.28)`;
}

export const cardStyle = {
  background: color.parchment,
  border: `1px solid ${color.hairline}`,
  borderRadius: 12,
  boxShadow: blockShadow(3),
};
