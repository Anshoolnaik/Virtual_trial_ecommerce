import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
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
import CartScreen from './CartScreen';
import WishlistScreen from './WishlistScreen';
import CheckoutScreen from './CheckoutScreen';
import OrdersScreen from './OrdersScreen';
import ProductListScreen from './ProductListScreen';
import NotificationScreen from './NotificationScreen';

import Colors from '../constants/colors';
import Theme from '../constants/theme';
import { banners, categories } from '../data/mockData';
import { productAPI, flashSaleAPI } from '../services/api';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const HomeScreen = ({ onNavigate }) => {
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'User';
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // API data
  const [newArrivals,  setNewArrivals]  = useState([]);
  const [trending,     setTrending]     = useState([]);
  const [flashSales,   setFlashSales]   = useState([]);
  const [apiLoading,   setApiLoading]   = useState(true);

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredNewArrivals = selectedCategory === 'All'
    ? newArrivals
    : newArrivals.filter((p) => p.category === selectedCategory);

  const filteredTrending = selectedCategory === 'All'
    ? trending
    : trending.filter((p) => p.category === selectedCategory);

  // productId → salePrice for quick lookup
  const flashSaleMap = useMemo(() =>
    Object.fromEntries(flashSales.map((fs) => [fs.productId, fs.salePrice])),
    [flashSales]
  );

  // Apply flash sale price to a product before opening detail screen
  const withFlashSale = (product) => {
    const salePrice = flashSaleMap[product.id];
    if (!salePrice) return product;
    return { ...product, price: salePrice, originalPrice: product.price };
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [naRes, trRes, fsRes] = await Promise.all([
          productAPI.newArrivals(8),
          productAPI.trending(8),
          flashSaleAPI.getActive(20),
        ]);
        setNewArrivals(naRes.data.products);
        setTrending(trRes.data.products);
        setFlashSales(fsRes.data.flashSales);
      } catch {
        // silently fall back to empty lists; banners/categories are still static
      } finally {
        setApiLoading(false);
      }
    };
    load();
  }, []);

  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await productAPI.list({ search: query.trim(), limit: 40 });
      setSearchResults(res.data.products);
    } catch {
      const q = query.toLowerCase();
      const all = [...newArrivals, ...trending];
      setSearchResults(
        all.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q)
        )
      );
    } finally {
      setSearchLoading(false);
    }
  };
  // Product list screen: null | 'new-arrivals' | 'trending'
  const [productListScreen, setProductListScreen] = useState(null);

  // Checkout / orders / notifications full-screen overlays
  const [showCheckout,       setShowCheckout]       = useState(false);
  const [showOrders,         setShowOrders]         = useState(false);
  const [showNotifications,  setShowNotifications]  = useState(false);

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

  // Full-screen overlays (no header / tab bar)
  if (selectedProduct) {
    return (
      <ProductDetailScreen
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onNavigate={onNavigate}
      />
    );
  }

  if (productListScreen) {
    const isNewArrivals = productListScreen === 'new-arrivals';
    return (
      <ProductListScreen
        title={isNewArrivals ? 'New Arrivals' : 'Trending Now'}
        subtitle={isNewArrivals ? 'Fresh styles just landed' : 'What everyone is wearing'}
        products={isNewArrivals ? newArrivals : trending}
        flashSaleMap={flashSaleMap}
        onProductPress={(p) => { setProductListScreen(null); setSelectedProduct(withFlashSale(p)); }}
        onBack={() => setProductListScreen(null)}
      />
    );
  }

  if (showCheckout) {
    return (
      <CheckoutScreen
        onBack={() => setShowCheckout(false)}
        onOrderPlaced={() => { setShowCheckout(false); setShowOrders(true); }}
      />
    );
  }

  if (showOrders) {
    return <OrdersScreen onBack={() => setShowOrders(false)} />;
  }

  if (showNotifications) {
    return <NotificationScreen onBack={() => setShowNotifications(false)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Fixed Header */}
      {activeTab !== 'cart' && activeTab !== 'wishlist' && (
        <Header onNavigate={onNavigate} onCartPress={() => handleTabPress('cart')} onNotificationsPress={() => setShowNotifications(true)} />
      )}

      {/* Scrollable Content */}
      {activeTab === 'cart' ? (
        <CartScreen onBack={() => handleTabPress('home')} onCheckout={() => setShowCheckout(true)} />
      ) : activeTab === 'profile' && subScreen === 'addresses' ? (
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
      ) : activeTab === 'wishlist' ? (
        <WishlistScreen onProductPress={setSelectedProduct} onBack={() => handleTabPress('home')} />
      ) : activeTab === 'profile' ? (
        <ProfileScreen onNavigate={onNavigate} onOpenAddresses={openAddresses} onOpenWishlist={() => handleTabPress('wishlist')} onOpenOrders={() => setShowOrders(true)} />
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces
        >
          {/* Search */}
          <SearchBar onSearch={handleSearch} />

          {/* Search Results */}
          {searchQuery.trim().length > 0 && (
            <View style={styles.searchResults}>
              {searchLoading ? (
                <ActivityIndicator style={styles.loader} color={Colors.primary} />
              ) : (
                <>
                  <Text style={styles.searchResultsTitle}>
                    {searchResults.length > 0
                      ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
                      : `No results for "${searchQuery}"`}
                  </Text>
                  {searchResults.length > 0 ? (
                    <ProductGrid products={searchResults} onProductPress={(p) => setSelectedProduct(withFlashSale(p))} onNavigate={onNavigate} flashSaleMap={flashSaleMap} />
                  ) : (
                    <View style={styles.noResults}>
                      <Text style={styles.noResultsIcon}>🔍</Text>
                      <Text style={styles.noResultsText}>Try a different keyword</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {/* Home Content — hidden while searching */}
          {searchQuery.trim().length === 0 && (
            <>
              {/* Greeting */}
              <View style={styles.greeting}>
                <Text style={styles.greetingText}>{getGreeting()}, {firstName} 👋</Text>
                <Text style={styles.greetingSubtext}>What are you looking for today?</Text>
              </View>

              {/* Hero Banners */}
              <HeroBanner banners={banners} />

              {/* Categories */}
              <CategoryPills
                categories={categories}
                onSelect={(id) => {
                  const cat = categories.find((c) => c.id === id);
                  setSelectedCategory(cat ? cat.label : 'All');
                }}
              />

              {/* New Arrivals — 2-column grid */}
              <SectionHeader
                title="New Arrivals"
                subtitle="Fresh styles just landed"
                onSeeAll={() => setProductListScreen('new-arrivals')}
              />
              {apiLoading ? (
                <ActivityIndicator style={styles.loader} color={Colors.primary} />
              ) : filteredNewArrivals.length > 0 ? (
                <ProductGrid products={filteredNewArrivals} onProductPress={(p) => setSelectedProduct(withFlashSale(p))} onNavigate={onNavigate} flashSaleMap={flashSaleMap} />
              ) : null}

              {/* Flash Sale */}
              {flashSales.length > 0 && (
                <>
                  <SectionHeader
                    title="Flash Sale"
                    subtitle="Up to 60% off select items"
                  />
                  <FlashSaleBanner
                    products={flashSales.map((fs) => ({
                      id:            fs.id,
                      productId:     fs.productId,
                      name:          fs.product?.name  || '',
                      salePrice:     fs.salePrice,
                      originalPrice: fs.product?.originalPrice || null,
                      imageUrl:      fs.product?.imageUrl || null,
                    }))}
                    endTime={flashSales[0]?.endsAt}
                    onPress={async (item) => {
                      try {
                        const res = await productAPI.get(item.productId);
                        const p = res.data.product;
                        setSelectedProduct({
                          ...p,
                          price:         item.salePrice,
                          originalPrice: p.price,
                        });
                      } catch { /* ignore */ }
                    }}
                  />
                </>
              )}

              {/* Trending — horizontal scroll */}
              <SectionHeader
                title="Trending Now"
                subtitle="What everyone is wearing"
                onSeeAll={() => setProductListScreen('trending')}
              />
              {apiLoading ? (
                <ActivityIndicator style={styles.loader} color={Colors.primary} />
              ) : (
                <FlatList
                  data={filteredTrending}
                  renderItem={({ item }) => (
                    <ProductCard product={item} style={styles.trendingCard} onPress={() => setSelectedProduct(withFlashSale(item))} onNavigate={onNavigate} flashSalePrice={flashSaleMap[item.id]} />
                  )}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.trendingList}
                />
              )}

              {/* Virtual Try-On CTA */}
              <TryOnCTA />
            </>
          )}

          {/* Bottom padding for tab bar */}
          <View style={styles.bottomPad} />
        </ScrollView>
      )}

      {/* Fixed Bottom Tab Bar */}
      {activeTab !== 'cart' && (
        <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} wishlistCount={wishlistCount} />
      )}
    </SafeAreaView>
  );
};

// ─── Product Grid (2 columns) ────────────────────────────────────────────────
const ProductGrid = ({ products, onProductPress, onNavigate, flashSaleMap = {} }) => {
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
              onNavigate={onNavigate}
              flashSalePrice={flashSaleMap[product.id]}
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
  loader: {
    marginVertical: Theme.spacing.xl,
  },
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

  // Search Results
  searchResults: {
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
  },
  searchResultsTitle: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: Theme.spacing['3xl'],
    gap: Theme.spacing.sm,
  },
  noResultsIcon: {
    fontSize: 48,
  },
  noResultsText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textMuted,
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
    width: 185,
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
