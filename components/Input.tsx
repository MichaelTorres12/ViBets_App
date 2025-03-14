//components/Input.tsx
import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  rightIcon,
  leftIcon,
  isPassword = false,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);
  const { colors } = useTheme();
  
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.text }, labelStyle]}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          { 
            borderColor: colors.border,
            backgroundColor: colors.cardLight
          },
          isFocused && { borderColor: colors.primary },
          error ? { borderColor: colors.error } : null,
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            leftIcon ? styles.inputWithLeftIcon : null,
            (rightIcon || isPassword) ? styles.inputWithRightIcon : null,
            inputStyle,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={!showPassword}
          {...rest}
        />
        
        {isPassword ? (
          <TouchableOpacity 
            style={styles.iconContainer} 
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.iconContainer}>{rightIcon}</View>
        ) : null}
      </View>
      
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  iconContainer: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});