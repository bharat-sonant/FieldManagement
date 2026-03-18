// AES-CBC with fixed IV — deterministic encryption (same input → same output)
// This allows querying encrypted values in the database.

const IV = new Uint8Array(16) // fixed 16-byte IV

const getKey = async () => {
  const raw = (import.meta.env.VITE_ENCRYPTION_KEY || '').padEnd(32, '0').slice(0, 32)
  const keyBytes = new TextEncoder().encode(raw)
  return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt'])
}

export const encrypt = async (text) => {
  if (!text) return text
  try {
    const key       = await getKey()
    const encoded   = new TextEncoder().encode(text)
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: IV }, key, encoded)
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  } catch {
    return text
  }
}

export const decrypt = async (text) => {
  if (!text) return text
  try {
    const key       = await getKey()
    const bytes     = Uint8Array.from(atob(text), (c) => c.charCodeAt(0))
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: IV }, key, bytes)
    return new TextDecoder().decode(decrypted)
  } catch {
    return text // unencrypted legacy data — return as-is
  }
}
