const fmtM = n => Math.round(n).toLocaleString('th-TH');

// App State
const state = {
  currentPlayer: null,
  isAdmin: false,
  currentView: 'schedule',
  gw: null,          // gameweek being viewed — every fetch is scoped to it
  standings: [],     // settled months: one row per player per month
  periodSlips: [],   // every slip of the current unsettled month (summary tab)
  matches: {},
  players: [],
  slips: [],
  allSlips: [],
  pendingSlips: [], // other players' unresolved slips only — cheap fallback when allSlips isn't loaded
  // Lines + odds loaded from Sheet
  ahLines: {},
  ouLines: {},
  ahOddsH: {},
  ahOddsA: {},
  ouOddsO: {},
  ouOddsU: {},
  cornerLines: {},
  cornerOddsO: {},
  cornerOddsU: {},
  cardLines: {},
  cardOddsO: {},
  cardOddsU: {},
  // Outright champion bet: dormant for EPL. getChampionTeams() looks for the WC
  // semi-finals, finds nothing, and renderChampionCard() renders '' — kept (not
  // deleted) so a title-winner bet can be switched back on later.
  championOdds: {},
};

function parsePicks(s) {
  if (s.picks && Array.isArray(s.picks)) return s;
  try { return { ...s, picks: JSON.parse(s.picks_json || '[]') }; } catch (e) { return { ...s, picks: [] }; }
}

function isMatchToday(match) {
  // "วันแข่ง" เริ่มที่ 14:00 ไทย — shift boundary จาก midnight เป็น 14:00
  const THAI = 7 * 3600000;
  const CUT  = 14 * 3600000;
  const matchDay = Math.floor((kickoffUtc(match.date).getTime() + THAI - CUT) / 86400000);
  const nowDay   = Math.floor((Date.now()                     + THAI - CUT) / 86400000);
  return matchDay === nowDay;
}

// Check if match is locked (kickoff passed OR has score OR postponed)
function isMatchLocked(match) {
  const thaiTime = kickoffUtc(match.date);
  const timePassed = new Date() >= new Date(thaiTime.getTime() - 10 * 60 * 1000);
  const result = state.matches[match.id];
  const hasScore = result && typeof result.team1_score === 'number' && typeof result.team2_score === 'number';
  return timePassed || hasScore || isMatchPostponed(match);
}

// A postponed EPL match takes no new bets. Slips already holding it stay pending
// (no score = unresolved) and are left out of settlement until it is replayed.
function isMatchPostponed(match) {
  const result = state.matches[match.id];
  return !!(result && result.match_status === 'postponed');
}

// Format AH line: only show on the favorite side (negative = ต่อ)
function formatAhFav(line, isHome) {
  const num = parseFloat(line);
  if (isNaN(num) || num === 0) return '';
  if (num < 0) return isHome ? '' + num : '+' + Math.abs(num);
  return isHome ? '+' + num : '-' + num;
}

function getAllSlips() {
  if (state.allSlips.length) return state.allSlips;
  // Cheap fallback: own full history + everyone else's still-pending slips.
  // Missing other players' settled history — fine for the betting tab, but
  // callers that need full history (summary/insight) lazy-load state.allSlips first.
  const pending = (state.pendingSlips || []).filter(s => s.player !== state.currentPlayer);
  return [...(state.slips || []), ...pending];
}

// Slip source for the summary/insight tabs: the whole current month. Falls back
// to the gameweek in state.allSlips before the month has loaded.
function getPeriodSlips() {
  return state.periodSlips.length ? state.periodSlips : getAllSlips();
}

// What a player carries into a month from `standings` — settled money and the
// win/loss streak they were on. Without this, monthly archiving would silently
// reset every 🔥/🧊 badge and the season total on the 1st.
//
// `beforePeriod` excludes that period's own row, which matters when settling a
// month a second time: the row written by the first run is already in standings,
// and summing it in would double-count the money and re-seed the streak.
function getSeasonCarry(playerId, beforePeriod) {
  const rows = (state.standings || []).filter(r =>
    r.player === playerId && (!beforePeriod || String(r.period) < String(beforePeriod)));
  if (!rows.length) return { money: 0, streakVal: 0, streakDir: 0, hasHistory: false };
  rows.sort((a, b) => String(a.period).localeCompare(String(b.period)));
  const last = rows[rows.length - 1];
  const streak = Number(last.streak) || 0;
  return {
    money: rows.reduce((sum, r) => sum + (Number(r.settled_money) || 0), 0),
    streakVal: Math.abs(streak),
    streakDir: streak > 0 ? 1 : streak < 0 ? -1 : 0,
    hasHistory: true,
  };
}

