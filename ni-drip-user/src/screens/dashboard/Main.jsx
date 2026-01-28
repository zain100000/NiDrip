import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  FlatList,
  Text,
  Pressable,
} from 'react-native';
import { theme } from '../../styles/Themes';
import Header from '../../utilities/custom-components/header/header/Header';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import InputField from '../../utilities/custom-components/input-field/InputField.utility';
import CategoryCard from '../../utilities/custom-components/card/category-card/CategoryCard';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProducts } from '../../redux/slices/product.slice';
import { getUser } from '../../redux/slices/user.slice';

const { width, height } = Dimensions.get('screen');

const ALLOWED_CATEGORIES = [
  'Laptops',
  'SmartPhones',
  'Refrigerators',
  'WashingMachines',
];

const extractCategories = product => {
  const result = [];
  if (!product?.category) return result;

  product.category.forEach(c => {
    try {
      const parsed = JSON.parse(c);
      if (Array.isArray(parsed)) {
        parsed.forEach(p => p && result.push(p));
      }
    } catch {}
  });

  return result;
};

const Home = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  const user = useSelector(state => state.auth.user);
  const profile = useSelector(state => state.user.user);
  const AllProducts = useSelector(state => state.product.products || []);

  console.log('Profile', profile);

  useEffect(() => {
    if (user?.id) dispatch(getAllProducts());
    dispatch(getUser(user?.id));
  }, [dispatch, user]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent');
  }, []);

  const categoriesData = useMemo(() => {
    const map = {};

    AllProducts.forEach(p => {
      const cats = extractCategories(p);

      cats.forEach(cat => {
        if (!ALLOWED_CATEGORIES.includes(cat)) return;

        if (!map[cat]) {
          map[cat] = {
            title: cat,
            itemCount: 0,
            imageUrl: p.productImages?.[0] || null,
          };
        }

        map[cat].itemCount += 1;

        if (!map[cat].imageUrl && p.productImages?.[0]) {
          map[cat].imageUrl = p.productImages[0];
        }
      });
    });

    return ALLOWED_CATEGORIES.map(c => map[c]).filter(Boolean);
  }, [AllProducts]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categoriesData;
    const q = searchQuery.toLowerCase();
    return categoriesData.filter(c => c.title.toLowerCase().includes(q));
  }, [searchQuery, categoriesData]);

  return (
    <View style={styles.container}>
      <Header
        logo={require('../../assets/logo/logo.png')}
        title="Home"
        rightIcon={
          <MaterialCommunityIcons
            name="cog"
            size={width * 0.06}
            color={theme.colors.white}
          />
        }
      />

      <View style={styles.searchSection}>
        <InputField
          placeholder="Search Categories"
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={
            <MaterialCommunityIcons
              name="magnify"
              size={width * 0.06}
              color={theme.colors.dark}
            />
          }
        />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Explore Categories</Text>

          <Pressable style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View all</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color={theme.colors.primary}
            />
          </Pressable>
        </View>

        <FlatList
          data={filteredCategories}
          keyExtractor={item => item.title}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listPadding,
            filteredCategories.length === 0 && {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
          renderItem={({ item }) => (
            <CategoryCard
              title={item.title}
              imageUrl={item.imageUrl}
              itemCount={item.itemCount}
              onPress={() => console.log(item.title)}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="emoticon-sad-outline"
                size={width * 0.16}
                color={theme.colors.primary}
              />
              <Text style={styles.emptyText}>No categories available</Text>
              <Text style={styles.emptySubText}>
                Try refreshing or come back later.
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },

  searchSection: {
    paddingHorizontal: width * 0.04,
    marginTop: height * 0.01,
  },

  content: {
    flex: 1,
    marginTop: height * 0.02,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.02,
  },

  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewAllText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: theme.colors.primary,
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.medium,
    color: theme.colors.dark,
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.02,
  },

  listPadding: {
    paddingHorizontal: width * 0.02,
    paddingBottom: height * 0.02,
  },

  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.02,
    paddingHorizontal: width * 0.04,
  },

  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.bold,
    color: theme.colors.dark,
  },

  emptySubText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.light,
    color: theme.colors.dark,
    marginTop: height * 0.004,
  },
});
