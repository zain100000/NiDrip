/**
 * @file Header.js
 * @module Header
 * @description
 * A highly customizable and animated header component for React Native applications.
 * * Features:
 * - Smooth entry animations using `Animated` (fade and spring scale)
 * - Support for dynamic background gradients via `LinearGradient`
 * - Flexible slot-based layout for left icons, central logo/title, and right icons
 * - Support for both Image sources and custom React Elements (Vector Icons)
 * - Themed styling with bottom-rounded corners and elevation shadows
 * * @param {Object} props - Component props
 * @param {string} [props.title] - The text to display in the center of the header
 * @param {number|Object|string} [props.logo] - Image source for the central branding logo
 * @param {number|Object|React.ReactElement} [props.leftIcon] - Icon/element to display on the left
 * @param {Function} [props.onPressLeft] - Callback function triggered when the left icon is pressed
 * @param {number|Object|React.ReactElement} [props.rightIcon] - Icon/element to display on the right
 * @param {Function} [props.onPressRight] - Callback function triggered when the right icon is pressed
 * * @returns {React.ReactElement} The rendered animated Header component
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../../../styles/Themes';

const { width, height } = Dimensions.get('screen');

const Header = ({
  title,
  logo,
  leftIcon,
  onPressLeft,
  rightIcon,
  onPressRight,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.leftGroup}>
          {leftIcon && (
            <TouchableOpacity onPress={onPressLeft} activeOpacity={0.8}>
              {React.isValidElement(leftIcon) ? (
                leftIcon
              ) : (
                <Image
                  source={leftIcon}
                  style={[styles.icon, { tintColor: theme.colors.white }]}
                />
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.logoTitleGroup}>
          {logo && <Image source={logo} style={styles.logo} />}
          <Text style={[styles.title, { color: theme.colors.white }]}>
            {title}
          </Text>
        </View>

        <View style={styles.rightGroup}>
          {rightIcon && (
            <TouchableOpacity onPress={onPressRight} activeOpacity={0.8}>
              {React.isValidElement(rightIcon) ? (
                rightIcon
              ) : (
                <Image
                  source={rightIcon}
                  style={[styles.icon, { tintColor: theme.colors.white }]}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    borderBottomLeftRadius: theme.borderRadius.large,
    borderBottomRightRadius: theme.borderRadius.large,
    overflow: 'hidden',
    ...theme.elevation.depth2,
  },

  gradientBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.024,
  },

  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.05,
  },

  logoTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.025,
    flex: 1,
    marginLeft: width * 0.04,
  },

  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.03,
  },

  logo: {
    width: width * 0.2,
    height: width * 0.1,
    top: height * 0.004,
    resizeMode: 'contain',
  },

  title: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
  },

  icon: {
    width: width * 0.06,
    height: width * 0.06,
    resizeMode: 'contain',
  },
});
