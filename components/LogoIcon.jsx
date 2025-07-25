import React from 'react';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';

export default function LogoIcon({ width = 125, height = 126, ...props }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 125 126" fill="none" {...props}>
      <G clipPath="url(#clip0_25_9129)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M57.9854 4.21184C61.1139 7.41606 61.7512 9.21712 61.7577 14.8779C61.7677 22.9753 58.3944 29.2306 49.9508 36.7711C39.6438 45.9753 37.0857 48.8591 34.5623 54.1185C32.4208 58.5816 32.1808 59.5411 32.0981 63.9659C31.9866 69.9718 33.1925 74.2664 36.2371 78.706C39.7031 83.7606 50.165 92.5493 51.3293 91.385C51.5047 91.2095 51.2084 90.1843 50.6708 89.1062C49.2248 86.2083 48.9519 79.4478 50.1186 75.4354C51.8786 69.3803 54.9549 65.0927 63.9736 56.125C73.8175 46.3374 77.2812 40.2335 77.8874 31.6033C78.7988 18.6426 69.3475 4.86383 57.753 2.24881L55.5934 1.76172L57.9854 4.21184Z"
          fill="#461C07"
        />
        {/* Tambahkan path lainnya dari SVG asli di sini */}
      </G>
      <Defs>
        <ClipPath id="clip0_25_9129">
          <Rect width="125" height="125" fill="white" transform="translate(0 0.5)" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
