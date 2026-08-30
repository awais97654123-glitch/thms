import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

// Remote JWKS Set cached instance
let jwksSet: ReturnType<typeof createRemoteJWKSet> | null = null;

export function getJwksSet(): ReturnType<typeof createRemoteJWKSet> {
  if (jwksSet) {
    return jwksSet;
  }

  const jwksUrl = process.env.SUPABASE_JWKS_URL;
  if (!jwksUrl) {
    throw new Error('Missing SUPABASE_JWKS_URL environment variable.');
  }

  jwksSet = createRemoteJWKSet(new URL(jwksUrl), {
    cooldownDuration: 30000, // 30s cache
    cacheMaxAge: 600000,     // 10min max age
  });

  return jwksSet;
}

/**
 * Verifies a Supabase-issued JWT token against the project's JWKS endpoint
 */
export async function verifySupabaseToken(
  token: string
): Promise<{ isValid: boolean; payload?: JWTPayload; error?: string }> {
  try {
    const JWKS = getJwksSet();
    const { payload } = await jwtVerify(token, JWKS);
    return { isValid: true, payload };
  } catch (err: any) {
    return { isValid: false, error: err.message || 'Invalid or expired Supabase JWT token' };
  }
}

/**
 * Validates whether the JWKS endpoint is reachable and responsive
 */
export async function checkJwksHealth(): Promise<{ isHealthy: boolean; jwksUrl: string; error?: string }> {
  const jwksUrl = process.env.SUPABASE_JWKS_URL;
  if (!jwksUrl) {
    return { isHealthy: false, jwksUrl: '', error: 'SUPABASE_JWKS_URL is not set' };
  }

  try {
    const res = await fetch(jwksUrl, { method: 'GET', cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const keyCount = Array.isArray(data?.keys) ? data.keys.length : 0;
      return { isHealthy: true, jwksUrl, error: keyCount > 0 ? undefined : 'No active keys found in JWKS' };
    } else {
      return { isHealthy: false, jwksUrl, error: `JWKS HTTP ${res.status} ${res.statusText}` };
    }
  } catch (err: any) {
    return { isHealthy: false, jwksUrl, error: err.message };
  }
}
