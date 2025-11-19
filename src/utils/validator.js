export function isValidUrl(url) {
  try {
    // allow urls without protocol by requiring http(s)
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (e) {
    return false;
  }
}

export function isValidCode(code) {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}
