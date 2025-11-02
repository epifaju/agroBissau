// Polyfill for Web APIs used by Next.js (must be before any imports)
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      this.headers = new Headers(init.headers || {})
      this.ok = this.status >= 200 && this.status < 300
    }
    
    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
    }
    
    async text() {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
    }
  }
}

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init.method || 'GET'
      this.headers = new Headers(init.headers || {})
      this.body = init.body || null
    }
  }
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this.map = new Map()
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.map.set(key.toLowerCase(), value)
        })
      }
    }
    
    get(name) {
      return this.map.get(name.toLowerCase()) || null
    }
    
    set(name, value) {
      this.map.set(name.toLowerCase(), value)
    }
    
    has(name) {
      return this.map.has(name.toLowerCase())
    }
  }
}

// Mock Next.js server exports
// NextResponse is a class that extends Response with static methods
jest.mock('next/server', () => {
  // Create a proper class that extends Response
  class MockNextResponse extends Response {
    // Static method for JSON responses
    static json(body, init = {}) {
      const status = init?.status || 200
      const headersInit = init?.headers || {}
      const headers = new Headers({
        'Content-Type': 'application/json',
        ...headersInit,
      })
      return new Response(JSON.stringify(body), {
        status,
        headers,
      })
    }
    
    // Static method for redirects
    static redirect(url, init = {}) {
      const status = init?.status || 307
      const headersInit = init?.headers || {}
      const headers = new Headers({
        Location: url,
        ...headersInit,
      })
      return new Response(null, {
        status,
        headers,
      })
    }
  }
  
  // NextRequest is also a class that extends Request
  class MockNextRequest extends Request {}
  
  return {
    NextResponse: MockNextResponse,
    NextRequest: MockNextRequest,
  }
})

// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock environment variables
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'
