// Emoji mapping for categories - cute and feminine themed
export const categoryEmojis: Record<string, string> = {
  // Income categories
  'Salary': '💰',
  'Freelance': '💻',
  'Investment': '📈',
  'Gift': '🎁',
  'Other Income': '💵',
  
  // Expense categories
  'Food & Dining': '🍔',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Bills & Utilities': '📄',
  'Entertainment': '🎮',
  'Health': '💊',
  'Healthcare': '💊',
  'Education': '📚',
  'Other Expense': '💸',
  'Other': '✨',
  
  // Additional cute categories
  'Beauty': '💄',
  'Coffee': '☕',
  'Snacks': '🍪',
  'Bubble Tea': '🧋',
  'Skincare': '🧴',
  'Clothes': '👗',
  'Accessories': '💍',
  'Books': '📖',
  'Stationery': '✏️',
  'Phone': '📱',
  'Internet': '🌐',
  'Streaming': '📺',
  'Music': '🎵',
  'Games': '🎮',
  'Sports': '⚽',
  'Travel': '✈️',
  'Pet': '🐱',
  'Rent': '🏠',
  'Groceries': '🥬',
  'Laundry': '👚',
  'Fitness': '💪',
  'Charity': '💕',
};

// Default emoji for unknown categories
export const getEmojiForCategory = (categoryName: string): string => {
  // Try exact match first
  if (categoryEmojis[categoryName]) {
    return categoryEmojis[categoryName];
  }
  
  // Try partial match
  const lowerName = categoryName.toLowerCase();
  for (const [key, emoji] of Object.entries(categoryEmojis)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return emoji;
    }
  }
  
  // Default sparkle for unknown
  return '✨';
};

// Icon to emoji mapping for Lucide icons
export const iconToEmoji: Record<string, string> = {
  'Briefcase': '💼',
  'Laptop': '💻',
  'TrendingUp': '📈',
  'Gift': '🎁',
  'Utensils': '🍽️',
  'Car': '🚗',
  'ShoppingBag': '🛍️',
  'Zap': '⚡',
  'Film': '🎬',
  'Heart': '💕',
  'GraduationCap': '🎓',
  'MoreHorizontal': '✨',
  'Wallet': '👛',
  'CreditCard': '💳',
  'DollarSign': '💵',
  'Home': '🏠',
  'Coffee': '☕',
  'Music': '🎵',
  'Book': '📖',
  'Plane': '✈️',
  'Bus': '🚌',
  'Phone': '📱',
};