// Schedule — one gameweek at a time.
// The WC version grouped by group stage / knockout round; a league season has
// neither, and rendering all 380 matches at once is the thing that made the old
// app crawl. state.gw is the unit: 10 matches per view, one API scope.

function renderSchedule() {
  const container = document.getElementById('view-schedule');
  if (!container) return;
  const lang = currentLang;
  const gw = state.gw || currentGw();

  let html = '';
  html += renderGwPicker(gw, lang);
  html += '<div id="sch-gw-content"></div>';
  container.innerHTML = html;

  showScheduleGw(gw);
  bindGwPicker(container);
}

// Shared by ตารางแข่ง and แทงบอล: ‹ นัดที่ N › plus a jump-to dropdown.
function renderGwPicker(gw, lang) {
  const btn = 'padding:6px 12px;font-size:0.9rem;background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);border-radius:var(--radius);font-weight:700;cursor:pointer';
  let html = '<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">';
  html += `<button class="gw-prev" style="${btn}"${gw <= 1 ? ' disabled' : ''}>‹</button>`;
  html += '<select class="gw-select" style="flex:1;padding:6px 10px;font-size:0.9rem;background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);border-radius:var(--radius);font-weight:700">';
  for (let i = 1; i <= 38; i++) {
    html += `<option value="${i}"${i === gw ? ' selected' : ''}>${gwLabel(i, lang)} — ${periodLabel(GW_PERIOD[i], lang)}</option>`;
  }
  html += '</select>';
  html += `<button class="gw-next" style="${btn}"${gw >= 38 ? ' disabled' : ''}>›</button>`;
  html += '</div>';
  return html;
}

function bindGwPicker(container) {
  const sel = container.querySelector('.gw-select');
  if (sel) sel.addEventListener('change', () => switchGw(Number(sel.value)));
  const prev = container.querySelector('.gw-prev');
  if (prev) prev.addEventListener('click', () => switchGw((state.gw || 1) - 1));
  const next = container.querySelector('.gw-next');
  if (next) next.addEventListener('click', () => switchGw((state.gw || 1) + 1));
}

function showScheduleGw(gw) {
  const content = document.getElementById('sch-gw-content');
  if (!content) return;
  const lang = currentLang;

  const matches = (MATCHES_BY_GW[gw] || [])
    .slice()
    .sort((a, b) => kickoffUtc(a.date) - kickoffUtc(b.date));

  if (!matches.length) {
    content.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted);font-size:0.85rem">${lang === 'th' ? 'ไม่มีแมตช์' : 'No matches'}</div>`;
    return;
  }

  // Day headers inside the gameweek — a GW spreads over Sat/Sun/Mon
  let html = '';
  let lastDay = '';
  matches.forEach(m => {
    const thai = new Date(kickoffUtc(m.date).getTime() + 7 * 3600 * 1000);
    const day = `${thai.getUTCFullYear()}-${thai.getUTCMonth()}-${thai.getUTCDate()}`;
    if (day !== lastDay) {
      lastDay = day;
      html += `<div class="group-title">${formatMatchDate(m, lang).replace(/\s\d{2}:\d{2}.*$/, '')}</div>`;
    }
    html += renderScheduleMatchCard(m);
  });

  content.innerHTML = html;
}

function renderScheduleMatchCard(match) {
  const lang = currentLang;
  const t1 = TEAMS[match.team1];
  const t2 = TEAMS[match.team2];
  const t1Label = `<span class="team-name">${getTeamLabel(match.team1, lang)}</span>`;
  const t2Label = `<span class="team-name">${getTeamLabel(match.team2, lang)}</span>`;

  const result = state.matches[match.id];
  const score1 = result ? result.team1_score : '';
  const score2 = result ? result.team2_score : '';
  const ahLine = state.ahLines[match.id] || '';
  const ouLine = state.ouLines[match.id] || '';
  const ahOddsH = state.ahOddsH[match.id] || '';
  const ahOddsA = state.ahOddsA[match.id] || '';
  const ouOddsO = state.ouOddsO[match.id] || '';
  const ouOddsU = state.ouOddsU[match.id] || '';

  const kickoff = kickoffUtc(match.date);
  const now = new Date();
  const postponed = isMatchPostponed(match);
  const isLive = !postponed && now >= kickoff && now < new Date(kickoff.getTime() + 115 * 60 * 1000);

  let scoreDisplay = '';
  if (typeof score1 === 'number' && typeof score2 === 'number') {
    scoreDisplay = `<span class="badge badge-exact">${score1} - ${score2}</span>`;
  } else if (postponed) {
    scoreDisplay = `<span style="color:var(--text-muted)">${lang === 'th' ? 'เลื่อน' : 'PP'}</span>`;
  } else if (isLive) {
    scoreDisplay = `<span class="live-badge">LIVE</span>`;
  } else {
    scoreDisplay = '<span style="color:var(--text-muted)">vs</span>';
  }

  let html = `<div class="card match-card${isLive ? ' match-card-live' : ''}">`;
  html += `<div class="match-header">`;
  html += `<span>${formatMatchDate(match, lang)}</span>`;
  html += `<span class="match-stage">${postponed ? (lang === 'th' ? 'เลื่อนแข่ง' : 'Postponed') : gwLabel(match.gw, lang)}</span>`;
  html += `</div>`;
  html += `<div class="match-teams">`;
  html += `<div class="team team-home">${t1Label}</div>`;
  html += `<div class="match-score">${scoreDisplay}</div>`;
  html += `<div class="team team-away">${t2Label}</div>`;
  html += `</div>`;

  // Lines + odds
  if (ahLine || ouLine) {
    html += `<div class="match-ah">`;
    if (ahLine) {
      const t1Name = t1 ? (lang === 'th' ? t1.nameTh : t1.name) : '';
      const t2Name = t2 ? (lang === 'th' ? t2.nameTh : t2.name) : '';
      html += `<div class="ah-line">AH ${t1Name} <span style="font-weight:700">${formatAhFav(ahLine, true)}</span> <span class="odds-tag">@${ahOddsH}</span> / ${t2Name} <span style="font-weight:700">${formatAhFav(ahLine, false)}</span> <span class="odds-tag">@${ahOddsA}</span></div>`;
    }
    if (ouLine) {
      html += `<div class="ah-line">${lang === 'th' ? 'สูงต่ำ' : 'O/U'} ${ouLine} <span class="odds-tag">${lang === 'th' ? 'สูง' : 'O'} @${ouOddsO}</span> / <span class="odds-tag">${lang === 'th' ? 'ต่ำ' : 'U'} @${ouOddsU}</span></div>`;
    }
    html += `</div>`;
  }

  html += `<div class="match-venue">${match.venue}</div>`;
  html += `</div>`;
  return html;
}

function renderPendingSlipCard(slip) {
  return renderSlipCard(slip, { showPlayer: true });
}
