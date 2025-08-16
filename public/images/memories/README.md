# Memory Palace Photos

This directory should contain the photos that will appear as paintings in the memory castle.

## Required Photos

Add the following photo files to this directory:

- `photo1.jpg` - Summer Adventure photo
- `photo2.jpg` - Birthday Celebration photo
- `photo3.jpg` - Coffee & Dreams photo
- `photo4.jpg` - Concert Night photo
- `photo5.jpg` - Hiking Achievement photo
- `photo6.jpg` - Cozy Movie Night photo

## Photo Requirements

- **Format**: JPG, PNG, or WebP
- **Size**: Recommended 800x600px to 1200x900px for good quality
- **Aspect Ratio**: Photos will be displayed in 4:3 aspect ratio frames
- **File Size**: Keep under 2MB each for good loading performance

## How It Works

1. Add your photos with the correct filenames to this directory
2. The paintings will automatically load these images in the game
3. Players can approach the paintings and press E to view them
4. Each photo has associated memories and descriptions defined in `app/game/data/memoryPhotos.ts`

## Customizing

To customize the photos and memories:

1. Edit `app/game/data/memoryPhotos.ts` to change descriptions, titles, dates, and people
2. Update the `imagePath` field to match your photo filenames
3. Adjust the `paintingPositions` to change where paintings appear on the walls

## Placeholder Images

If you don't have photos ready, you can use placeholder images from services like:

- https://picsum.photos/800/600 (random photos)
- https://via.placeholder.com/800x600 (solid color placeholders)
