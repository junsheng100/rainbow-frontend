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
        // 如果数字小于1000，认为是天数；否则认为是秒数
        if (options.expires < 1000) {
          date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
        } else {
          date.setTime(date.getTime() + options.expires * 1000);
        }
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

    // 只在开发环境显示详细日志
    if (import.meta.env.DEV) {
      console.log('🍪 CookieService.set 设置 cookie:', {
        name,
        valueLength: value.length,
        cookieString: cookieString.substring(0, 100) + '...'
      });
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
  secure: false, // 开发环境使用 false，生产环境可以设置为 window.location.protocol === 'https:'
  sameSite: 'Lax'
};

// 生产环境的cookie配置
export const productionCookieOptions: CookieOptions = {
  path: '/',
  secure: true, // 生产环境使用 HTTPS
  sameSite: 'Lax'
};

// 根据环境自动选择cookie配置
export const getCookieOptions = (): CookieOptions => {
  const isProduction = import.meta.env.PROD
  const isHttps = window.location.protocol === 'https:'
  
  if (isProduction && isHttps) {
    return productionCookieOptions
  }
  
  return defaultCookieOptions
};

// Token相关的cookie操作
export const TokenCookie = {
  // 设置访问令牌
  setAccessToken(token: string): void {
    const cookieOptions = getCookieOptions()
    console.log('🍪 开始设置 accessToken 到 Cookie:', {
      tokenLength: token.length,
      tokenPreview: token.substring(0, 30) + '...',
      cookieOptions: {
        ...cookieOptions,
        expires: 1
      },
      currentLocation: {
        protocol: window.location.protocol,
        host: window.location.host,
        pathname: window.location.pathname
      }
    });
    
    CookieService.set('token', token, {
      ...cookieOptions,
      expires: 24 * 3600 // 24小时过期 (86400秒)
    });
    
    console.log('🍪 accessToken Cookie 设置完成，当前 document.cookie:', document.cookie);
    
    // 立即验证设置是否成功
    const verifyToken = CookieService.get('token');
    console.log('🍪 立即验证 accessToken Cookie 设置结果:', {
      hasToken: !!verifyToken,
      tokenMatches: verifyToken === token,
      verifyTokenLength: verifyToken?.length || 0
    });
  },

  // 设置刷新令牌
  setRefreshToken(token: string): void {
    const cookieOptions = getCookieOptions()
    CookieService.set('refreshToken', token, {
      ...cookieOptions,
      expires: 7 * 24 * 3600 // 7天过期 (604800秒)
    });
  },

  // 获取访问令牌
  getAccessToken(): string | null {
    const token = CookieService.get('token');
    // 只在开发环境显示详细日志
    if (import.meta.env.DEV) {
      console.log('🍪 尝试获取 accessToken 从 Cookie:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? token.substring(0, 30) + '...' : 'none'
      });
    }
    return token;
  },

  // 获取刷新令牌
  getRefreshToken(): string | null {
    return CookieService.get('refreshToken');
  },

  // 设置令牌类型
  setTokenType(tokenType: string): void {
    const cookieOptions = getCookieOptions()
    CookieService.set('tokenType', tokenType, {
      ...cookieOptions,
      expires: 24 * 3600 // 24小时过期 (86400秒)
    });
  },

  // 获取令牌类型
  getTokenType(): string | null {
    return CookieService.get('tokenType');
  },

  // 清除所有认证相关的cookie
  clearTokens(): void {
    const cookieOptions = getCookieOptions()
    console.log('🧹 清除所有认证相关的 Cookie...')
    
    // 清除已知的认证相关 Cookie
    const knownAuthCookies = ['token', 'refreshToken', 'tokenType', 'userInfo', 'accessToken', 'authToken', 'sessionToken', 'jwt', 'user', 'login', 'auth']
    
    knownAuthCookies.forEach(cookieName => {
      CookieService.remove(cookieName, cookieOptions);
      console.log(`🧹 清除 Cookie: ${cookieName}`)
    })
    
    // 清除所有可能包含认证信息的 Cookie
    try {
      const allCookies = document.cookie.split(';')
      const cookiesToRemove: string[] = []
      
      allCookies.forEach(cookie => {
        const cookieName = cookie.trim().split('=')[0]
        if (cookieName && (
          cookieName.toLowerCase().includes('token') ||
          cookieName.toLowerCase().includes('auth') ||
          cookieName.toLowerCase().includes('session') ||
          cookieName.toLowerCase().includes('user') ||
          cookieName.toLowerCase().includes('login') ||
          cookieName.toLowerCase().includes('jwt')
        )) {
          cookiesToRemove.push(cookieName)
        }
      })
      
      cookiesToRemove.forEach(cookieName => {
        // 尝试不同的路径和域名组合来清除 Cookie
        const paths = ['/', window.location.pathname]
        const domains = [window.location.hostname, '.' + window.location.hostname]
        
        paths.forEach(path => {
          domains.forEach(domain => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`
          })
        })
        
        console.log(`🧹 强制清除 Cookie: ${cookieName}`)
      })
      
      if (cookiesToRemove.length > 0) {
        console.log('✅ 强制清除的 Cookie:', cookiesToRemove)
      }
    } catch (error) {
      console.warn('⚠️ 清除 Cookie 时出错:', error)
    }
    
    console.log('✅ 所有认证 Cookie 已清除')
  },

  // 清除所有 Cookie（用于登录前完全清理）
  clearAllCookies(): void {
    console.log('🧹 清除所有 Cookie...')
    
    try {
      const allCookies = document.cookie.split(';')
      const cookiesToRemove: string[] = []
      
      allCookies.forEach(cookie => {
        const cookieName = cookie.trim().split('=')[0]
        if (cookieName) {
          cookiesToRemove.push(cookieName)
        }
      })
      
      cookiesToRemove.forEach(cookieName => {
        // 尝试不同的路径和域名组合来清除 Cookie
        const paths = ['/', window.location.pathname]
        const domains = [window.location.hostname, '.' + window.location.hostname]
        
        paths.forEach(path => {
          domains.forEach(domain => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`
          })
        })
        
        console.log(`🧹 清除所有 Cookie: ${cookieName}`)
      })
      
      console.log('✅ 所有 Cookie 已清除:', cookiesToRemove)
    } catch (error) {
      console.warn('⚠️ 清除所有 Cookie 时出错:', error)
    }
  }
};
