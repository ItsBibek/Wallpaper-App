import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, SafeAreaView, Alert, Platform, Linking, Share, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useFavorites } from '../contexts/FavoritesContext';
import * as MediaLibrary from 'expo-media-library';

interface WallpaperModalProps {
  isVisible: boolean;
  onClose: () => void;
  wallpaper: any; // Replace 'any' with your wallpaper type
}

const WallpaperModal: React.FC<WallpaperModalProps> = ({ isVisible, onClose, wallpaper }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isVisible) {
        onClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isVisible, onClose]);

  if (!wallpaper) return null;

  const isWallpaperFavorite = isFavorite(wallpaper.id);

  const handleFavoritePress = () => {
    if (isWallpaperFavorite) {
      removeFavorite(wallpaper.id);
    } else {
      addFavorite(wallpaper);
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this awesome wallpaper!`,
        url: wallpaper.urls.full,
        title: wallpaper.description || 'Awesome Wallpaper',
      });

      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  const downloadWallpaper = async () => {
    try {
      // Use the regular (lower resolution) URL for faster download
      const imageUrl = wallpaper.urls.regular;
      const fileUri = FileSystem.documentDirectory + `wallpaper_${Date.now()}.jpg`;

      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

      if (downloadResult.status !== 200) {
        throw new Error('Download failed');
      }

      if (Platform.OS === 'android') {
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission.status !== 'granted') {
          // Permission denied, offer to share instead
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
          }
          return;
        }
        await MediaLibrary.saveToLibraryAsync(fileUri);
      } else {
        // For iOS, use sharing
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        }
      }

      await FileSystem.deleteAsync(fileUri);
      Alert.alert('Success', 'Wallpaper saved successfully!');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to save wallpaper. Please try again.');
    }
  };

  const truncateDescription = (description: string, maxLines: number = 2) => {
    const words = description.split(' ');
    let result = '';
    let lines = 1;

    for (const word of words) {
      if ((result + word).length > 30 * maxLines) {
        if (lines >= maxLines) {
          return result.trim() + '...';
        }
        result += '\n';
        lines++;
      }
      result += word + ' ';
    }

    return result.trim();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={[styles.controlButton, styles.closeButton]} onPress={onClose}>
            <View style={styles.buttonOverlay}>
              <Ionicons name="close" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, styles.likeButton]} onPress={handleFavoritePress}>
            <View style={styles.buttonOverlay}>
              <Ionicons name={isWallpaperFavorite ? "heart" : "heart-outline"} size={24} color={isWallpaperFavorite ? "#ff0000" : "#fff"} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, styles.shareButton]} onPress={handleShare}>
            <View style={styles.buttonOverlay}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
          {wallpaper.urls && wallpaper.urls.regular && (
            <Image source={{ uri: wallpaper.urls.regular }} style={styles.wallpaperImage} />
          )}
          <View style={styles.infoContainer}>
            <Text style={styles.wallpaperTitle} numberOfLines={1} ellipsizeMode="tail">
              {truncateDescription(wallpaper.description || 'Untitled Wallpaper')}
            </Text>
            <TouchableOpacity style={styles.downloadButton} onPress={downloadWallpaper}>
              <Text style={styles.downloadButtonText}>Get Wallpaper</Text>
            </TouchableOpacity>
            <View style={styles.photographerContainer}>
              <Image 
                source={{ uri: wallpaper.user?.profile_image?.small || 'https://via.placeholder.com/40' }} 
                style={styles.photographerImage} 
              />
              <View>
                <Text style={styles.photographerName}>{wallpaper.user?.name || 'Unknown Photographer'}</Text>
                <Text style={styles.photographerUsername}>@{wallpaper.user?.username || 'unknown'}</Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    flex: 1,
  },
  controlButton: {
    position: 'absolute',
    top: 40,
    zIndex: 1,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    left: 20,
  },
  likeButton: {
    right: 70,
  },
  shareButton: {
    right: 20,
  },
  buttonOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wallpaperImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#000',
  },
  wallpaperTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    lineHeight: 28,
  },
  downloadButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  photographerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  photographerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  photographerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  photographerUsername: {
    fontSize: 14,
    color: '#ccc',
  },
});

export default WallpaperModal;
