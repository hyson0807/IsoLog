import { View } from 'react-native';

interface PageIndicatorProps {
  totalPages: number;
  currentPage: number;
}

export function PageIndicator({ totalPages, currentPage }: PageIndicatorProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: totalPages }).map((_, index) => (
        <View
          key={index}
          className={`h-2 rounded-full ${
            index === currentPage ? 'w-6 bg-orange-500' : 'w-2 bg-gray-300'
          }`}
        />
      ))}
    </View>
  );
}
