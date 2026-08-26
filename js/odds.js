// Odds — admin-only tab for setting AH / O-U lines and prices.
//
// Replaces typing into the Sheet by hand. Saving goes through `update_lines`,
// which clears the server cache for that gameweek — so a price change is live in
// seconds instead of waiting out a TTL. (Editing the Sheet directly still works;
// the onEdit trigger in Code.gs clears the same keys.)

const ODDS_CHOICES = [1.72, 1.80, 1.90, 2.00, 2.10];   // the only prices this pool uses

function ahLineChoices() {
  const out = [];
  for (let v = -3; v <= 3.0001; v += 0.25) out.push(Math.round(v * 100) / 100);
  return out;
}

function ouLineChoices() {
  const out = [];
  for (let v = 0.5; v <= 5.0001; v += 0.25) out.push(Math.round(v * 100) / 100);
  return out;
}

function oddsSelect(cls, id, field, value, choices, blankLabel) {
  let html = `<select class="odds-input" data-match="${id}" data-field="${field}" style="padding:4px 6px;font-size:0.8rem;background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);border-radius:var(--radius)">`;
  html += `<option value="">${blankLabel}</option>`;
  choices.forEach(c => {
    const sel = value !== '' && value != null && Math.abs(Number(value) - c) < 1e-6 ? ' selected' : '';
    const label = field === 'ah_line' && c > 0 ? '+' + c.toFixed(2) : c.toFixed(2);
    html += `<option value="${c}"${sel}>${label}</option>`;
  });
  html += '</select>';
  return html;
}

