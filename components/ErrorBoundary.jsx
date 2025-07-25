import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-batik-50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-8 items-center border border-batik-200">
            <View className="bg-red-100 w-20 h-20 rounded-full justify-center items-center mb-6">
              <Ionicons name="warning" size={40} color="#EF4444" />
            </View>
            
            <Text className="text-batik-800 text-xl font-bold mb-2">Oops! Something went wrong</Text>
            <Text className="text-batik-600 text-center mb-6">
              We encountered an unexpected error. Please try restarting the app.
            </Text>
            
            <TouchableOpacity
              onPress={() => this.setState({ hasError: false })}
              className="bg-batik-700 px-6 py-3 rounded-xl"
            >
              <Text className="text-batik-100 font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
