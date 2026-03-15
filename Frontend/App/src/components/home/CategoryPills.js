import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Colors from '../../constants/colors';
import Theme from '../../constants/theme';

const CategoryPills = ({ categories = [], onSelect }) => {
  const [activeId, setActiveId] = useState('0');

  const handleSelect = (id) => {
    setActiveId(id);
    onSelect && onSelect(id);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const isActive = activeId === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => handleSelect(cat.id)}
            activeOpacity={0.75}
          >
            <Text style={styles.pillIcon}>{cat.icon}</Text>
            <Text style={[styles.pillLabel, isActive && styles.pillLabelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    gap: Theme.spacing.sm,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.radius.full,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillIcon: {
    fontSize: 14,
  },
  pillLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pillLabelActive: {
    color: Colors.white,
  },
});

export default CategoryPills;
