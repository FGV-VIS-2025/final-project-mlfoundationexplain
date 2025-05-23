function hashtagToColor(hashtag) {
  let hashSum = 0;
  for (let i = 0; i < hashtag.length; i++) {
    hashSum += hashtag.charCodeAt(i);
  }
  const hue = hashSum % 360;
  const saturation = 60 + (hashSum % 40);
  const lightness = 35 + (hashSum % 30);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}