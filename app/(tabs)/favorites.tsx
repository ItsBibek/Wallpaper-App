import React from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Dimensions, SafeAreaView, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../contexts/FavoritesContext';
import WallpaperModal from '../../components/WallpaperModal';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const Favorites = () => {
  const { favorites, removeFavorite } = useFavorites();
  const [selectedWallpaper, setSelectedWallpaper] = React.useState(null);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const { theme } = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.wallpaperItem}
      onPress={() => {
        setSelectedWallpaper(item);
        setIsModalVisible(true);
      }}
    >
      <Image source={{ uri: item.urls.regular }} style={styles.wallpaperImage} />
      <View style={[styles.wallpaperOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]}>
        <Text style={styles.wallpaperName}>{item.user ? item.user.name : 'Unknown'}</Text>
        <TouchableOpacity style={styles.heartButton} onPress={() => removeFavorite(item.id)}>
          <Ionicons name="heart" size={20} color="#ff0000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedWallpaper(null);
  };

  const handleDownload = () => {
    if (selectedWallpaper && selectedWallpaper.id) {
      console.log('Downloading wallpaper:', selectedWallpaper.id);
      // Implement download functionality here
    } else {
      console.error('No wallpaper selected for download');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <Text style={[styles.headerText, { color: isDark ? '#fff' : '#000' }]}>
        Favorites
      </Text>
      {favorites.length === 0 ? (
        <Text style={[styles.emptyText, { color: isDark ? '#aaa' : '#888' }]}>No favorites yet</Text>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.wallpaperGrid}
        />
      )}
      {selectedWallpaper && (
        <WallpaperModal
          isVisible={isModalVisible}
          onClose={handleCloseModal}
          wallpaper={selectedWallpaper}
          onDownload={handleDownload}
          isDark={isDark}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  wallpaperGrid: {
    padding: 5,
  },
  wallpaperItem: {
    width: width / 2 - 10,
    aspectRatio: 1,
    margin: 5,
  },
  wallpaperImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  wallpaperOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 4,
    padding: 5,
  },
  wallpaperName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  heartButton: {
    padding: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
  },
});

export default Favorites;
