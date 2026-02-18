import "dotenv/config";

export default ({ config }) => ({
  ...config,
  plugins: [
    "expo-maps"
  ],
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
  },
});
