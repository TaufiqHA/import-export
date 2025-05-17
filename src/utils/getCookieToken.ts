export default function getCookieToken(req: Request, cookieName: string) {
    const cookies = req.headers.get("cookie") || "";
    return cookies.match(new RegExp(`${cookieName}=([^;]+)`))?.[1] || null;
  }
  