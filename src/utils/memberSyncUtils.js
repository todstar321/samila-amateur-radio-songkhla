/**
 * Central Cloud Members Sync Utilities
 * Enables real-time cross-device sync between PC, Mobile, and Tablet via Cloudinary Raw CDN & /api/members
 */

const CLOUDINARY_RAW_URL = 'https://res.cloudinary.com/dx2asgfo7/raw/upload/samila_central_members_list.json';

/**
 * Fetch central members list from API or directly from Cloudinary raw CDN
 */
export async function fetchCentralMembers() {
  // 1. Try local/Vercel API route first
  try {
    const res = await fetch(`/api/members?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.members) && data.members.length > 0) {
        return data.members;
      }
    }
  } catch (e) {
    // API route might fail in offline or preview mode, proceed to CDN fallback
  }

  // 2. Direct Cloudinary CDN fallback (Works globally on any device/network)
  try {
    const cRes = await fetch(`${CLOUDINARY_RAW_URL}?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (cRes.ok) {
      const cloudData = await cRes.json();
      if (Array.isArray(cloudData) && cloudData.length > 0) {
        return cloudData;
      }
    }
  } catch (e) {
    console.warn('[MemberSync] Direct CDN fetch error:', e);
  }

  return null;
}

/**
 * Save new member to central cloud storage immediately
 */
export async function saveNewMemberToCentral(newMember) {
  if (!newMember) return false;

  try {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', member: newMember })
    });
    if (res.ok) {
      const data = await res.json();
      return data.success;
    }
  } catch (e) {
    console.warn('[MemberSync] API save error:', e);
  }

  return false;
}

/**
 * Synchronize full members list to central cloud storage
 */
export async function syncMembersToCentral(membersList) {
  if (!Array.isArray(membersList) || membersList.length === 0) return false;

  try {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync', members: membersList })
    });
    if (res.ok) {
      const data = await res.json();
      return data.success;
    }
  } catch (e) {
    console.warn('[MemberSync] API sync error:', e);
  }

  return false;
}
