#!/bin/bash
# install.sh — Run this script once after cloning the repo to install all dependencies.
# Usage: bash install.sh

set -e

echo "📦 Installing Expo managed packages..."
npx expo install \
  expo-router \
  expo-constants \
  expo-linking \
  expo-status-bar \
  expo-font \
  expo-secure-store \
  expo-camera \
  expo-notifications \
  expo-device \
  expo-image \
  expo-linear-gradient \
  react-native-safe-area-context

echo "📦 Installing npm packages..."
npm install \
  nativewind \
  zustand \
  @tanstack/react-query \
  @supabase/supabase-js \
  react-native-mmkv \
  react-native-qrcode-svg \
  react-native-svg \
  date-fns \
  @react-native-async-storage/async-storage

echo "📦 Installing dev dependencies..."
npm install --save-dev tailwindcss

echo "✅ All dependencies installed!"
echo "👉 Next: copy .env.example to .env and fill in your Supabase credentials."