function getDisplayName(playerId) {
  if (!playerId) return '';
  const p = state.players.find(p => p.player_id === playerId);
  return p ? p.display_name : playerId;
}

const STATUS_CONFIG = {
  pending:   { color: 'var(--secondary)', th: 'รอผล',   en: 'Pending'  },
  approved:  { color: 'var(--accent)',    th: 'อนุมัติ', en: 'Approved' },
  won:       { color: 'var(--accent)',    th: 'ชนะ',    en: 'Won'      },
  lost:      { color: 'var(--secondary)', th: 'แพ้',    en: 'Lost'     },
  cancelled: { color: 'var(--text-muted)',th: 'ยกเลิก', en: 'Cancelled'},
};

function formatPickLabel(p, lang) {
  if (p.type === 'corner') return `⛳ มุม${p.pick === 'over' ? 'สูง' : 'ต่ำ'} ${p.line || ''}`.trim();
  if (p.type === 'card') return `🟨 ใบ${p.pick === 'over' ? 'สูง' : 'ต่ำ'} ${p.line || ''}`.trim();
  if (p.type === 'champion') { const t = TEAMS[p.pick]; return `🏆 ${t ? (lang === 'th' ? t.nameTh : t.name) : p.pick}`; }
  if (p.type === 'ou') return `${p.pick === 'over' ? 'สูง' : 'ต่ำ'} ${p.line || ''}`.trim();
  const m = state.matchById ? state.matchById[p.match_id] : MATCHES.find(x => x.id === p.match_id);
  const isHome = m ? p.pick === m.team1 : false;
  const picked = TEAMS[p.pick];
  const name = picked ? (lang === 'th' ? picked.nameTh : picked.name) : p.pick;
  const line = p.line ? formatAhFav(p.line, isHome) : '';
  return `${name}${line ? ' ' + line : ''}`;
}

// Build lines + odds from matches data (loaded from Sheet)
function buildLinesFromMatches() {
  state.ahLines = {};
  state.ouLines = {};
  state.ahOddsH = {};
  state.ahOddsA = {};
  state.ouOddsO = {};
  state.ouOddsU = {};
  state.cornerLines = {};
  state.cornerOddsO = {};
  state.cornerOddsU = {};
  state.cardLines = {};
  state.cardOddsO = {};
  state.cardOddsU = {};
  state.matchById = {};
  MATCHES.forEach(m => { state.matchById[m.id] = m; });

  Object.values(state.matches).forEach(m => {
    // The Sheet is the fixture source: EPL kickoffs get moved for TV, so a
    // date_th edited there wins over the generated one — even after slips exist
    // on that match.
    const local = state.matchById[m.match_id];
    if (local && m.date_th) local.date = String(m.date_th).slice(0, 16);

    if (m.ah_line != null && m.ah_line !== '') {
      state.ahLines[m.match_id] = String(m.ah_line);
      state.ahOddsH[m.match_id] = parseFloat(m.ah_odds_h) || 1.80;
      state.ahOddsA[m.match_id] = parseFloat(m.ah_odds_a) || 1.90;
    }
    if (m.ou_line != null && m.ou_line !== '') {
      state.ouLines[m.match_id] = String(m.ou_line);
      state.ouOddsO[m.match_id] = parseFloat(m.ou_odds_o) || 1.90;
      state.ouOddsU[m.match_id] = parseFloat(m.ou_odds_u) || 1.90;
    }
    if (m.corner_line != null && m.corner_line !== '') {
      state.cornerLines[m.match_id] = String(m.corner_line);
      state.cornerOddsO[m.match_id] = parseFloat(m.corner_odds_o) || 1.90;
      state.cornerOddsU[m.match_id] = parseFloat(m.corner_odds_u) || 1.90;
    }
    if (m.card_line != null && m.card_line !== '') {
      state.cardLines[m.match_id] = String(m.card_line);
      state.cardOddsO[m.match_id] = parseFloat(m.card_odds_o) || 1.90;
      state.cardOddsU[m.match_id] = parseFloat(m.card_odds_u) || 1.90;
    }
  });
}

