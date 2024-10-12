import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FavoritesProvider } from '../../contexts/FavoritesContext';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

export default function TabLayout() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <TabLayoutContent />
      </FavoritesProvider>
    </ThemeProvider>
  );
}

function TabLayoutContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { backgroundColor: isDark ? '#121212' : '#fff' }],
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'For You',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

function CustomTabBar({ state, descriptors, navigation }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.bottomNav, { backgroundColor: isDark ? '#121212' : '#fff', borderTopColor: isDark ? '#333' : '#e0e0e0' }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.navItem}
          >
            {options.tabBarIcon({ color: isFocused ? (isDark ? '#fff' : '#000') : (isDark ? '#888' : '#888') })}
            <Text style={[styles.navText, { color: isFocused ? (isDark ? '#fff' : '#000') : (isDark ? '#888' : '#888') }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    display: 'none',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
});
