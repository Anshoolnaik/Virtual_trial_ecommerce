import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';

const FlashSaleItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.item} activeOpacity={0.85} onPress={() => onPress && onPress(item)}>
    <View style={styles.itemImageWrap}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
    </View>
    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
    <Text style={styles.itemSalePrice}>${item.salePrice}</Text>
    <Text style={styles.itemOriginalPrice}>${item.originalPrice}</Text>
  </TouchableOpacity>
);

const calcTimeLeft = (endTime) => {
  const diff = Math.max(0, Math.floor((new Date(endTime) - Date.now()) / 1000));
  return {
    h: Math.floor(diff / 3600),
    m: Math.floor((diff % 3600) / 60),
    s: diff % 60,
  };
};

const FlashSaleBanner = ({ products = [], endTime, onPress }) => {
  const [timeLeft, setTimeLeft] = useState(() =>
    endTime ? calcTimeLeft(endTime) : { h: 0, m: 0, s: 0 }
  );

  useEffect(() => {
    if (!endTime) return;
    const timer = setInterval(() => {
      const tl = calcTimeLeft(endTime);
      setTimeLeft(tl);
      if (tl.h === 0 && tl.m === 0 && tl.s === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.title}>Flash Sale</Text>
            <Text style={styles.subtitle}>Limited time offers</Text>
          </View>
        </View>
        <View style={styles.timerWrap}>
          <TimeBlock value={pad(timeLeft.h)} />
          <Text style={styles.colon}>:</Text>
          <TimeBlock value={pad(timeLeft.m)} />
          <Text style={styles.colon}>:</Text>
          <TimeBlock value={pad(timeLeft.s)} />
        </View>
      </View>

      {/* Products */}
      <FlatList
        data={products}
        renderItem={({ item }) => <FlashSaleItem item={item} onPress={onPress} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const TimeBlock = ({ value }) => (
  <View style={styles.timeBlock}>
    <Text style={styles.timeValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Theme.spacing.lg,
    marginVertical: Theme.spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    paddingTop: Theme.spacing.lg,
    ...Theme.shadow.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  title: {
    fontSize: Theme.fontSize.xl,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Theme.fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
  },
  timerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeBlock: {
    backgroundColor: Colors.accent,
    width: 34,
    height: 34,
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValue: {
    color: Colors.white,
    fontSize: Theme.fontSize.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  colon: {
    color: Colors.white,
    fontSize: Theme.fontSize.lg,
    fontWeight: '700',
    marginBottom: 2,
  },
  listContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  item: {
    width: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Theme.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  itemImageWrap: {
    height: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemName: {
    fontSize: Theme.fontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    paddingHorizontal: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
  },
  itemSalePrice: {
    fontSize: Theme.fontSize.lg,
    fontWeight: '800',
    color: Colors.accent,
    paddingHorizontal: Theme.spacing.sm,
    paddingTop: 2,
  },
  itemOriginalPrice: {
    fontSize: Theme.fontSize.xs,
    color: 'rgba(255,255,255,0.45)',
    textDecorationLine: 'line-through',
    paddingHorizontal: Theme.spacing.sm,
    paddingBottom: Theme.spacing.sm,
  },
});

export default FlashSaleBanner;