function renderOdds() {
  const container = document.getElementById('view-odds');
  if (!container) return;
  const lang = currentLang;

  if (!state.isAdmin) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted)">Admin only</div>`;
    return;
  }

  const gw = state.gw || currentGw();
  const matches = (MATCHES_BY_GW[gw] || []).slice().sort((a, b) => kickoffUtc(a.date) - kickoffUtc(b.date));

  let html = renderGwPicker(gw, lang);
  html += `<div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:10px">${lang === 'th'
    ? 'ตั้งราคาแล้วกดบันทึก — เพื่อนเห็นราคาใหม่ทันที (AH อิงเจ้าบ้าน: ลบ=ต่อ บวก=รอง)'
    : 'Set the lines and save — friends see the new price immediately (AH is from the home side)'}</div>`;

  matches.forEach(m => {
    const locked = isMatchLocked(m);
    const t1 = getTeamLabel(m.team1, lang);
    const t2 = getTeamLabel(m.team2, lang);
    const ahLine = state.ahLines[m.id] != null ? state.ahLines[m.id] : '';
    const ouLine = state.ouLines[m.id] != null ? state.ouLines[m.id] : '';

    html += `<div class="card" style="padding:10px;margin-bottom:8px${locked ? ';opacity:0.55' : ''}">`;
    html += `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:6px">`;
    html += `<div style="font-weight:700;font-size:0.9rem">${t1} <span style="color:var(--text-muted);font-weight:400">v</span> ${t2}</div>`;
    html += `<div style="font-size:0.72rem;color:var(--text-muted);white-space:nowrap">${formatMatchDate(m, lang)}${locked ? ' · ' + (lang === 'th' ? 'ปิดแล้ว' : 'closed') : ''}</div>`;
    html += `</div>`;

    if (!locked) {
      html += `<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:0.78rem">`;
      const ahNum = parseFloat(ahLine);
      const favTxt = !ahLine || ahNum === 0 ? (lang === 'th' ? 'ราคาเท่ากัน' : 'level')
        : ahNum < 0 ? `${t1} ${lang === 'th' ? 'ต่อ' : 'gives'} ${Math.abs(ahNum)}`
        : `${t2} ${lang === 'th' ? 'ต่อ' : 'gives'} ${ahNum}`;
      html += `<span style="min-width:26px;color:var(--text-muted)">AH</span>`;
      html += oddsSelect('', m.id, 'ah_line', ahLine, ahLineChoices(), lang === 'th' ? 'ไม่มี' : 'none');
      html += oddsSelect('', m.id, 'ah_odds_h', state.ahOddsH[m.id] || '', ODDS_CHOICES, t1 + '?');
      html += oddsSelect('', m.id, 'ah_odds_a', state.ahOddsA[m.id] || '', ODDS_CHOICES, t2 + '?');
      html += `<span style="font-size:0.72rem;color:var(--text-muted)">${favTxt}</span>`;
      html += `</div>`;
      html += `<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:0.78rem;margin-top:5px">`;
      html += `<span style="min-width:26px;color:var(--text-muted)">${lang === 'th' ? 'สูงต่ำ' : 'O/U'}</span>`;
      html += oddsSelect('', m.id, 'ou_line', ouLine, ouLineChoices(), lang === 'th' ? 'ไม่มี' : 'none');
      html += oddsSelect('', m.id, 'ou_odds_o', state.ouOddsO[m.id] || '', ODDS_CHOICES, lang === 'th' ? 'สูง' : 'O');
      html += oddsSelect('', m.id, 'ou_odds_u', state.ouOddsU[m.id] || '', ODDS_CHOICES, lang === 'th' ? 'ต่ำ' : 'U');
      html += `</div>`;
    } else {
      html += `<div style="font-size:0.78rem;color:var(--text-muted)">AH ${ahLine || '-'} · ${lang === 'th' ? 'สูงต่ำ' : 'O/U'} ${ouLine || '-'}</div>`;
    }
    html += `</div>`;
  });

  html += `<div style="display:flex;gap:8px;align-items:center;margin:12px 0 24px">`;
  html += `<button id="odds-save" class="btn btn-primary" style="flex:1">${lang === 'th' ? 'บันทึกราคา' : 'Save odds'}</button>`;
  html += `<button id="odds-fill" style="${SUBTAB_OFF}">${lang === 'th' ? 'เติม 1.90 ที่ว่าง' : 'Fill blanks 1.90'}</button>`;
  html += `</div>`;

  container.innerHTML = html;
  bindGwPicker(container);

  // Fill every empty price with 1.90 — the common case is only the lines differ
  container.querySelector('#odds-fill')?.addEventListener('click', () => {
    container.querySelectorAll('.odds-input').forEach(sel => {
      const f = sel.dataset.field;
      if (f !== 'ah_line' && f !== 'ou_line' && !sel.value) sel.value = '1.9';
    });
  });

  container.querySelector('#odds-save')?.addEventListener('click', async () => {
    const btn = container.querySelector('#odds-save');
    const byMatch = {};
    container.querySelectorAll('.odds-input').forEach(sel => {
      const id = sel.dataset.match;
      byMatch[id] = byMatch[id] || { match_id: id };
      byMatch[id][sel.dataset.field] = sel.value;
    });

    // Send a match if it has a line now, or had one before — the second case is
    // how a match gets taken off the board (both lines cleared).
    const hadLine = id => state.ahLines[id] != null || state.ouLines[id] != null;
    const updates = Object.values(byMatch).filter(u =>
      u.ah_line !== '' || u.ou_line !== '' || hadLine(u.match_id));
    if (!updates.length) {
      showToast(currentLang === 'th' ? 'ยังไม่ได้ตั้งราคา' : 'Nothing to save');
      return;
    }

    btn.disabled = true;
    showLoading();
    try {
      const result = await updateLines(updates);
      if (result && result.success) {
        await refreshMatches(true);   // fresh=1 so we read back what was written
        renderOdds();
        showToast(currentLang === 'th' ? `บันทึกราคา ${updates.length} คู่แล้ว` : `Saved ${updates.length} matches`);
      } else {
        showToast((result && result.error) || (currentLang === 'th' ? 'บันทึกไม่สำเร็จ' : 'Save failed'), 5000);
      }
    } finally {
      btn.disabled = false;
      hideLoading();
    }
  });
}
