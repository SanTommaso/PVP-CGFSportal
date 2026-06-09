export function extractYouTubeId(url) {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();
  const directId = /^[a-zA-Z0-9_-]{11}$/.test(trimmed) ? trimmed : null;
  if (directId) return directId;

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").slice(0, 11) || null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.searchParams.get("v")) return parsed.searchParams.get("v").slice(0, 11);
      const embedMatch = parsed.pathname.match(/\/(embed|shorts)\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) return embedMatch[2];
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeEmbedUrl(url) {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
