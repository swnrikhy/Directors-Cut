
export interface StyleRef {
  name: string;
  description: string;
  image: string;
}

export const ART_STYLE_REFS: StyleRef[] = [
  { name: 'Cinematic', description: 'High-quality movie look with professional lighting and composition.', image: 'https://loremflickr.com/400/225/cinematic,movie' },
  { name: 'Anime', description: 'Japanese animation style with vibrant colors and expressive characters.', image: 'https://loremflickr.com/400/225/anime,illustration' },
  { name: 'Watercolor', description: 'Soft, fluid textures with delicate color washes.', image: 'https://loremflickr.com/400/225/watercolor,painting' },
  { name: 'Cyberpunk', description: 'Futuristic, high-tech look with neon lights and dark urban settings.', image: 'https://loremflickr.com/400/225/cyberpunk,neon' },
  { name: 'Oil Painting', description: 'Rich textures and visible brushstrokes of traditional oil on canvas.', image: 'https://loremflickr.com/400/225/oilpainting,canvas' },
  { name: 'Realistic', description: 'Lifelike detail and natural textures.', image: 'https://loremflickr.com/400/225/photography,realistic' },
  { name: 'Fantasy Art', description: 'Magical and mythical themes with epic scale.', image: 'https://loremflickr.com/400/225/fantasy,dragon' },
  { name: 'Sci-Fi', description: 'Advanced technology and futuristic environments.', image: 'https://loremflickr.com/400/225/scifi,spaceship' },
  { name: 'Synthwave 80s', description: 'Retro-futuristic aesthetic with neon pink, purple, and blue.', image: 'https://loremflickr.com/400/225/synthwave,80s' },
  { name: 'Pixel Art', description: 'Classic 8-bit or 16-bit video game aesthetic.', image: 'https://loremflickr.com/400/225/pixelart,game' },
  { name: 'Claymation', description: 'Hand-crafted stop-motion look using clay figures.', image: 'https://loremflickr.com/400/225/claymation,stopmotion' },
  { name: 'Ukiyo-e', description: 'Traditional Japanese woodblock print style.', image: 'https://loremflickr.com/400/225/ukiyoe,japanese' },
  { name: 'Double Exposure', description: 'Two images layered together for a surreal effect.', image: 'https://loremflickr.com/400/225/doubleexposure,surreal' },
  { name: 'Glitch Art', description: 'Digital distortions and chromatic aberration.', image: 'https://loremflickr.com/400/225/glitch,digital' },
  { name: 'Blueprint', description: 'Technical architectural or engineering drawing style.', image: 'https://loremflickr.com/400/225/blueprint,architecture' },
  { name: 'Pop Art', description: 'Bold colors and comic-book inspired graphics.', image: 'https://loremflickr.com/400/225/popart,comic' },
  { name: 'Surrealism', description: 'Dream-like, illogical, and fantastical imagery.', image: 'https://loremflickr.com/400/225/surrealism,dream' },
  { name: 'Minimalist Vector', description: 'Clean lines and flat colors with simple shapes.', image: 'https://loremflickr.com/400/225/minimalist,vector' },
];

export const LIGHTING_STYLE_REFS: StyleRef[] = [
  { name: 'Natural Light', description: 'Soft, even lighting from the sun or moon.', image: 'https://loremflickr.com/400/225/sunlight,nature' },
  { name: 'Dramatic Lighting', description: 'High contrast with deep shadows and bright highlights.', image: 'https://loremflickr.com/400/225/dramatic,lighting' },
  { name: 'Soft Lighting', description: 'Gentle, diffused light that minimizes shadows.', image: 'https://loremflickr.com/400/225/soft,lighting' },
  { name: 'Neon Glow', description: 'Vibrant, artificial light from neon tubes.', image: 'https://loremflickr.com/400/225/neon,glow' },
  { name: 'Volumetric Lighting', description: 'Visible beams of light through fog or dust.', image: 'https://loremflickr.com/400/225/volumetric,light' },
  { name: 'Backlight', description: 'Light coming from behind the subject, creating a rim effect.', image: 'https://loremflickr.com/400/225/backlight,silhouette' },
  { name: 'Golden Hour', description: 'Warm, low-angle light just before sunset or after sunrise.', image: 'https://loremflickr.com/400/225/sunset,goldenhour' },
  { name: 'Bioluminescent', description: 'Ethereal light emitted by living organisms.', image: 'https://loremflickr.com/400/225/bioluminescent,forest' },
  { name: 'Cinematic Noir', description: 'Moody, high-contrast shadows typical of classic detective films.', image: 'https://loremflickr.com/400/225/noir,shadow' },
  { name: 'Prismatic', description: 'Rainbow-like light refraction through glass or water.', image: 'https://loremflickr.com/400/225/prism,rainbow' },
  { name: 'Candlelight', description: 'Warm, flickering light from a single point source.', image: 'https://loremflickr.com/400/225/candle,flame' },
  { name: 'Strobe Flash', description: 'Intense, brief bursts of light for high-energy scenes.', image: 'https://loremflickr.com/400/225/strobe,flash' },
];

export const COLOR_PALETTE_REFS: StyleRef[] = [
  { name: 'Vibrant Colors', description: 'Highly saturated and energetic color schemes.', image: 'https://loremflickr.com/400/225/vibrant,colors' },
  { name: 'Muted Tones', description: 'Desaturated, subtle, and sophisticated colors.', image: 'https://loremflickr.com/400/225/muted,tones' },
  { name: 'Monochromatic', description: 'Variations of a single color or hue.', image: 'https://loremflickr.com/400/225/monochrome,blackandwhite' },
  { name: 'Pastel Colors', description: 'Soft, light, and airy color palette.', image: 'https://loremflickr.com/400/225/pastel,colors' },
  { name: 'Warm Tones', description: 'Reds, oranges, and yellows for a cozy feel.', image: 'https://loremflickr.com/400/225/warm,colors' },
  { name: 'Cool Tones', description: 'Blues, greens, and purples for a calm feel.', image: 'https://loremflickr.com/400/225/cool,colors' },
  { name: 'Cyber-Neon', description: 'Cyan, magenta, and electric purple combinations.', image: 'https://loremflickr.com/400/225/cyberpunk,colors' },
  { name: 'Earth Tones', description: 'Natural browns, greens, and tans.', image: 'https://loremflickr.com/400/225/earth,tones' },
  { name: 'Vintage Film', description: 'Faded colors with a slight sepia or grain effect.', image: 'https://loremflickr.com/400/225/vintage,film' },
  { name: 'Acid Green & Charcoal', description: 'Sharp, high-contrast modern aesthetic.', image: 'https://loremflickr.com/400/225/acid,green' },
  { name: 'Royal Gold & Deep Blue', description: 'Elegant and luxurious color combination.', image: 'https://loremflickr.com/400/225/gold,blue' },
];
