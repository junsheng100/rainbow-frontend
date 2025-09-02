interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export class CookieService {
  // 设置cookie
  static set(name: string, value: string, options: CookieOptions = {}): void {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.expires) {
      if (typeof options.expires === 'number') {
        const date = new Date();
        date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
        options.expires = date;
      }
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += '; secure';
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  }

  // 获取cookie
  static get(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  // 删除cookie
  static remove(name: string, options: CookieOptions = {}): void {
    const opts = { ...options, expires: new Date(0) };
    this.set(name, '', opts);
  }
}

// 默认的cookie配置
export const defaultCookieOptions: CookieOptions = {
  path: '/',
  secure: window.location.protocol === 'https:',
  sameSite: 'Lax'
};

// Token相关的cookie操作
export const TokenCookie = {
  // 设置访问令牌
  setAccessToken(token: string): void {
    CookieService.set('token', token, {
      ...defaultCookieOptions,
      expires: 1 // 1天过期
    });
  },

  // 设置刷新令牌
  setRefreshToken(token: string): void {
    CookieService.set('refreshToken', token, {
      ...defaultCookieOptions,
      expires: 7 // 7天过期
    });
  },

  // 获取访问令牌
  getAccessToken(): string | null {
    return CookieService.get('token');
  },

  // 获取刷新令牌
  getRefreshToken(): string | null {
    return CookieService.get('refreshToken');
  },

  // 清除所有认证相关的cookie
  clearTokens(): void {
    CookieService.remove('token', defaultCookieOptions);
    CookieService.remove('refreshToken', defaultCookieOptions);
  }
};
