import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || 'https://lwhxpychxnikhwkwejks.supabase.co';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || '';

const adminClient = supabaseSecretKey
  ? createClient(supabaseUrl, supabaseSecretKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

// Proxy registration API to create verified users directly in Supabase Authentication -> Users
app.post('/api/auth/register', async (req, res) => {
  if (!adminClient) {
    return res.status(500).json({ error: 'SUPABASE_SECRET_KEY is required on the server to manage users via admin API' });
  }
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    role, 
    phoneNumber, 
    trade, 
    tradeTitle, 
    hourlyRate, 
    experienceYears, 
    city, 
    serviceAreas, 
    bio 
  } = req.body;

  const cleanEmail = (email || '').trim().toLowerCase();

  try {
    let authUser: any = null;

    // 1. Create confirmed user directly in Supabase auth.users using admin API
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName || 'User',
        last_name: lastName || '',
        role: role || 'customer',
        phone_number: phoneNumber || '',
      }
    });

    if (!createError && createData?.user) {
      authUser = createData.user;
    } else {
      // If user already exists in auth.users, update password & confirm status
      const { data: listData } = await adminClient.auth.admin.listUsers();
      const existing = listData?.users?.find((u: any) => u.email?.toLowerCase() === cleanEmail);
      if (existing) {
        authUser = existing;
        await adminClient.auth.admin.updateUserById(existing.id, {
          password: password,
          email_confirm: true,
          user_metadata: {
            first_name: firstName || 'User',
            last_name: lastName || '',
            role: role || 'customer',
            phone_number: phoneNumber || '',
          }
        });
      } else {
        return res.status(400).json({ error: createError?.message || 'Could not register user in Supabase Auth' });
      }
    }

    // 2. Ensure row in public.profiles
    await adminClient.from('profiles').upsert({
      id: authUser.id,
      email: cleanEmail,
      first_name: firstName || 'User',
      last_name: lastName || '',
      role: role || 'customer',
      phone_number: phoneNumber || '',
      is_active: true,
      updated_at: new Date().toISOString()
    });

    // 3. If worker, ensure row in public.worker_profiles
    if (role === 'worker') {
      await adminClient.from('worker_profiles').upsert({
        user_id: authUser.id,
        trade: trade || 'technician',
        trade_title: tradeTitle || `${(trade || 'technician').toUpperCase()} Specialist`,
        hourly_rate: Number(hourlyRate) || 350,
        experience_years: Number(experienceYears) || 3,
        city: city || 'Addis Ababa',
        service_areas: Array.isArray(serviceAreas) ? serviceAreas : [city || 'Addis Ababa'],
        bio: bio || 'Professional home service technician in Addis Ababa',
        verified: true,
      });
    }

    return res.json({
      success: true,
      token: `sb_session_${authUser.id}_${Date.now()}`,
      user: {
        id: authUser.id,
        email: cleanEmail,
        firstName: firstName || 'User',
        lastName: lastName || '',
        role: role || 'customer',
        phoneNumber: phoneNumber || '',
      }
    });
  } catch (err: any) {
    console.error('Server register error:', err);
    return res.status(500).json({ error: err.message || 'Server registration failed' });
  }
});

// Vite middleware
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
