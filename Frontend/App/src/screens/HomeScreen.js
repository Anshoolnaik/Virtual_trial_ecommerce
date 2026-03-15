import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';

import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import BottomTabBar from '../components/common/BottomTabBar';
import HeroBanner from '../components/home/HeroBanner';
import CategoryPills from '../components/home/CategoryPills';
import SectionHeader from '../components/home/SectionHeader';
import ProductCard from '../components/home/ProductCard';
import FlashSaleBanner from '../components/home/FlashSaleBanner';
import ProfileScreen from './ProfileScreen';
import AddressesScreen from './AddressesScreen';
import AddressFormScreen from './AddressFormScreen';
import ProductDetailScreen from './ProductDetailScreen';

import Colors from '../constants/colors';
import Theme from '../constants/theme';
import { banners, categories, newArrivals, trending, flashSaleProducts } from '../data/mockData';

const HomeScreen = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Sub-screen stack for profile section: null | 'addresses' | 'address-form'
  const [subScreen, setSubScreen] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null); // address being edited

  const openAddresses = () => { setSubScreen('addresses'); setEditingAddress(null); };
  const openAddressForm = (address = null) => { setEditingAddress(address); setSubScreen('address-form'); };
  const goBackToAddresses = () => { setSubScreen('addresses'); setEditingAddress(null); };
  const closeSubScreen = () => { setSubScreen(null); setEditingAddress(null); };

  // When switching away from profile tab, reset sub-screens
  const handleTabPress = (tab) => {
    if (tab !== 'profile') closeSubScreen();
    setActiveTab(tab);
  };

  // Product detail — full-screen, no header/tab bar
  if (selectedProduct) {
    return (
      <ProductDetailScreen
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Fixed Header */}
      <Header cartCount={2} notificationCount={3} onNavigate={onNavigate} />

      {/* Scrollable Content */}
      {activeTab === 'profile' && subScreen === 'addresses' ? (
        <AddressesScreen
          onBack={closeSubScreen}
          onAddNew={() => openAddressForm(null)}
          onEdit={(address) => openAddressForm(address)}
        />
      ) : activeTab === 'profile' && subScreen === 'address-form' ? (
        <AddressFormScreen
          existingAddress={editingAddress}
          onBack={goBackToAddresses}
          onSaved={goBackToAddresses}
        />
      ) : activeTab === 'profile' ? (
        <ProfileScreen onNavigate={onNavigate} onOpenAddresses={openAddresses} />
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces
        >
          {/* Search */}
          <SearchBar />

          {/* Greeting */}
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Good morning, Alex 👋</Text>
            <Text style={styles.greetingSubtext}>What are you looking for today?</Text>
          </View>

          {/* Hero Banners */}
          <HeroBanner banners={banners} />

          {/* Categories */}
          <CategoryPills categories={categories} />

          {/* New Arrivals — 2-column grid */}
          <SectionHeader
            title="New Arrivals"
            subtitle="Fresh styles just landed"
            onSeeAll={() => {}}
          />
          <ProductGrid products={newArrivals} onProductPress={setSelectedProduct} />

          {/* Flash Sale */}
          <SectionHeader
            title="Flash Sale"
            subtitle="Up to 60% off select items"
          />
          <FlashSaleBanner products={flashSaleProducts} />

          {/* Trending — horizontal scroll */}
          <SectionHeader
            title="Trending Now"
            subtitle="What everyone is wearing"
            onSeeAll={() => {}}
          />
          <FlatList
            data={trending}
            renderItem={({ item }) => (
              <ProductCard product={item} style={styles.trendingCard} onPress={() => setSelectedProduct(item)} />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingList}
          />

          {/* Virtual Try-On CTA */}
          <TryOnCTA />

          {/* Bottom padding for tab bar */}
          <View style={styles.bottomPad} />
        </ScrollView>
      )}

      {/* Fixed Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

// ─── Product Grid (2 columns) ────────────────────────────────────────────────
const ProductGrid = ({ products, onProductPress }) => {
  const rows = [];
  for (let i = 0; i < products.length; i += 2) {
    rows.push(products.slice(i, i + 2));
  }
  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.gridRow}>
          {row.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              style={styles.gridCard}
              onPress={() => onProductPress(product)}
            />
          ))}
          {row.length === 1 && <View style={styles.gridCard} />}
        </View>
      ))}
    </View>
  );
};

// ─── Virtual Try-On CTA ──────────────────────────────────────────────────────
const TryOnCTA = () => (
  <View style={styles.tryOnCTA}>
    <View style={styles.tryOnContent}>
      <Text style={styles.tryOnEmoji}>✨</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.tryOnTitle}>Virtual Try-On</Text>
        <Text style={styles.tryOnDesc}>
          See how clothes look on you before you buy. Powered by AI.
        </Text>
      </View>
    </View>
    <View style={styles.tryOnBtnRow}>
      <View style={styles.tryOnBtn}>
        <Text style={styles.tryOnBtnText}>Try It Now  →</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  greeting: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xs,
    backgroundColor: Colors.white,
  },
  greetingText: {
    fontSize: Theme.fontSize['2xl'],
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  greetingSubtext: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '400',
  },

  // Product Grid
  grid: {
    paddingHorizontal: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  gridCard: {
    flex: 1,
  },

  // Trending horizontal
  trendingList: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.sm,
    gap: Theme.spacing.md,
  },
  trendingCard: {
    width: 160,
  },

  // Virtual Try-On CTA
  tryOnCTA: {
    marginHorizontal: Theme.spacing.lg,
    marginTop: Theme.spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xl,
    ...Theme.shadow.md,
  },
  tryOnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  tryOnEmoji: {
    fontSize: 40,
  },
  tryOnTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  tryOnDesc: {
    fontSize: Theme.fontSize.sm,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 18,
  },
  tryOnBtnRow: {
    alignItems: 'flex-start',
  },
  tryOnBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.radius.full,
  },
  tryOnBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: Theme.fontSize.md,
    letterSpacing: 0.3,
  },

  bottomPad: {
    height: Theme.spacing['3xl'],
  },
});

export default HomeScreen;
