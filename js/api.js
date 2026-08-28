// Google Apps Script API wrapper
// EPL 2026/27 deployment (bound to the EPL Sheet)
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbybcXrToyRT2bVizXnmI_erxYBWwjvyT711qammdsQdwsZERALJXT8vNBq31vgHpUZ12Q/exec';

// Apps Script /exec intermittently answers a 404 or an HTML error page instead
// of running the script — seen repeatedly while testing this deployment. Without
// a retry that surfaces as an empty tab with no error, so reads get two quick
// retries. GETs only: POSTs are not idempotent and a retried submit_slip would
// place the bet twice.
async function fetchAPI(params) {
  if (!API_BASE_URL) return null;
  const delays = [0, 400, 1200];
  let lastErr = null;

  for (let i = 0; i < delays.length; i++) {
    if (delays[i]) await new Promise(r => setTimeout(r, delays[i]));
    try {
      const res = await fetch(API_BASE_URL + '?action=' + params + '&t=' + Date.now());
      if (!res.ok) throw new Error('API error: ' + res.status);
      const text = await res.text();
      // An HTML error page parses as neither array nor object — treat as a miss
      if (!/^\s*[[{]/.test(text)) throw new Error('Non-JSON response');
      return JSON.parse(text);
    } catch (e) {
      lastErr = e;
    }
  }

  console.error('fetchAPI failed after retries:', params, lastErr);
  return null;
}

async function loginPlayer(playerId, pin) {
  if (!API_BASE_URL) {
    state.currentPlayer = playerId;
    localStorage.setItem('epl2627_player', playerId);
    localStorage.setItem('epl2627_pin', pin);
    return { success: true };
  }
  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'login', player: playerId, pin: pin }),
    });
    const result = await res.json();
    if (result.success) {
      state.currentPlayer = playerId;
      state.isAdmin = result.is_admin || false;
      localStorage.setItem('epl2627_player', playerId);
      localStorage.setItem('epl2627_pin', pin);
      localStorage.setItem('epl2627_admin', state.isAdmin ? 'true' : 'false');
    }
    return result;
  } catch (e) {
    return { success: false, error: e.message };
  }
}


async function submitSlip(slip) {
  if (!API_BASE_URL) {
    const ticket = {
      timestamp: new Date().toISOString(),
      player: state.currentPlayer,
      bet: slip.bet,
      combined_odds: slip.combined_odds,
      payout: slip.payout,
      picks: slip.picks,
      status: 'pending',
    };
    state.slips.push(ticket);
    return { success: true };
  }
  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'submit_slip',
        player: state.currentPlayer,
        pin: localStorage.getItem('epl2627_pin'),
        slip: slip,
      }),
    });
    if (!res.ok) throw new Error('Submit slip error: ' + res.status);
    const result = await res.json();
    if (result.success) {
      // Optimistic update: add slip locally instead of re-fetching
      // gw/period come back from the server — without them the optimistic slip
      // is invisible to computeStandings(), which filters on period
      const base = { timestamp: result.timestamp || Date.now(), player: state.currentPlayer,
        gw: result.gw, period: result.period, bet: slip.bet,
        combined_odds: slip.combined_odds, payout: slip.payout, status: 'pending' };
      const newSlip = typeof parsePicks === 'function'
        ? parsePicks({ ...base, picks_json: JSON.stringify(slip.picks), picks: slip.picks })
        : { ...base, picks: slip.picks };
      state.slips.unshift(newSlip);
      if (state.allSlips.length) state.allSlips.unshift(newSlip);
    }
    return result;
  } catch (e) {
    console.error('submitSlip error:', e);
    return { success: false, error: e.message };
  }
}

async function cancelSlip(slipTimestamp) {
  if (!API_BASE_URL) {
    state.slips = state.slips.filter(s => s.timestamp !== slipTimestamp);
    return { success: true };
  }
  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'cancel_slip',
        player: state.currentPlayer,
        pin: localStorage.getItem('epl2627_pin'),
        slip_id: slipTimestamp,
      }),
    });
    const result = await res.json();
    if (result.success) {
      state.slips = state.slips.filter(s => s.timestamp !== slipTimestamp);
    }
    return result;
  } catch (e) {
    console.error('cancelSlip error:', e);
    return { success: false, error: e.message };
  }
}

async function approveSlip(slipTimestamp) {
  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'approve_slip',
        player: state.currentPlayer,
        pin: localStorage.getItem('epl2627_pin'),
        slip_id: slipTimestamp,
      }),
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function updateLines(updates) {
  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'update_lines',
        player: state.currentPlayer,
        pin: localStorage.getItem('epl2627_pin'),
        updates: updates,
      }),
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Open / close เต็ง for one gameweek by hand: 'auto' | 'open' | 'closed'.
// Server-side it writes `bet_state` on that gameweek's matches rows and clears
// the same caches update_lines does, so the change is live in seconds.
// matchIds scopes the write to one session's rows; omit it for the whole gw.
async function setBetState(gw, betState, matchIds) {
  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'set_bet_state',
        player: state.currentPlayer,
        pin: localStorage.getItem('epl2627_pin'),
        gw: gw,
        state: betState,
        match_ids: matchIds || [],
      }),
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// Monthly settlement. `standings` rows are computed on the client with the same
// resolveSlip() the UI uses; archive=true also MOVES that month's slips to the
// slips_archive tab (appended there first, verified, then removed from `slips`).
async function settlePeriod(period, standings, archive) {
  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'settle_period',
        player: state.currentPlayer,
        pin: localStorage.getItem('epl2627_pin'),
        period: period,
        standings: standings,
        archive: !!archive,
      }),
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function updateScores(updates) {
  try {
    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'update_scores',
        player: state.currentPlayer,
        pin: localStorage.getItem('epl2627_pin'),
        updates: updates,
      }),
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: e.message };
  }
}
