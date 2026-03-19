import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Logger
app.use('*', logger(console.log));

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Create storage buckets on startup
async function initializeStorage() {
  try {
    const bucketName = 'make-5dea8d1f-crop-images';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('Created storage bucket:', bucketName);
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Initialize storage on startup
initializeStorage();

// Authentication helper
async function getAuthenticatedUser(c: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Sign up route
app.post('/make-server-5dea8d1f/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ user: data.user });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Reset password route
app.post('/make-server-5dea8d1f/auth/reset-password', async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Reset password error:', error);
    return c.json({ error: 'Internal server error during password reset' }, 500);
  }
});

// Create or update farmer profile
app.post('/make-server-5dea8d1f/profile', async (c) => {
  try {
    const user = await getAuthenticatedUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { name, location, preferred_language, latitude, longitude } = await c.req.json();
    
    const profileData = {
      user_id: user.id,
      name: name || user.user_metadata?.name,
      location,
      preferred_language: preferred_language || 'en',
      latitude,
      longitude,
      updated_at: new Date().toISOString()
    };
    
    // Check if profile exists
    const existingProfile = await kv.get(`farmer_profile:${user.id}`);
    
    if (existingProfile) {
      // Update existing profile
      await kv.set(`farmer_profile:${user.id}`, { ...existingProfile, ...profileData });
    } else {
      // Create new profile
      await kv.set(`farmer_profile:${user.id}`, {
        id: crypto.randomUUID(),
        ...profileData,
        created_at: new Date().toISOString()
      });
    }
    
    return c.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    return c.json({ error: 'Internal server error during profile update' }, 500);
  }
});

// Get farmer profile
app.get('/make-server-5dea8d1f/profile', async (c) => {
  try {
    const user = await getAuthenticatedUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const profile = await kv.get(`farmer_profile:${user.id}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }
    
    return c.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Internal server error while fetching profile' }, 500);
  }
});

// Submit crop data
app.post('/make-server-5dea8d1f/crop-submission', async (c) => {
  try {
    const user = await getAuthenticatedUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { soil_type, ph_level, location, existing_crop, preferred_crop } = await c.req.json();
    
    const submissionId = crypto.randomUUID();
    const submissionData = {
      id: submissionId,
      user_id: user.id,
      soil_type,
      ph_level: parseFloat(ph_level),
      location,
      existing_crop,
      preferred_crop,
      submitted_at: new Date().toISOString()
    };
    
    await kv.set(`crop_submission:${submissionId}`, submissionData);
    await kv.set(`user_latest_submission:${user.id}`, submissionId);
    
    return c.json({ 
      message: 'Crop submission saved successfully',
      submission_id: submissionId
    });
  } catch (error) {
    console.error('Crop submission error:', error);
    return c.json({ error: 'Internal server error during crop submission' }, 500);
  }
});

// Get user's latest crop submission
app.get('/make-server-5dea8d1f/crop-submission/latest', async (c) => {
  try {
    const user = await getAuthenticatedUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const latestSubmissionId = await kv.get(`user_latest_submission:${user.id}`);
    
    if (!latestSubmissionId) {
      return c.json({ error: 'No submissions found' }, 404);
    }
    
    const submission = await kv.get(`crop_submission:${latestSubmissionId}`);
    
    if (!submission) {
      return c.json({ error: 'Submission not found' }, 404);
    }
    
    return c.json({ submission });
  } catch (error) {
    console.error('Get latest submission error:', error);
    return c.json({ error: 'Internal server error while fetching submission' }, 500);
  }
});

// Upload crop image
app.post('/make-server-5dea8d1f/upload-image', async (c) => {
  try {
    const user = await getAuthenticatedUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type' }, 400);
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      return c.json({ error: 'File too large' }, 400);
    }
    
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const bucketName = 'make-5dea8d1f-crop-images';
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Upload error:', error);
      return c.json({ error: 'Failed to upload image' }, 500);
    }
    
    // Create signed URL for the uploaded image
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600 * 24 * 7); // 1 week expiry
    
    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      return c.json({ error: 'Failed to create image URL' }, 500);
    }
    
    return c.json({ 
      message: 'Image uploaded successfully',
      image_url: signedUrlData.signedUrl,
      file_path: fileName
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return c.json({ error: 'Internal server error during image upload' }, 500);
  }
});

// Get market prices
app.get('/make-server-5dea8d1f/market-prices', async (c) => {
  try {
    const location = c.req.query('location') || 'general';
    
    // Get market prices from KV store or return mock data
    const pricesKey = `market_prices:${location}`;
    let prices = await kv.get(pricesKey);
    
    if (!prices) {
      // Initialize with mock data
      prices = [
        { crop_name: 'Wheat', price_per_kg: 25.50, currency: 'USD', market_location: location, updated_at: new Date().toISOString() },
        { crop_name: 'Rice', price_per_kg: 18.75, currency: 'USD', market_location: location, updated_at: new Date().toISOString() },
        { crop_name: 'Corn', price_per_kg: 22.30, currency: 'USD', market_location: location, updated_at: new Date().toISOString() },
        { crop_name: 'Soybeans', price_per_kg: 32.80, currency: 'USD', market_location: location, updated_at: new Date().toISOString() },
        { crop_name: 'Cotton', price_per_kg: 45.20, currency: 'USD', market_location: location, updated_at: new Date().toISOString() }
      ];
      await kv.set(pricesKey, prices);
    }
    
    return c.json({ prices });
  } catch (error) {
    console.error('Market prices error:', error);
    return c.json({ error: 'Internal server error while fetching market prices' }, 500);
  }
});

// Get weather forecast
app.get('/make-server-5dea8d1f/weather', async (c) => {
  try {
    const location = c.req.query('location') || 'general';
    
    // Get weather data from KV store or return mock data
    const weatherKey = `weather:${location}`;
    let weather = await kv.get(weatherKey);
    
    if (!weather) {
      // Initialize with mock data
      const today = new Date();
      weather = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return {
          location,
          temperature: Math.round(Math.random() * 15 + 20), // 20-35°C
          humidity: Math.round(Math.random() * 40 + 40), // 40-80%
          rainfall: Math.round(Math.random() * 20), // 0-20mm
          forecast_date: date.toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        };
      });
      await kv.set(weatherKey, weather);
    }
    
    return c.json({ weather });
  } catch (error) {
    console.error('Weather forecast error:', error);
    return c.json({ error: 'Internal server error while fetching weather data' }, 500);
  }
});

// Update market prices (for real-time updates)
app.post('/make-server-5dea8d1f/market-prices', async (c) => {
  try {
    const { location, prices } = await c.req.json();
    
    if (!location || !prices) {
      return c.json({ error: 'Location and prices are required' }, 400);
    }
    
    const pricesKey = `market_prices:${location}`;
    await kv.set(pricesKey, prices);
    
    return c.json({ message: 'Market prices updated successfully' });
  } catch (error) {
    console.error('Update market prices error:', error);
    return c.json({ error: 'Internal server error while updating market prices' }, 500);
  }
});

// Update weather data (for real-time updates)
app.post('/make-server-5dea8d1f/weather', async (c) => {
  try {
    const { location, weather } = await c.req.json();
    
    if (!location || !weather) {
      return c.json({ error: 'Location and weather data are required' }, 400);
    }
    
    const weatherKey = `weather:${location}`;
    await kv.set(weatherKey, weather);
    
    return c.json({ message: 'Weather data updated successfully' });
  } catch (error) {
    console.error('Update weather error:', error);
    return c.json({ error: 'Internal server error while updating weather data' }, 500);
  }
});

// Health check endpoint
app.get('/make-server-5dea8d1f/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

export default app;

Deno.serve(app.fetch);