import React from 'react';
import { View } from 'react-native';

export default function BatikPattern({ className = "", style = {} }) {
  return (
    <View className={`absolute inset-0 ${className}`} style={style}>
      {/* Traditional Batik-inspired geometric pattern */}
      <View className="flex-1 opacity-5">
        {/* Diamond pattern */}
        {Array.from({ length: 8 }).map((_, row) => (
          <View key={row} className="flex-row justify-around" style={{ height: '12.5%' }}>
            {Array.from({ length: 6 }).map((_, col) => (
              <View
                key={col}
                className="bg-batik-800"
                style={{
                  width: 8,
                  height: 8,
                  transform: [{ rotate: '45deg' }],
                  marginTop: (row % 2) * 10 + 10,
                  marginLeft: (col % 2) * 5,
                }}
              />
            ))}
          </View>
        ))}
        
        {/* Circular dots pattern */}
        {Array.from({ length: 6 }).map((_, row) => (
          <View key={`circle-${row}`} className="absolute flex-row justify-around w-full" style={{ top: `${row * 16}%` }}>
            {Array.from({ length: 5 }).map((_, col) => (
              <View
                key={col}
                className="bg-batik-700 rounded-full"
                style={{
                  width: 4,
                  height: 4,
                  marginLeft: (row % 2) * 20,
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
