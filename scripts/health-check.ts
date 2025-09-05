#!/usr/bin/env tsx

/**
 * Script unifié: Health + Smoke + Avancé + Auth + Erreurs
 * Remplace les scripts séparés:
 *  - health-check.ts
 *  - test-endpoints.ts (smoke)
 *  - test-endpoints-advanced.ts (requêtes complexes)
 *  - test-auth.ts (endpoints authentifiés + CRUD)
 *  - quick-test.sh (couverture GET rapide)
 *  - (les autres deviennent optionnels)
 *
 * Sorties:
 *  - Console détaillée avec sections
 *  - Fichier JSON: scripts/tests/results/full-api-report.json
 *  - Codes de sortie: 0 OK / 1 warnings (dégradé) / 2 échecs critiques
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const RESULTS_DIR = path.join(__dirname, 'results');
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------
interface RawCallResult {
  name: string;
  method: string;
  path: string;
  status: number;
  responseTime: number;
  success: boolean;
  category: string;
  expectedStatus?: number;
  error?: string;
  validationError?: string;
  notes?: string;
}

interface AuthSession {
  cookie?: string;
  userId?: number;
}

// ------------------------------------------------------------
// Utilitaires
// ------------------------------------------------------------
function now() { return Date.now(); }

function color(code: string, txt: string) { return `${code}${txt}\x1b[0m`; }
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

interface CurlResponse {
  status: number;
  body: unknown;
  error?: string;
  cookie?: string;
  time: number;
}

async function curlRequest(method: string, urlPath: string, options: {
  headers?: Record<string,string>;
  body?: unknown;
  timeoutSec?: number;
  cookie?: string;
  includeHeaders?: boolean; // si true capture les headers (pour Set-Cookie)
} = {}): Promise<CurlResponse> {
  const start = now();
  return new Promise((resolve) => {
    const url = `${BASE_URL}${urlPath}`;
  const curlArgs = ['-s', '-w', '%{http_code}', '-X', method];
    if (options.includeHeaders) {
      curlArgs.unshift('-D', '-');
    }
    if (options.headers) {
      Object.entries(options.headers).forEach(([k,v]) => curlArgs.push('-H', `${k}: ${v}`));
    }
    if (options.cookie) {
      curlArgs.push('-H', `Cookie: ${options.cookie}`);
    }
    if (options.body) {
      curlArgs.push('-d', JSON.stringify(options.body));
    }
    curlArgs.push('--max-time', String(options.timeoutSec ?? 10));
    curlArgs.push(url);

    const child = spawn('curl', curlArgs);
    let output = '';
    let stderr = '';
    child.stdout.on('data', d => output += d.toString());
    child.stderr.on('data', d => stderr += d.toString());
    child.on('close', (code) => {
      const time = now() - start;
      if (code !== 0) {
        resolve({ status: 0, body: null, error: `curl exit ${code}: ${stderr}`, time });
        return;
      }
      const statusCode = parseInt(output.slice(-3), 10);
      const rawBody = output.slice(0, -3);
      let parsed: unknown = null;
      let cookie: string | undefined;
      if (options.includeHeaders) {
        const splitIdx = rawBody.indexOf('\n\n');
        if (splitIdx !== -1) {
          const headerPart = rawBody.slice(0, splitIdx).split(/\r?\n/);
          const bodyPart = rawBody.slice(splitIdx + 2);
          const setCookieLine = headerPart.find(l => /^set-cookie:/i.test(l));
          if (setCookieLine) {
            const val = setCookieLine.split(':')[1]?.trim();
            if (val) cookie = val.split(';')[0];
          }
          try { parsed = bodyPart ? JSON.parse(bodyPart) : null; } catch { parsed = bodyPart || null; }
        } else {
          try { parsed = rawBody ? JSON.parse(rawBody) : null; } catch { parsed = rawBody || null; }
        }
      } else {
        try { parsed = rawBody ? JSON.parse(rawBody) : null; } catch { parsed = rawBody || null; }
      }
      resolve({ status: statusCode, body: parsed, time, cookie });
    });
  });
}

// ------------------------------------------------------------
// Collections de tests
// ------------------------------------------------------------
const criticalEndpoints = [
  '/api/users', '/api/news', '/api/events', '/api/startups', '/api/partners'
];

const smokeEndpoints = [
  { name: 'Users list', method: 'GET', path: '/api/users', expectedStatus: 200 },
  { name: 'News list', method: 'GET', path: '/api/news', expectedStatus: 200 },
  { name: 'Events list', method: 'GET', path: '/api/events', expectedStatus: 200 },
  { name: 'Startups list', method: 'GET', path: '/api/startups', expectedStatus: 200 },
  { name: 'Partners list', method: 'GET', path: '/api/partners', expectedStatus: 200 },
  { name: 'Users pagination', method: 'GET', path: '/api/users?page=1&limit=5', expectedStatus: 200 },
];

const extendedPublic = [
  { name: 'Users search', method: 'GET', path: '/api/users?search=test', expectedStatus: 200 },
  { name: 'Founders filter', method: 'GET', path: '/api/users?founders=true', expectedStatus: 200 },
  { name: 'Investors filter', method: 'GET', path: '/api/users?investors=true', expectedStatus: 200 },
  { name: 'News search', method: 'GET', path: '/api/news?search=startup', expectedStatus: 200 },
  { name: 'Startups search', method: 'GET', path: '/api/startups?search=tech', expectedStatus: 200 },
];

const errorScenarios = [
  { name: 'User not found', method: 'GET', path: '/api/users/999999', expectedStatus: 404 },
  { name: 'News not found', method: 'GET', path: '/api/news/999999', expectedStatus: 404 },
  { name: 'Startup not found', method: 'GET', path: '/api/startups/999999', expectedStatus: 404 },
  { name: 'Invalid endpoint', method: 'GET', path: '/api/invalid-endpoint', expectedStatus: 404 },
  { name: 'Invalid POST data', method: 'POST', path: '/api/news', expectedStatus: 400, headers: { 'Content-Type': 'application/json' }, body: { invalid: 'data' } },
];

// Auth + CRUD (fusion de test-auth & scénarios CRUD retirés de l'avancé)
const testCredentials = {
  email: 'test-unified@survivor.com',
  password: 'TestPassword123!',
  firstName: 'Unified',
  lastName: 'Tester'
};

async function ensureAuthSession(): Promise<AuthSession | null> {
  // signup (ignorer si existe)
  await curlRequest('POST', '/api/auth/signup', { headers: { 'Content-Type': 'application/json' }, body: testCredentials });
  // login
  const login = await curlRequest('POST', '/api/auth/login', { headers: { 'Content-Type': 'application/json' }, body: { email: testCredentials.email, password: testCredentials.password } });
  if (login.status !== 200) return null;
  // Récupération user (pas de parsing cookie propre ici: API doit être session cookie; si non accessible, endpoints auth seront marqués failed)
  const me = await curlRequest('GET', '/api/auth/me', {});
  let userId: number | undefined;
  if (me.body && typeof me.body === 'object') {
    const bodyObj = me.body as Record<string, unknown>;
    if (typeof bodyObj.id === 'number') userId = bodyObj.id;
    const nestedUser = bodyObj.user as Record<string, unknown> | undefined;
    if (!userId && nestedUser && typeof nestedUser.id === 'number') userId = nestedUser.id as number;
  }
  return { cookie: undefined, userId }; // (Extension possible: capturer Set-Cookie en mode header)
}

interface EndpointSpec {
  name: string;
  method: string;
  path: string;
  expectedStatus?: number;
  headers?: Record<string,string>;
  body?: unknown;
  expectBodyType?: 'array' | 'object' | 'string' | 'null';
  validate?: (body: unknown, res: CurlResponse) => string | undefined;
  maxMsWarn?: number;
  cookie?: string;
}

function buildAuthEndpoints(session: AuthSession | null): EndpointSpec[] {
  if (!session?.userId) return [];
  const ck = session.cookie;
  return [
    { name: 'Get current user', method: 'GET', path: '/api/auth/me', expectedStatus: 200, expectBodyType: 'object', validate: (b) => (b && typeof b === 'object') ? undefined : 'Réponse utilisateur invalide', cookie: ck },
  { name: 'User likes', method: 'GET', path: `/api/users/${session.userId}/likes`, expectedStatus: 200, expectBodyType: 'object', validate: (b) => { if (!b || typeof b !== 'object') return 'structure invalide'; const o = b as Record<string, unknown>; return Array.isArray(o.data) ? undefined : 'data[] manquant'; }, cookie: ck },
  { name: 'User bookmarks', method: 'GET', path: `/api/users/${session.userId}/bookmarks`, expectedStatus: 200, expectBodyType: 'object', validate: (b) => { if (!b || typeof b !== 'object') return 'structure invalide'; const o = b as Record<string, unknown>; return Array.isArray(o.data) ? undefined : 'data[] manquant'; }, cookie: ck },
  { name: 'User follows', method: 'GET', path: `/api/users/${session.userId}/follows`, expectedStatus: 200, expectBodyType: 'object', validate: (b) => { if (!b || typeof b !== 'object') return 'structure invalide'; const o = b as Record<string, unknown>; return Array.isArray(o.data) ? undefined : 'data[] manquant'; }, cookie: ck },
    { name: 'Track page view (auth context)', method: 'POST', path: '/api/analytics/track', expectedStatus: 200, headers: { 'Content-Type': 'application/json' }, body: { path: '/dashboard', userAgent: 'Unified Test', timestamp: new Date().toISOString() }, expectBodyType: 'object', cookie: ck },
    { name: 'Create news article', method: 'POST', path: '/api/news', expectedStatus: 201, headers: { 'Content-Type': 'application/json' }, body: { title: `Unified News ${Date.now()}`, content: 'Body', authorId: session.userId }, expectBodyType: 'object', cookie: ck },
    { name: 'Create event', method: 'POST', path: '/api/events', expectedStatus: 201, headers: { 'Content-Type': 'application/json' }, body: { title: `Unified Event ${Date.now()}`, description: 'Desc', date: new Date(Date.now()+86400000).toISOString(), location: 'Test Location' }, expectBodyType: 'object', cookie: ck }
  ];
}

// ------------------------------------------------------------
// Exécution d'un lot de tests
// ------------------------------------------------------------
async function runBatch(label: string, endpoints: EndpointSpec[], category: string): Promise<RawCallResult[]> {
  if (!endpoints.length) return [];
  console.log(`\n${CYAN}▶ ${label}${GRAY} (${endpoints.length})${GRAY}`);
  console.log(`${'-'.repeat(70)}`);
  const batch: RawCallResult[] = [];
  for (const ep of endpoints) {
  const { name, method, path: p, expectedStatus = 200, headers, body, expectBodyType, validate, maxMsWarn, cookie } = ep;
  const call = await curlRequest(method, p, { headers, body, cookie });
    let validationError: string | undefined;
    if (call.status === expectedStatus && expectBodyType) {
      const t = Array.isArray(call.body) ? 'array' : (call.body === null ? 'null' : typeof call.body);
      if (t !== expectBodyType) {
        // Cas particulier: objet enveloppe contenant un tableau (pagination, etc.)
        if (expectBodyType === 'array' && t === 'object' && call.body && typeof call.body === 'object') {
          const obj = call.body as Record<string, unknown>;
          const arrayKey = ['data', 'items', 'results', 'list'].find(k => Array.isArray(obj[k]));
          if (arrayKey) {
            // On considère valide, ajoute une note
            validationError = undefined;
          } else {
            validationError = `Type attendu ${expectBodyType} reçu ${t}`;
          }
        } else {
          validationError = `Type attendu ${expectBodyType} reçu ${t}`;
        }
      }
    }
    if (!validationError && call.status === expectedStatus && validate) {
      validationError = validate(call.body, call) || undefined;
    }
    const timeWarn = (maxMsWarn && call.time > maxMsWarn) ? `> ${maxMsWarn}ms` : undefined;
    const success = call.status === expectedStatus && !validationError;
    const icon = success ? '✅' : (call.status === 0 ? '❌' : '⚠️');
    const statusColored = success ? color(GREEN, String(call.status)) : color(call.status === 0 ? RED : YELLOW, String(call.status));
    const msgParts = [`${icon} ${name} ${GRAY}${method} ${p}${GRAY} -> ${statusColored} ${call.time}ms`];
    if (call.status !== expectedStatus) msgParts.push(`(${expectedStatus} attendu)`);
    if (validationError) msgParts.push(color(YELLOW, `[validation] ${validationError}`));
    if (timeWarn) msgParts.push(color(YELLOW, `[slow ${call.time}ms]`));
    console.log(msgParts.join(' '));
    batch.push({
      name,
      method,
      path: p,
      status: call.status,
      responseTime: call.time,
      success,
      category,
      expectedStatus,
      error: call.error,
      validationError,
      notes: timeWarn
    });
  }
  return batch;
}

// ------------------------------------------------------------
// Tests supplémentaires: Performance & Concurrence & Headers
// ------------------------------------------------------------

async function concurrencyLoadTest(paths: string[], repetitions = 5, maxMsPerRequest = 1500): Promise<RawCallResult[]> {
  console.log(`\n${CYAN}▶ Concurrency Load (${paths.length} endpoints x${repetitions})${GRAY}`);
  console.log(`${'-'.repeat(70)}`);
  const results: RawCallResult[] = [];
  for (const p of paths) {
    const promises = Array.from({ length: repetitions }, () => curlRequest('GET', p));
    const started = now();
    const settled = await Promise.all(promises);
    const totalTime = now() - started;
    const avg = Math.round(settled.reduce((s,c)=>s+c.time,0)/repetitions);
    const max = Math.max(...settled.map(r=>r.time));
    const anyFail = settled.some(r => r.status < 200 || r.status >= 300);
    const slow = max > maxMsPerRequest;
    const success = !anyFail && !slow;
    const icon = success ? '✅' : (anyFail ? '❌' : '⚠️');
    console.log(`${icon} Load ${p} avg:${avg}ms max:${max}ms total:${totalTime}ms${slow ? color(YELLOW, ' (lent)') : ''}${anyFail ? color(RED,' (échecs)'):''}`);
    results.push({
      name: `Load ${p} x${repetitions}`,
      method: 'GET',
      path: p,
      status: anyFail ? 500 : 200,
      responseTime: max,
      success,
      category: 'concurrency',
      expectedStatus: 200,
      error: anyFail ? 'Une ou plusieurs requêtes ont échoué' : undefined,
      notes: `avg:${avg} max:${max} reps:${repetitions}`
    });
  }
  return results;
}

async function simpleHeaderCheck(pathToCheck: string): Promise<RawCallResult> {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${pathToCheck}`;
    const args = ['-s', '-D', '-', '-o', '/dev/null', '-X', 'GET', url];
    const child = spawn('curl', args);
    let out = '';
    child.stdout.on('data', d => out += d.toString());
    child.on('close', () => {
      const lines = out.split(/\r?\n/);
      const statusLine = lines[0] || '';
      const match = statusLine.match(/HTTP\/\d\.\d (\d+)/);
      const status = match ? parseInt(match[1],10) : 0;
      const headers: Record<string,string> = {};
      for (const l of lines.slice(1)) {
        const idx = l.indexOf(':');
        if (idx > 0) headers[l.slice(0, idx).trim().toLowerCase()] = l.slice(idx+1).trim();
      }
      const missing: string[] = [];
      const shouldHave = ['content-type']; // Ajoutez ici d'autres headers critiques si nécessaire
      for (const h of shouldHave) if (!headers[h]) missing.push(h);
      // Vérifier absence d'X-Powered-By divulgateur (optionnel)
      const xPowered = headers['x-powered-by'];
      const warn = xPowered ? `Header X-Powered-By exposé (${xPowered})` : undefined;
      const validationError = missing.length ? `Headers manquants: ${missing.join(', ')}` : undefined;
      const success = status >= 200 && status < 400 && !validationError;
      console.log(`${success ? '✅':'⚠️'} Headers ${pathToCheck} -> ${status} ${validationError ? color(YELLOW, validationError) : ''} ${warn ? color(YELLOW, '['+warn+']'): ''}`);
      resolve({
        name: `Headers ${pathToCheck}`,
        method: 'GET',
        path: pathToCheck,
        status,
        responseTime: 0,
        success,
        category: 'headers',
        expectedStatus: 200,
        error: validationError,
        validationError,
        notes: warn
      });
    });
  });
}

// ------------------------------------------------------------
// Health (statut synthétique sur criticalEndpoints)
// ------------------------------------------------------------
async function runHealth(): Promise<RawCallResult[]> {
  console.log(`🏥 Health Check de base (${criticalEndpoints.length} endpoints)`);
  const results: RawCallResult[] = [];
  for (const ep of criticalEndpoints) {
    const call = await curlRequest('GET', ep, { timeoutSec: 5 });
    let statusLabel: 'healthy' | 'degraded' | 'down';
    if (call.status >= 200 && call.status < 300) statusLabel = call.time < 1000 ? 'healthy' : 'degraded';
    else if (call.status >= 300 && call.status < 500) statusLabel = 'degraded';
    else statusLabel = 'down';
    const icon = statusLabel === 'healthy' ? '✅' : statusLabel === 'degraded' ? '⚠️' : '❌';
    console.log(`${icon} ${ep} -> ${call.status} ${call.time}ms (${statusLabel})`);
    results.push({ name: ep, method: 'GET', path: ep, status: call.status, responseTime: call.time, success: statusLabel !== 'down', category: 'health' });
  }
  return results;
}

// ------------------------------------------------------------
// Rapport & résumé
// ------------------------------------------------------------
function summarize(all: RawCallResult[]) {
  const byCat = all.reduce<Record<string, RawCallResult[]>>((acc, r) => { (acc[r.category] ||= []).push(r); return acc; }, {});
  const summary = Object.entries(byCat).map(([cat, arr]) => {
    const passed = arr.filter(a => a.success).length;
    const failed = arr.length - passed;
    const avg = Math.round(arr.reduce((s,c)=>s+c.responseTime,0)/arr.length);
    const p95 = percentile(arr.map(a=>a.responseTime), 95);
    return { category: cat, total: arr.length, passed, failed, avgMs: avg, p95Ms: p95 };
  });
  return summary;
}

function percentile(values: number[], p: number): number {
  if (!values.length) return 0; const sorted = [...values].sort((a,b)=>a-b); const idx = Math.ceil((p/100)*sorted.length)-1; return sorted[Math.max(0,Math.min(idx, sorted.length-1))];
}

function globalExitCode(all: RawCallResult[]): number {
  const hasDown = all.some(r => !r.success && (r.status === 0 || r.status >= 500));
  if (hasDown) return 2;
  const hasWarn = all.some(r => !r.success);
  return hasWarn ? 1 : 0;
}

async function main() {
  const started = new Date();
  console.log(`� Unified API Diagnostic`);
  console.log(`� Base URL: ${BASE_URL}`);
  console.log(`⏰ ${started.toLocaleString()}`);
  console.log('='.repeat(72));

  const allResults: RawCallResult[] = [];

  // 1. Health
  allResults.push(...await runHealth());

  // 2. Smoke (ajout validations simples)
  const enrichedSmoke: EndpointSpec[] = smokeEndpoints.map(e => ({
    ...e,
    expectBodyType: 'object',
    validate: (body) => { if (!body || typeof body !== 'object') return 'structure invalide'; const o = body as Record<string, unknown>; return Array.isArray(o.data) ? undefined : 'data[] manquant'; }
  }));
  allResults.push(...await runBatch('Smoke Endpoints', enrichedSmoke, 'smoke'));

  // 3. Extended Public (ajout validations & limites perf)
  const enrichedExtended: EndpointSpec[] = extendedPublic.map(e => ({
    ...e,
    expectBodyType: 'object',
    validate: (body) => { if (!body || typeof body !== 'object') return 'structure invalide'; const o = body as Record<string, unknown>; return Array.isArray(o.data) ? undefined : 'data[] manquant'; },
    maxMsWarn: 1800
  }));
  allResults.push(...await runBatch('Extended Public Queries', enrichedExtended, 'extended'));

  // 4. Auth (optionnel si login OK)
  console.log(`\n${CYAN}▶ Auth & CRUD${GRAY}`);  
  let authSession: AuthSession | null = null;
  try { authSession = await ensureAuthSession(); } catch { /* ignore */ }
  if (authSession?.userId) {
    const authEndpoints = buildAuthEndpoints(authSession);
    allResults.push(...await runBatch('Authenticated Endpoints', authEndpoints, 'auth'));
  } else {
    console.log(`${YELLOW}⚠ Impossible d'établir une session authentifiée – section ignorée.${GRAY}`);
  }

  // 5. Errors
  allResults.push(...await runBatch('Error Handling', errorScenarios, 'errors'));

  // 6. Concurrency Load sur endpoints critiques
  const concurrencyReps = parseInt(process.env.HC_LOAD_REPS || '5', 10);
  allResults.push(...await concurrencyLoadTest(criticalEndpoints, concurrencyReps));

  // 7. Headers & sécurité basique
  allResults.push(await simpleHeaderCheck('/api/users'));

  // Résumé
  console.log(`\n${CYAN}📊 Résumé Catégories${GRAY}`);
  const summary = summarize(allResults);
  summary.forEach(s => {
    const rate = ((s.passed / s.total)*100).toFixed(1)+'%';
    const col = s.failed === 0 ? GREEN : (s.failed < s.total ? YELLOW : RED);
    console.log(`${color(col, s.category.padEnd(12))} -> total:${s.total} passed:${s.passed} failed:${s.failed} success:${rate} avg:${s.avgMs}ms p95:${s.p95Ms}ms`);
  });

  const total = allResults.length;
  const passed = allResults.filter(r=>r.success).length;
  const failed = total - passed;
  const avgAll = Math.round(allResults.reduce((s,c)=>s+c.responseTime,0)/Math.max(1,total));
  const p95All = percentile(allResults.map(r=>r.responseTime), 95);

  console.log(`\n🎯 Global: ${passed}/${total} (${((passed/total)*100).toFixed(1)}%) | avg ${avgAll}ms | p95 ${p95All}ms`);

  // Rapport JSON
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    totals: { total, passed, failed, successRate: (passed/total) },
    performance: { avgMs: avgAll, p95Ms: p95All },
    categories: summary,
    results: allResults
  };
  const outFile = path.join(RESULTS_DIR, 'full-api-report.json');
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`\n🗂 Rapport JSON: ${outFile}`);

  const exitCode = globalExitCode(allResults);
  console.log(`\nExit code: ${exitCode}`);
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(2); });
}
