import type { Config } from 'tailwindcss';
// Tokens sampled from the supplied dashboard export (±2–4 per channel, JPEG). 'tint' colors are derived, see README.
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {
    fontFamily: { sans: ['var(--font-raleway)', 'system-ui', 'sans-serif'] },
    colors: {
      page: '#0e0e16', s1: '#141720', s2: '#181a26', s2b: '#1b1d29', s3: '#1f232f', icon: '#252734',
      line: '#3a3a46', primary: '#5542f6', soft: '#9b90f9', hl: '#28264e', ink2: '#bdbfcd',
      ok: '#44d161', okbg: '#003000', delta: '#3ea645', danger: '#ff5a5f',
      warn: '#f5b84a', warnbg: '#3a2a00', dangerbg: '#3a0d12',
    },
    borderRadius: { card: '24px', btn: '10px' },
  } },
} satisfies Config;
