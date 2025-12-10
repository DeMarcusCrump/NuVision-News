// Vibrant background colors for article cards (The Pudding style)
export const cardColors = [
  "bg-[#FFD93D]", // Bright yellow
  "bg-[#6BCB77]", // Green
  "bg-[#4D96FF]", // Blue
  "bg-[#FF6B9D]", // Pink
  "bg-[#C780FA]", // Purple
  "bg-[#FFA351]", // Orange
  "bg-[#67E9F1]", // Cyan
  "bg-[#FFE66D]", // Light yellow
];

export const getCardColor = (index: number): string => {
  return cardColors[index % cardColors.length];
};
