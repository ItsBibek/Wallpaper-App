// Replace 'YOUR_UNSPLASH_ACCESS_KEY' with your actual Unsplash access key
const UNSPLASH_ACCESS_KEY = 'iiyvFVEJFaZd5bagom9oiG6llSF0ulFdGw6pU2HocD4';

export const fetchWallpapers = async (count: number = 10) => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?count=${count}&query=wallpaper&orientation=portrait`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching wallpapers:', error);
    throw error;
  }
};

export const searchWallpapers = async (query: string, perPage: number = 15, page: number = 1) => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=portrait`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.results; // Unsplash returns search results in the 'results' array
  } catch (error) {
    console.error('Error searching wallpapers:', error);
    throw error;
  }
};
