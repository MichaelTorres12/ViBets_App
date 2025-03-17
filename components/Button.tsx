import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View
} from 'react-native';
import { useTheme } from '@/components/ThemeContext';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rounded?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  rounded = false,
  icon,
  ...rest
}) => {
  const { colors } = useTheme();
  
  const getButtonStyle = (): ViewStyle => {
    let buttonStyle: ViewStyle = {};
    
    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyle = {
          backgroundColor: colors.primary,
        };
        break;
      case 'secondary':
        buttonStyle = {
          backgroundColor: colors.card,
        };
        break;
      case 'outline':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        };
        break;
      case 'ghost':
        buttonStyle = {
          backgroundColor: 'transparent',
        };
        break;
    }
    
    // Size styles
    switch (size) {
      case 'small':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 8,
          paddingHorizontal: 16,
        };
        break;
      case 'medium':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 12,
          paddingHorizontal: 24,
        };
        break;
      case 'large':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: 16,
          paddingHorizontal: 32,
        };
        break;
    }
    
    // Rounded style
    buttonStyle.borderRadius = rounded ? 50 : 12;
    
    // Disabled state
    if (disabled || isLoading) {
      buttonStyle = {
        ...buttonStyle,
        opacity: 0.6,
      };
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = (): TextStyle => {
    let textStyleObj: TextStyle = {
      fontWeight: '600',
    };
    
    // Size styles
    switch (size) {
      case 'small':
        textStyleObj = {
          ...textStyleObj,
          fontSize: 14,
        };
        break;
      case 'medium':
        textStyleObj = {
          ...textStyleObj,
          fontSize: 16,
        };
        break;
      case 'large':
        textStyleObj = {
          ...textStyleObj,
          fontSize: 18,
        };
        break;
    }
    
    // Variant styles
    switch (variant) {
      case 'primary':
        textStyleObj = {
          ...textStyleObj,
          color: '#000000',
        };
        break;
      case 'secondary':
        textStyleObj = {
          ...textStyleObj,
          color: colors.text,
        };
        break;
      case 'outline':
      case 'ghost':
        textStyleObj = {
          ...textStyleObj,
          color: colors.text,
        };
        break;
    }
    
    return textStyleObj;
  };
  
  const renderButton = () => {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        style={[styles.button, getButtonStyle(), style]}
        activeOpacity={0.7}
        {...rest}
      >
        {isLoading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' ? '#000000' : colors.text} 
          />
        ) : (
          <>
            {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
            <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
            {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
          </>
        )}
        {icon && !isLoading && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return renderButton();
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    textAlign: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});