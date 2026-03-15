import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';

const SectionHeader = ({ title, subtitle, onSeeAll }) => (
  <View style={styles.container}>
    <View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7} style={styles.seeAllBtn}>
        <Text style={styles.seeAll}>See all</Text>
        <Text style={styles.seeAllArrow}> →</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
    paddingBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.fontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAll: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.accent,
  },
  seeAllArrow: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.accent,
  },
});

export default SectionHeader;
