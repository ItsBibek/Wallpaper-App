import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchWallpapers, searchWallpapers } from '../../api';
import WallpaperModal from '../../components/WallpaperModal';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';


const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [wallpapers, setWallpapers] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const [carouselItems, setCarouselItems] = useState([]);
  const carouselScrollViewRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isModalVisible) {
          setIsModalVisible(false);
          return true; // Prevent default behavior
        }
        return false; // Let default behavior happen (exit app)
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [isModalVisible])
  );

  useEffect(() => {
    loadWallpapers();
  }, []);

  useEffect(() => {
    if (wallpapers.length >= 5) {
      const items = wallpapers.slice(0, 5);
      setCarouselItems([items[4], ...items, items[0]]);
    }
  }, [wallpapers]);

  
  const loadWallpapers = async (loadMore = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const newPage = loadMore ? page + 1 : 1;
      console.log(`Fetching wallpapers for page ${newPage}`);
      const newWallpapers = await fetchWallpapers(15, newPage);
      console.log(`Fetched ${newWallpapers.length} new wallpapers`);
      
      setWallpapers((prevWallpapers) => {
        const updatedWallpapers = loadMore 
          ? [...prevWallpapers, ...newWallpapers]
          : newWallpapers;
        console.log(`Total wallpapers after update: ${updatedWallpapers.length}`);
        return updatedWallpapers;
      });
      setPage(newPage);
    } catch (error) {
      console.error('Error loading wallpapers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (isSearching) return;
    setIsSearching(true);
    setHasSearched(true);
    setActiveSearchQuery(query);
    try {
      const results = await searchWallpapers(query, 15, 1);
      setSearchResults(results);
      setSearchPage(2);
      console.log('Search results:', results);
    } catch (error) {
      console.error('Error searching wallpapers:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (text) => {
    setSearchInput(text);
  };

  const handleSearchSubmit = () => {
    handleSearch(searchInput);
  };

  const handleLoadMore = () => {
    console.log('handleLoadMore called');
    loadWallpapers(true);
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  const handleScroll = (event) => {
    if (isCloseToBottom(event.nativeEvent)) {
      console.log('Close to bottom, loading more');
      handleLoadMore();
    }
  };

  const handleCarouselScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCarouselIndex(slideIndex - 1);

    if (slideIndex === 0) {
      carouselScrollViewRef.current?.scrollTo({ x: width * 5, animated: false });
    } else if (slideIndex === 6) {
      carouselScrollViewRef.current?.scrollTo({ x: width, animated: false });
    }
  };

  const handleWallpaperPress = (wallpaper) => {
    if (wallpaper && wallpaper.urls) {
      setSelectedWallpaper(wallpaper);
      setIsModalVisible(true);
    } else {
      console.error('Invalid wallpaper data:', wallpaper);
    }
  };

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

  const renderWallpaperItem = (wallpaper, index) => {
    if (wallpaper && wallpaper.urls && wallpaper.urls.regular) {
      const isWallpaperFavorite = isFavorite(wallpaper.id);
      
      const handleFavoritePress = () => {
        if (isWallpaperFavorite) {
          removeFavorite(wallpaper.id);
        } else {
          addFavorite(wallpaper);
        }
      };
      
      return (
        <TouchableOpacity 
          key={`grid-${wallpaper.id || Date.now()}-${index}`} 
          style={styles.wallpaperItem}
          onPress={() => handleWallpaperPress(wallpaper)}
        >
          <Image
            source={{ uri: wallpaper.urls.regular }}
            style={styles.wallpaperImage}
          />
          <View style={styles.wallpaperOverlay}>
            <Text style={styles.wallpaperName}>{wallpaper.user ? wallpaper.user.name : 'Unknown'}</Text>
            <TouchableOpacity style={styles.heartButton} onPress={handleFavoritePress}>
              <Ionicons 
                name={isWallpaperFavorite ? "heart" : "heart-outline"} 
                size={20} 
                color={isWallpaperFavorite ? "#ff0000" : "#fff"} 
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const handleCarouselItemPress = (wallpaper) => {
    if (wallpaper && wallpaper.urls) {
      setSelectedWallpaper(wallpaper);
      setIsModalVisible(true);
    } else {
      console.error('Invalid wallpaper data:', wallpaper);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]} edges={['left', 'right']}>
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Carousel */}
        <ScrollView
          ref={carouselScrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleCarouselScroll}
          scrollEventThrottle={200}
          contentOffset={{ x: width, y: 0 }}
        >
          {carouselItems.map((wallpaper, index) => (
            <TouchableOpacity
              key={`carousel-${wallpaper.id}-${index}`}
              style={styles.carouselItem}
              onPress={() => handleCarouselItemPress(wallpaper)}
            >
              <Image
                source={{ uri: wallpaper.urls.regular }}
                style={styles.carouselImage}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.carouselDots}>
          {[0, 1, 2, 3, 4].map((index) => (
            <View
              key={`dot-${index}`}
              style={[styles.dot, index === carouselIndex && styles.activeDot]}
            />
          ))}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#888"
            value={searchInput}
            onChangeText={handleSearchInputChange}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>

        {/* Wallpaper Grid */}
        <View style={styles.wallpaperGrid}>
          {wallpapers.map((wallpaper, index) => 
            renderWallpaperItem(wallpaper, index)
          )}
        </View>
      </ScrollView>

      {selectedWallpaper && (
        <WallpaperModal
          isVisible={isModalVisible}
          onClose={handleCloseModal}
          wallpaper={selectedWallpaper}
          onDownload={handleDownload}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    paddingTop: 0, // Remove any top padding
  },
  carouselItem: {
    width,
    height: 300,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  carouselText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    outlineStyle: 'none', // This removes the outline on web
  },
  wallpaperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  wallpaperItem: {
    width: '50%',
    aspectRatio: 1,
    padding: 5,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
    width: '100%',
    padding: 20,
  },
  loadingMore: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 20,
    alignItems: 'center',
  },
});
