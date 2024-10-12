import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext'; // Adjust the import path as needed
import { Linking } from 'react-native';

const ThemeOption = ({ label, isSelected, onPress }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.themeOption,
        { backgroundColor: isDark ? '#333' : '#fff', borderColor: isDark ? '#555' : '#e0e0e0' },
        isSelected && { backgroundColor: label === 'Light' ? '#000' : '#fff' }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.themeOptionText,
        { color: isDark ? '#fff' : '#000' },
        isSelected && { color: label === 'Light' ? '#fff' : '#000' }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function AccountScreen() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Bwall</Text>
      <Text style={[styles.subtitle, { color: isDark ? '#aaa' : '#888' }]}>Sign in to save your data</Text>

      <TouchableOpacity style={[styles.signInButton, { borderColor: isDark ? '#555' : '#ddd' }]}>
        <Ionicons name="logo-google" size={24} color={isDark ? '#fff' : '#000'} />
        <Text style={[styles.signInButtonText, { color: isDark ? '#fff' : '#000' }]}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.signInButton, { borderColor: isDark ? '#555' : '#ddd' }]}>
        <Ionicons name="logo-google" size={24} color={isDark ? '#fff' : '#000'} />
        <Text style={[styles.signInButtonText, { color: isDark ? '#fff' : '#000' }]}>Sign In</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Settings</Text>
      
      <Text style={[styles.settingLabel, { color: isDark ? '#fff' : '#000' }]}>Theme</Text>
      <View style={styles.themeOptions}>
        <ThemeOption
          label="Light"
          isSelected={theme === 'light'}
          onPress={() => toggleTheme()}
        />
        <ThemeOption
          label="Dark"
          isSelected={theme === 'dark'}
          onPress={() => toggleTheme()}
        />
      </View>

      <View style={styles.footerContainer}>
        <TouchableOpacity onPress={() => Linking.openURL('https://github.com/ItsBibek')}>
          <Ionicons name="logo-github" size={32} color={isDark ? '#aaa' : '#888'} style={styles.githubIcon} />
        </TouchableOpacity>
        <Text style={[styles.footer, { color: isDark ? '#aaa' : '#888' }]}>Bibek Thapa © 2024</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  signInButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 10,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  githubIcon: {
    marginBottom: 8,
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
  },
});
