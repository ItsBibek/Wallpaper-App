import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Wallpaper {
  id: string;
  urls: {
    regular: string;
  };
  user: {
    name: string;
    username: string;
  };
  description: string;
  addedAt: number;
}

interface FavoritesContextType {
  favorites: Wallpaper[];
  addFavorite: (wallpaper: Wallpaper) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Wallpaper[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (newFavorites) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addFavorite = (wallpaper: Wallpaper) => {
    const wallpaperWithTimestamp = {
      ...wallpaper,
      addedAt: Date.now()
    };
    const newFavorites = [wallpaperWithTimestamp, ...favorites];
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const removeFavorite = (id: string) => {
    const newFavorites = favorites.filter((w) => w.id !== id);
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const isFavorite = (id: string) => {
    return favorites.some((w) => w.id === id);
  };

  const sortedFavorites = favorites.sort((a, b) => b.addedAt - a.addedAt);

  return (
    <FavoritesContext.Provider value={{ favorites: sortedFavorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
