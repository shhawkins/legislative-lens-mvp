import axios from 'axios';

export const getMemberPhoto = async (bioguideId: string): Promise<string> => {
  try {
    // First try to get the image from our local assets
    try {
      const localImage = await import(`../assets/member-photos/${bioguideId}.jpg`);
      return localImage.default;
    } catch (e) {
      // If local image doesn't exist, use a default image
      return '/default-member-photo.jpg';
    }
  } catch (error) {
    console.error('Error loading member photo:', error);
    return '/default-member-photo.jpg';
  }
}; 