// --- Router ---
function navigate(view) {
  state.currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const el = document.getElementById('view-' + view);
  if (el) {
    el.classList.remove('hidden');
    el.classList.remove('view-enter');
    void el.offsetWidth;
    el.classList.add('view-enter');
  }
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const activeTab = document.querySelector(`.nav-tab[href="#${view}"]`);
  if (activeTab) activeTab.classList.add('active');
  document.querySelectorAll('.btm-tab').forEach(t => t.classList.remove('active'));
  const activeBtm = document.querySelector(`.btm-tab[href="#${view}"]`);
  if (activeBtm) activeBtm.classList.add('active');
  renderCurrentView();
  window.scrollTo(0, 0);
}

async function renderCurrentView() {
  switch (state.currentView) {
    case 'schedule': renderSchedule(); break;
    case 'bet': renderBetting(); break;
    case 'summary': await renderSummaryLazy(); break;
    case 'odds': renderOdds(); break;
    case 'insight': renderInsight(); break;
  }
}

// The summary tab's unit is the month, not the gameweek: settled months come
// from `standings` (~10 rows each) and the running month from one `periodslips`
// read — the live slips tab IS the current period, since settled months are
// moved to slips_archive.
async function renderSummaryLazy() {
  const container = document.getElementById('view-summary');
  if (!state.periodSlips.length && API_BASE_URL && !state._fetchingPeriod) {
    state._fetchingPeriod = true;
    let sk = '';
    for (let i = 0; i < 4; i++) {
      sk += `<div class="skeleton-card"><div class="skeleton-line" style="height:18px;width:${40 + i * 10}%"></div><div class="skeleton-line" style="height:12px;width:60%"></div><div class="skeleton-line" style="height:12px;width:80%"></div></div>`;
    }
    container.innerHTML = sk;
    try {
      const [periodSlips, standings] = await Promise.all([
        fetchAPI('periodslips'),
        fetchAPI('standings'),
      ]);

      // This tab resolves a MONTH of slips, but state.matches only holds the 10
      // rows of the viewed gameweek — slips on any other gw would score as
      // pending. Fetch the matches of whatever period(s) the slips belong to
      // (normally one; two only while a month straddles settlement).
      const periods = [...new Set((periodSlips || []).map(s => s.period).filter(Boolean))];
      if (!periods.length) periods.push(GW_PERIOD[state.gw || currentGw()]);
      const matchSets = await Promise.all(periods.map(p => fetchAPI('periodmatches&period=' + p)));
      let merged = false;
      matchSets.forEach(ms => {
        if (!ms) return;
        // Merged by match_id — additive, never clobbers the gameweek rows
        ms.forEach(m => { state.matches[m.match_id] = m; });
        merged = true;
      });
      if (merged) buildLinesFromMatches();

      if (periodSlips) {
        state.periodSlips = periodSlips.map(parsePicks);
        try { localStorage.setItem('epl2627_periodslips', JSON.stringify({ t: Date.now(), d: periodSlips })); } catch (e) {}
      }
      if (standings) state.standings = standings;
    } finally {
      state._fetchingPeriod = false;
    }
  }
  renderSummary();
}

// --- Toast ---
function showToast(msg, duration) {
  duration = duration || 3000;
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden', 'toast-out');
  void toast.offsetWidth; // force reflow to restart animation
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => { toast.classList.add('hidden'); toast.classList.remove('toast-out'); }, 260);
  }, duration);
}

// --- Badge (admin: pending approve count) ---
function updateTabBadges() {
  const count = (state.isAdmin && state.allSlips.length)
    ? state.allSlips.filter(s => {
        if (s.player === state.currentPlayer) return false;
        const resolved = typeof resolveSlip === 'function' ? resolveSlip(s) : { status: s.status };
        const st = resolved.status;
        return (st === 'won' || st === 'lost') && s.status !== 'approved' && s.status !== 'cancelled';
      }).length
    : 0;
  document.querySelectorAll('.bet-badge').forEach(b => {
    if (count > 0) { b.textContent = count; b.classList.remove('hidden'); }
    else b.classList.add('hidden');
  });
}

// --- Loading ---
function showLoading() { document.getElementById('loading').classList.remove('hidden'); }
function hideLoading() { document.getElementById('loading').classList.add('hidden'); }

