export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    if (!cookieHeader) return {};

    return cookieHeader.split(';').reduce((cookies, cookie) => {
        const [name, ...valueParts] = cookie.split('=');
        const key = name?.trim();
        const value = valueParts.join('=').trim();
        if (key && value) {
            cookies[key] = decodeURIComponent(value);
        }
        return cookies;
    }, {} as Record<string, string>);
}