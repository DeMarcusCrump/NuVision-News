require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// CORS restricted to localhost for demo safety
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

const HF_API_KEY = process.env.HF_API_KEY;
if (!HF_API_KEY) {
  console.warn('Warning: HF_API_KEY not set. Inference endpoints will return 503 unless configured.');
}

const HF_BASE = 'https://api-inference.huggingface.co/models';

const proxy = async (model, body) => {
  if (!HF_API_KEY) return { status: 503, body: { error: 'HF_API_KEY not configured' } };
  const res = await fetch(`${HF_BASE}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return { status: res.status, body: json };
  } catch (e) {
    return { status: res.status, body: { raw: text } };
  }
};

app.post('/api/sentiment', async (req, res) => {
  const { text } = req.body;
  const model = 'distilbert-base-uncased-finetuned-sst-2-english';
  const result = await proxy(model, { inputs: text });
  res.status(result.status).json(result.body);
});

// Simple file-backed cache implementation for summaries
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const CACHE_FILE = path.join(__dirname, 'cache.json');
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days
const MAX_ENTRIES = 2000;

let fileCache = new Map();

function loadCacheFromDisk() {
  try {
    if (!fs.existsSync(CACHE_FILE)) return;
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    const obj = JSON.parse(raw || '{}');
    fileCache = new Map(Object.entries(obj));
    // Convert stored JSON into proper objects
    for (const [k, v] of fileCache.entries()) {
      try {
        const parsed = typeof v === 'string' ? JSON.parse(v) : v;
        fileCache.set(k, parsed);
      } catch (e) {
        fileCache.delete(k);
      }
    }
  } catch (e) {
    console.warn('Failed to load cache from disk:', e);
  }
}

function persistCacheToDisk() {
  try {
    const obj = Object.fromEntries(fileCache);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj), 'utf8');
  } catch (e) {
    console.warn('Failed to persist cache to disk:', e);
  }
}

loadCacheFromDisk();

// Basic rate limiter (per-ip simple sliding window)
const rateMap = new Map();
function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const WINDOW = 60 * 1000; // 1 minute
  const LIMIT = 30; // requests per minute
  let entry = rateMap.get(ip);
  if (!entry) entry = { ts: now, count: 0 };
  if (now - entry.ts > WINDOW) {
    entry.ts = now; entry.count = 1;
  } else {
    entry.count += 1;
  }
  rateMap.set(ip, entry);
  if (entry.count > LIMIT) {
    res.status(429).json({ error: 'rate_limited', message: 'Too many requests, slow down.' });
    return;
  }
  next();
}

app.post('/api/summarize', rateLimiter, async (req, res) => {
  const { text, max_length = 130 } = req.body || {};
  const model = 'sshleifer/distilbart-cnn-12-6';
  if (!text) return res.status(400).json({ error: 'missing_text' });
  try {
    const key = crypto.createHash('sha256').update(model + '::' + max_length + '::' + text).digest('hex');
    const entry = fileCache.get(key);
    if (entry && (Date.now() - entry.ts) < CACHE_TTL) {
      return res.status(200).json(entry.value);
    }

    const result = await proxy(model, { inputs: text, parameters: { max_length } });
    if (result.status >= 200 && result.status < 300) {
      try {
        fileCache.set(key, { ts: Date.now(), value: result.body });
        // cap size
        if (fileCache.size > MAX_ENTRIES) {
          const oldestKey = fileCache.keys().next().value;
          fileCache.delete(oldestKey);
        }
        persistCacheToDisk();
      } catch (e) {
        // ignore cache set failures
      }
    }
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.warn('Summary error:', err);
    const result = await proxy(model, { inputs: text, parameters: { max_length } });
    return res.status(result.status).json(result.body);
  }
});

app.post('/api/ner', async (req, res) => {
  const { text } = req.body;
  const model = 'dbmdz/bert-large-cased-finetuned-conll03-english';
  const result = await proxy(model, { inputs: text });
  res.status(result.status).json(result.body);
});

app.post('/api/embedding', async (req, res) => {
  const { text } = req.body;
  const model = 'sentence-transformers/all-MiniLM-L6-v2';
  const result = await proxy(model, { inputs: text });
  res.status(result.status).json(result.body);
});

app.post('/api/qa', async (req, res) => {
  const { question, context } = req.body;
  // For QA use a QA-specific model
  const model = 'deepset/roberta-base-squad2';
  const result = await proxy(model, { inputs: { question, context } });
  res.status(result.status).json(result.body);
});

// Health endpoint
app.get('/api/health', (req, res) => {
  const ok = !!HF_API_KEY;
  res.json({ ok, hf_key_present: ok, timestamp: Date.now() });
});

module.exports = app;

// Admin endpoints (simple token protection)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || null;
function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) return res.status(403).json({ error: 'admin_not_configured' });
  const tok = req.headers['x-admin-token'] || req.query.admin_token;
  if (!tok || tok !== ADMIN_TOKEN) return res.status(403).json({ error: 'forbidden' });
  return next();
}

app.get('/admin/cache/stats', requireAdmin, (req, res) => {
  let total = 0;
  for (const [k, v] of fileCache) total += 1;
  res.json({ entries: total, max_entries: MAX_ENTRIES });
});

app.post('/admin/cache/clear', requireAdmin, (req, res) => {
  fileCache.clear();
  persistCacheToDisk();
  res.json({ ok: true });
});