// --- Init ---
function init() {
  console.log('init() called');
  const debugEl = document.getElementById('debug-msg');
  if (debugEl) debugEl.remove();

  // Open on the gameweek that still has a match to come — every fetch below is
  // scoped to it, which is what keeps a 380-match season as cheap as one round.
  state.gw = currentGw();

  const savedPlayer = localStorage.getItem('epl2627_player');
  if (savedPlayer) state.currentPlayer = savedPlayer;
  if (localStorage.getItem('epl2627_admin') === 'true') state.isAdmin = true;

  window.addEventListener('hashchange', () => {
    const hash = location.hash.slice(1) || 'schedule';
    navigate(hash);
  });

  document.getElementById('lang-toggle').addEventListener('click', toggleLang);
  document.getElementById('lang-toggle').textContent = currentLang.toUpperCase();

  applyTranslations();
  updateAdminUI();

  // Load cached matches + players for instant first render
  try {
    const cm = JSON.parse(localStorage.getItem('epl2627_matches') || 'null');
    if (cm && Date.now() - cm.t < 10 * 60 * 1000 && cm.gw === state.gw) {
      cm.d.forEach(m => { state.matches[m.match_id] = m; });
      buildLinesFromMatches();
    }
    const cp = JSON.parse(localStorage.getItem('epl2627_players') || 'null');
    if (cp && Date.now() - cp.t < 60 * 60 * 1000) {
      state.players = cp.d;
    }
    const cs = JSON.parse(localStorage.getItem('epl2627_allslips') || 'null');
    if (cs && Date.now() - cs.t < 10 * 60 * 1000 && cs.gw === state.gw) {
      state.allSlips = cs.d.map(parsePicks);
      if (state.currentPlayer) state.slips = state.allSlips.filter(s => s.player === state.currentPlayer);
    }
  } catch(e) {}

  // Show immediately with hardcoded + cached data — don't wait for API
  const hash = location.hash.slice(1) || 'schedule';
  navigate(hash);

  // Fetch API data in background, then re-render
  refreshData().then(() => {
    buildLinesFromMatches();
    updateTabBadges();
    renderCurrentView();
  }).catch(e => {
    console.error('refreshData error:', e);
    showToast(currentLang === 'th' ? 'โหลดข้อมูลไม่ได้ — ใช้ข้อมูลเก่า' : 'Offline — showing cached data', 5000);
  });

}

async function refreshData(fresh) {
  if (typeof API_BASE_URL === 'undefined' || !API_BASE_URL) return;
  try {
    // fresh=1 bypasses the server-side cache (manual ↻ refresh)
    const suffix = (fresh ? '&fresh=1' : '') + '&gw=' + state.gw;
    // One gameweek = 10 matches and one round of slips, so allslips is small
    // enough to fetch for everyone — no admin-only / lazy split needed here.
    const calls = {
      matches: fetchAPI('matches' + suffix),
      players: fetchAPI('players'),
      allSlips: fetchAPI('allslips' + suffix),
    };

    const results = await Promise.all(Object.values(calls));
    const keys = Object.keys(calls);
    const data = {};
    keys.forEach((k, i) => { data[k] = results[i]; });

    if (data.matches) {
      data.matches.forEach(m => { state.matches[m.match_id] = m; });
      try { localStorage.setItem('epl2627_matches', JSON.stringify({ t: Date.now(), gw: state.gw, d: data.matches })); } catch(e) {}
    }
    if (data.players) {
      state.players = data.players;
      try { localStorage.setItem('epl2627_players', JSON.stringify({ t: Date.now(), d: data.players })); } catch(e) {}
    }
    if (data.allSlips) {
      state.allSlips = data.allSlips.map(parsePicks);
      // My slips derived from allSlips — no separate 'slips' call needed
      if (state.currentPlayer) state.slips = state.allSlips.filter(s => s.player === state.currentPlayer);
      try { localStorage.setItem('epl2627_allslips', JSON.stringify({ t: Date.now(), gw: state.gw, d: data.allSlips })); } catch(e) {}
    }
  } catch (e) {
    console.warn('API unavailable, using cached data', e);
  }
}

