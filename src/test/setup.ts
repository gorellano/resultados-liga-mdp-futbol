import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Force database tests to run in mock mode by clearing environment variables
vi.stubEnv('VITE_SUPABASE_URL', '');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