// Move the whole app to another gameweek: refetch that gw's matches + slips,
// then re-render whatever tab is open. Used by the pickers in ตารางแข่ง/แทงบอล.
async function switchGw(gw) {
  gw = Math.min(38, Math.max(1, Number(gw) || 1));
  if (gw === state.gw) return;
  state.gw = gw;
  state.allSlips = [];
  state.slips = [];
  // state.matches is deliberately NOT cleared: it is keyed by match_id and the
  // summary tab needs a whole month of scores in it, not just this gameweek's.
  showLoading();
  try {
    await refreshData();
    buildLinesFromMatches();
    await renderCurrentView();
    updateTabBadges();
  } finally {
    hideLoading();
  }
}

// --- Odds freshness ---
//
// Odds move during the day. The server is the one that decides the price at
// submit time (validatePicks in Code.gs); everything here just keeps the screen
// close enough that friends rarely get a "ราคาเปลี่ยน" rejection.

// Fingerprint of the odds currently in state, to tell whether a refetch moved anything
function oddsSignature() {
  return Object.keys(state.ahLines).sort().map(id =>
    [id, state.ahLines[id], state.ahOddsH[id], state.ahOddsA[id],
     state.ouLines[id], state.ouOddsO[id], state.ouOddsU[id]].join(':')
  ).join('|');
}

// Refetch just this gameweek's 10 match rows. Returns true if odds/lines moved.
async function refreshMatches(fresh) {
  if (typeof API_BASE_URL === 'undefined' || !API_BASE_URL) return false;
  const before = oddsSignature();
  const data = await fetchAPI('matches&gw=' + state.gw + (fresh ? '&fresh=1' : ''));
  if (!data || !data.length) return false;
  data.forEach(m => { state.matches[m.match_id] = m; });
  buildLinesFromMatches();
  try { localStorage.setItem('epl2627_matches', JSON.stringify({ t: Date.now(), gw: state.gw, d: data })); } catch (e) {}
  return oddsSignature() !== before;
}

// A tab left open all day was the worst case: it kept showing the morning price
// forever. Refetch whenever the tab comes back to the front (throttled).
async function onTabWake() {
  if (document.hidden) return;
  if (state._lastWake && Date.now() - state._lastWake < 30000) return;
  state._lastWake = Date.now();

  const moved = await refreshMatches();
  if (!moved) return;

  // Never re-render over unsaved input: picks the player just tapped, or the
  // half-filled dropdowns in the ราคา tab (alt-tabbing away to look a line up
  // and coming back is exactly how that tab gets used).
  const selected = document.querySelectorAll('#view-bet .bet-pick.selected').length;
  const editingOdds = state.currentView === 'odds';
  if (editingOdds || (state.currentView === 'bet' && selected)) {
    showToast(currentLang === 'th' ? 'ราคาเปลี่ยนแล้ว — กด ↻ เพื่อดูราคาใหม่' : 'Odds changed — tap ↻ to reload', 5000);
  } else {
    renderCurrentView();
    if (state.currentView === 'bet') {
      showToast(currentLang === 'th' ? 'ราคาอัปเดตแล้ว' : 'Odds updated');
    }
  }
}

async function manualRefresh() {
  const btn = document.getElementById('refresh-btn');
  btn.disabled = true;
  btn.textContent = '…';
  showLoading();
  try {
    state.periodSlips = [];   // force the summary tab to refetch standings + this month
    state.standings = [];
    await refreshData(true);
    buildLinesFromMatches();
    await renderCurrentView();
    updateTabBadges();
    showToast(currentLang === 'th' ? 'อัปเดตแล้ว' : 'Updated');
  } catch(e) {
    showToast(currentLang === 'th' ? 'โหลดไม่ได้ ลองใหม่อีกครั้ง' : 'Failed to load, try again', 5000);
  } finally {
    btn.disabled = false;
    btn.textContent = '↻';
    hideLoading();
  }
}

// --- Start ---
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('visibilitychange', onTabWake);
window.addEventListener('focus', onTabWake);
window.addEventListener('scroll', () => {
  const btn = document.getElementById('scroll-top-btn');
  if (btn) btn.style.display = window.scrollY > 300 ? '' : 'none';
}, { passive: true });

function filterSlipCards(query) {
  const q = (query || '').trim().toLowerCase();
  document.querySelectorAll('#view-bet .slip-card').forEach(card => {
    card.style.display = (!q || (card.dataset.search || '').includes(q)) ? '' : 'none';
  });
}

function updateAdminUI() {
  document.querySelectorAll('.admin-only').forEach(el => {
    if (state.isAdmin) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
}
