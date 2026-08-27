// Betting — unified single + step (AH + O/U)
// 1 pick = single, 3+ picks = step/parlay

const TAB_ON    = 'padding:8px 14px;font-size:0.85rem;background:var(--primary);border:1px solid var(--primary);color:#fff;border-radius:var(--radius);font-weight:700;cursor:pointer';
const TAB_OFF   = 'padding:8px 14px;font-size:0.85rem;background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);border-radius:var(--radius);font-weight:700;cursor:pointer';
const SUBTAB_ON  = 'padding:6px 12px;font-size:0.8rem;background:var(--primary);border:1px solid var(--primary);color:#fff;border-radius:var(--radius);font-weight:700;cursor:pointer';
const SUBTAB_OFF = 'padding:6px 12px;font-size:0.8rem;background:var(--bg-input);border:1px solid var(--border);color:var(--text-primary);border-radius:var(--radius);font-weight:700;cursor:pointer';

async function renderBetting() {
  const container = document.getElementById('view-bet');
  const lang = currentLang;

  if (!state.currentPlayer) {
    renderBettingLoginForm(container);
    return;
  }

  // One gameweek of slips is small, so admin and players fetch the same thing —
  // the WC-era admin/lazy split existed only because allslips was ~1MB.
  //
  // Keyed on "have we loaded this gameweek", not on the array being empty: a
  // gameweek nobody has bet on yet is legitimately empty, and testing .length
  // made every render of this tab fire another request for the same empty list
  // — on a backend that runs requests one at a time.
  // Skipped while a bootstrap for this gameweek is already in flight: it brings
  // the same slips, and awaiting a second copy here blocked this whole render
  // behind it — the tab kept showing the previous gameweek instead of saying it
  // was loading.
  if (typeof API_BASE_URL !== 'undefined' && API_BASE_URL
      && state.slipsLoadedGw !== state.gw && state.gwLoading !== state.gw) {
    const allSlips = await fetchAPI('allslips&gw=' + state.gw);
    if (Array.isArray(allSlips)) {
      state.allSlips = allSlips.map(parsePicks);
      state.slips = state.allSlips.filter(s => s.player === state.currentPlayer);
      state.slipsLoadedGw = state.gw;
    }
  }

  const byKickoff = (a, b) => new Date(a.date) - new Date(b.date);
  const gwMatches = MATCHES_BY_GW[state.gw] || [];
  const hasLine = m => state.ahLines[m.id] || state.ouLines[m.id] || state.cornerLines[m.id] || state.cardLines[m.id];

  const available = gwMatches.filter(m => hasLine(m) && !isMatchLocked(m)).sort(byKickoff);
  const locked    = gwMatches.filter(m => hasLine(m) && isMatchLocked(m)).sort((a, b) => new Date(b.date) - new Date(a.date));

  const slipSource  = getAllSlips();
  const allFiltered = slipSource.filter(s => s.status !== 'cancelled').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const mySlips     = allFiltered.filter(s => s.player === state.currentPlayer);

  // ── Friends' pending slips ────────────────────────────────────────
  const pendingFriendSlips = slipSource.filter(s =>
    s.player !== state.currentPlayer &&
    s.status !== 'approved' &&
    s.status !== 'cancelled'
  ).sort((a, b) => {
    const aResolved = typeof resolveSlip === 'function' && resolveSlip(a).status !== 'pending';
    const bResolved = typeof resolveSlip === 'function' && resolveSlip(b).status !== 'pending';
    if (aResolved !== bResolved) return aResolved ? -1 : 1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  const friendPlayers = [...new Set(pendingFriendSlips.map(s => s.player))];
  const friendReady   = pendingFriendSlips.filter(s => { const r = resolveSlip(s); return r.status === 'won' || r.status === 'lost'; });
  const friendWaiting = pendingFriendSlips.filter(s => resolveSlip(s).status === 'pending');

  const tabOn = TAB_ON, tabOff = TAB_OFF;

  // ── Admin view: house dashboard + friend slips + ราคาบอล tab ───────
  if (state.isAdmin) {
    let html = '';
    html += `<div class="user-bar"><span class="user-name">${getDisplayName(state.currentPlayer)}</span><button class="logout-btn" id="bet-logout">${t('logout')}</button></div>`;
    html += renderGwPicker(state.gw, lang);
    html += renderHouseDashboard();

    // ── Slips: split into ready-to-approve vs still-pending ──
    const allSlipsAll = getAllSlips();
    const readySlips   = pendingFriendSlips.filter(s => { const r = resolveSlip(s); return r.status === 'won' || r.status === 'lost'; });
    const waitingSlips = pendingFriendSlips.filter(s => resolveSlip(s).status === 'pending');

    // Section A: พร้อมยืนยัน — bulk buttons + slip cards
    html += `<div style="margin:16px 0 8px;font-size:0.85rem;color:var(--text-muted);font-weight:700">${lang === 'th' ? 'พร้อมยืนยัน' : 'Ready to Approve'} (${readySlips.length})</div>`;
    if (!readySlips.length) {
      html += `<div style="color:var(--text-muted);text-align:center;padding:16px">${lang === 'th' ? 'ยังไม่มีสลิปที่รู้ผล' : 'No resolved slips yet'}</div>`;
    } else {
      readySlips.forEach(s => { html += renderSlipCard(s, { showPlayer: true }); });
    }

    // Section B: รอผล — slips still pending
    if (waitingSlips.length) {
      const waitPlayers = [...new Set(waitingSlips.map(s => s.player))];
      html += `<div style="margin:16px 0 8px;font-size:0.85rem;color:var(--text-muted);font-weight:700">${lang === 'th' ? 'รอผลบอล' : 'Awaiting Results'} (${waitingSlips.length})</div>`;
      html += `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">`;
      html += `<button class="wait-player-tab" data-wp="all" style="${SUBTAB_ON}">${lang === 'th' ? 'ทั้งหมด' : 'All'} (${waitingSlips.length})</button>`;
      waitPlayers.forEach(p => {
        const n = waitingSlips.filter(s => s.player === p).length;
        html += `<button class="wait-player-tab" data-wp="${p}" style="${SUBTAB_OFF}">${getDisplayName(p)} (${n})</button>`;
      });
      html += `</div>`;
      html += `<div class="wait-player-pane" data-wp="all">`;
      waitingSlips.forEach(s => { html += renderSlipCard(s, { showPlayer: true }); });
      html += `</div>`;
      waitPlayers.forEach(p => {
        html += `<div class="wait-player-pane" data-wp="${p}" style="display:none">`;
        waitingSlips.filter(s => s.player === p).forEach(s => { html += renderSlipCard(s, { showPlayer: true }); });
        html += `</div>`;
      });
    }

    // Section C: ยืนยันแล้ว — approved slips today, split won/lost
    const todayIds = new Set(getTodayMatches().map(m => m.id));
    const approvedSlips = allSlipsAll.filter(s => s.status === 'approved' && (s.picks || []).some(p => todayIds.has(p.match_id)));
    if (approvedSlips.length) {
      const approvedWon  = approvedSlips.filter(s => resolveSlip(s).status === 'won');
      const approvedLost = approvedSlips.filter(s => resolveSlip(s).status === 'lost');
      html += `<div style="margin:16px 0 8px;font-size:0.85rem;color:var(--text-muted);font-weight:700">${lang === 'th' ? 'ยืนยันแล้ว' : 'Approved'} (${approvedSlips.length})</div>`;
      html += `<div style="display:flex;gap:6px;margin-bottom:10px">`;
      html += `<button class="approved-tab" data-apv="won"  style="${SUBTAB_ON}">${lang === 'th' ? 'ถูก' : 'Won'} (${approvedWon.length})</button>`;
      html += `<button class="approved-tab" data-apv="lost" style="${SUBTAB_OFF}">${lang === 'th' ? 'ผิด' : 'Lost'} (${approvedLost.length})</button>`;
      html += `</div>`;
      html += `<div class="approved-pane" data-apv="won">`;
      approvedWon.forEach(s => { html += renderSlipCard(s, { showPlayer: true }); });
      if (!approvedWon.length) html += `<div style="color:var(--text-muted);text-align:center;padding:16px">-</div>`;
      html += `</div>`;
      html += `<div class="approved-pane" data-apv="lost" style="display:none">`;
      approvedLost.forEach(s => { html += renderSlipCard(s, { showPlayer: true }); });
      if (!approvedLost.length) html += `<div style="color:var(--text-muted);text-align:center;padding:16px">-</div>`;
      html += `</div>`;
    }

    container.innerHTML = html;
    bindGwPicker(container);
    container.querySelector('#bet-logout')?.addEventListener('click', () => {
      state.currentPlayer = null;
      localStorage.removeItem('epl2627_player');
      localStorage.removeItem('epl2627_pin');
      renderBetting();
    });
    container.querySelectorAll('.wait-player-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.wp;
        container.querySelectorAll('.wait-player-tab').forEach(b => { b.style.cssText = b.dataset.wp === key ? SUBTAB_ON : SUBTAB_OFF; });
        container.querySelectorAll('.wait-player-pane').forEach(p => { p.style.display = p.dataset.wp === key ? '' : 'none'; });
      });
    });
    container.querySelectorAll('.approved-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.apv;
        container.querySelectorAll('.approved-tab').forEach(b => { b.style.cssText = b.dataset.apv === key ? SUBTAB_ON : SUBTAB_OFF; });
        container.querySelectorAll('.approved-pane').forEach(p => { p.style.display = p.dataset.apv === key ? '' : 'none'; });
      });
    });
    container.querySelectorAll('.slip-approve-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ts = btn.dataset.ts;
        const result = await approveSlip(ts);
        if (result && result.success) {
          const allSlips = getAllSlips();
          const slip = allSlips.find(s => String(s.timestamp) === String(ts));
          if (slip) slip.status = 'approved';
          updateTabBadges();
          showToast(lang === 'th' ? 'ยืนยันแล้ว' : 'Approved');
          renderBetting();
        } else {
          showToast('Error');
        }
      });
    });
    container.querySelectorAll('.bulk-approve-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const teamCode = btn.dataset.team;
        const matchId  = btn.dataset.matchid;
        const toApprove = getAllSlips().filter(s =>
          s.status !== 'approved' && s.status !== 'cancelled' &&
          (resolveSlip(s).status === 'won' || resolveSlip(s).status === 'lost') &&
          s.picks.some(p => p.type === 'ah' && p.pick === teamCode && p.match_id === matchId)
        );
        if (!toApprove.length) return;
        showLoading();
        for (const s of toApprove) { await approveSlip(s.timestamp); }
        await refreshData();
        hideLoading();
        showToast(lang === 'th' ? `ยืนยัน ${toApprove.length} สลิปแล้ว` : `Approved ${toApprove.length} slips`);
        renderBetting();
      });
    });
    container.querySelectorAll('.bulk-approve-ou-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const matchId = btn.dataset.matchid;
        const toApprove = getAllSlips().filter(s =>
          s.status !== 'approved' && s.status !== 'cancelled' &&
          (resolveSlip(s).status === 'won' || resolveSlip(s).status === 'lost') &&
          s.picks.some(p => p.type === 'ou' && p.match_id === matchId)
        );
        if (!toApprove.length) return;
        showLoading();
        for (const s of toApprove) { await approveSlip(s.timestamp); }
        await refreshData();
        hideLoading();
        showToast(lang === 'th' ? `ยืนยัน ${toApprove.length} สลิปแล้ว` : `Approved ${toApprove.length} slips`);
        renderBetting();
      });
    });
    return;
  }

  let html = '';

  // User bar
  html += `<div class="user-bar">`;
  html += `<span class="user-name">${getDisplayName(state.currentPlayer)}</span>`;
  html += `<button class="logout-btn" id="bet-logout">${t('logout')}</button>`;
  html += `</div>`;

  html += renderGwPicker(state.gw, lang);

  // Top tabs: แทงบอล | สลิปเพื่อน (N)
  html += `<div style="display:flex;gap:8px;margin-bottom:10px">`;
  html += `<button class="bet-main-tab" data-main="bet" style="${tabOn}">${lang === 'th' ? 'แทงบอล' : 'Betting'}</button>`;
  const friendBadge = friendReady.length ? ` · ${friendReady.length} รอยืนยัน` : pendingFriendSlips.length ? ` (${pendingFriendSlips.length})` : '';
  html += `<button class="bet-main-tab" data-main="friends" style="${tabOff}">${lang === 'th' ? 'สลิปเพื่อน' : 'Friends'}${friendBadge}</button>`;
  html += `</div>`;

  // ── Tab: แทงบอล ──────────────────────────────────────────────────
  html += `<div id="bet-main-bet">`;
  html += `<h2 style="font-size:1.1rem;margin-bottom:12px">${lang === 'th' ? 'แทงบอล' : 'Place Bets'}</h2>`;

  html += renderChampionCard();

  const todayLocked = locked.filter(m => getTodayMatches().some(t => t.id === m.id));
  const todayAll = [...available, ...todayLocked].sort((a, b) => kickoffUtc(a.date) - kickoffUtc(b.date));
  if (todayAll.length === 0) {
    // Nothing to show yet can mean two different things, and saying which
    // beats a spinner: the odds for a gameweek opened for the first time are
    // still on the way (state.gwLoading), or there simply are none set.
    const waiting = state.gwLoading === state.gw;
    html += `<div style="color:var(--text-muted);text-align:center;padding:20px">${
      waiting
        ? (lang === 'th' ? 'กำลังโหลดราคา…' : 'Loading odds…')
        : (lang === 'th' ? 'ยังไม่มีคู่ที่เปิดรับแทง' : 'No open matches with lines')
    }</div>`;
  } else {
    const chipStyle = 'font-size:0.82rem;font-weight:700;background:var(--secondary);color:#fff;border:none;padding:5px 12px;border-radius:var(--radius);cursor:pointer';
    if (available.length) html += `<div style="margin-bottom:12px"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><button id="bet-rules-toggle" style="font-size:0.8rem;color:var(--text-muted);background:none;border:none;cursor:pointer;padding:0;text-decoration:underline">${lang === 'th' ? 'กติกา ▸' : 'Rules ▸'}</button><button class="bet-random-chip" data-count="4" style="${chipStyle}">🎲 4</button><button class="bet-random-chip" data-count="6" style="${chipStyle}">🎲 6</button><button class="bet-random-chip" data-count="8" style="${chipStyle}">🎲 8</button><button class="bet-random-chip" data-count="all" style="${chipStyle}">🎲 ทั้งหมด</button></div><p id="bet-rules-text" style="display:none;font-size:0.85rem;color:var(--text-muted);margin:6px 0 0">${lang === 'th' ? 'กดเลือก กดอีกที=ยกเลิก<br><b>กติกา</b><br><b>เต็ง</b> (1 pick, สูงสุด 3,000) — เปิดแทง <b>3 ชม. ก่อนคู่แรกของนัดนั้น หรือ 18:00 น. ถ้าคู่แรกดึก</b><br><b>สเต็ป</b> = <b>3 picks ขึ้นไป</b> — ไม่จำกัดเงินแทง แต่ได้ไม่เกิน 10,000 ต่อสลิป (2 picks แทงไม่ได้)<br>ปิดรับทุกประเภทก่อนเตะ 10 นาที<br>ได้สูงสุด 10,000 ต่อสลิป<br>สูงสุด 2 picks ต่อคู่ · ขั้นต่ำ 10' : 'Tap to select, tap again to deselect<br><b>Rules</b><br><b>Single</b> (1 pick, max 3,000) — opens <b>3h before the first match, or 18:00 Thai if that match is late at night</b><br><b>Step</b> = <b>3+ picks</b> — no stake cap, but max payout 10,000 per slip (2 picks is not valid)<br>Everything closes 10 min before kickoff<br>Max payout 10,000 per slip<br>Max 2 picks per match · min 10'}</p></div>`;
    todayAll.forEach(m => {
      if (isMatchLocked(m)) { html += renderBettingCardLocked(m); }
      else { html += renderBettingCard(m); }
    });
    if (available.length) {
      html += `<div style="margin-top:12px;padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg)">`;
      html += `<div id="bet-summary" style="font-size:0.85rem;color:var(--text-muted)">${lang === 'th' ? 'เลือก' : 'Picks'}: 0</div>`;
      html += `<div style="margin-top:8px;display:flex;align-items:center;gap:8px">`;
      html += `<label style="font-size:0.85rem">${lang === 'th' ? 'จำนวนเงิน' : 'Amount'}</label>`;
      html += `<input type="number" id="bet-amount" min="50" step="10" value="50" style="width:100px;padding:6px 8px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius);color:var(--text-primary);font-size:0.9rem;text-align:right">`;
      html += `<span style="color:var(--accent)"></span>`;
      html += `</div>`;
      html += `<div id="bet-odds-display" style="margin-top:8px;font-size:0.85rem;color:var(--text-muted)">${lang === 'th' ? 'ราคารวม' : 'Odds'}: -</div>`;
      html += `<div id="bet-payout-display" style="margin-top:4px;font-size:1rem;font-weight:700;color:var(--accent)">${lang === 'th' ? 'จ่าย' : 'Payout'}: -</div>`;
      html += `<button class="btn btn-primary" id="bet-save-btn" style="margin-top:10px" disabled>${lang === 'th' ? 'ลงเงิน' : 'Place Bet'}</button>`;
      html += `</div>`;
      html += `<div style="height:20px"></div>`;
    }
  }

  // My slips — subtabs: รอผล / ประวัติ
  html += `<div id="slip-list">`;
  html += `<h3 style="font-size:0.95rem;color:var(--primary);margin:20px 0 8px">${lang === 'th' ? 'สลิปของฉัน' : 'My Slips'}</h3>`;
  if (mySlips.length === 0) {
    html += `<div style="color:var(--text-muted);font-size:0.85rem;padding:8px 0">${lang === 'th' ? 'ยังไม่มีสลิป' : 'No slips yet'}</div>`;
  } else {
    const totalBet = mySlips.reduce((s, sl) => s + (sl.bet || 0), 0);
    const myResolved = mySlips.map(s => ({ slip: s, st: (typeof resolveSlip === 'function' ? resolveSlip(s) : { status: s.status, profit: 0 }) }));
    const nWon  = myResolved.filter(({st}) => st.status === 'won' || st.status === 'approved').length;
    const nLost = myResolved.filter(({st}) => st.status === 'lost').length;
    const nPend = myResolved.filter(({st}) => st.status === 'pending').length;
    const pendPayout = myResolved.filter(({st}) => st.status === 'pending').reduce((s, {slip}) => s + (slip.payout || 0), 0);
    html += `<div style="display:flex;flex-wrap:wrap;gap:12px;padding:10px 12px;background:var(--bg-input);border-radius:var(--radius);margin-bottom:12px;font-size:0.82rem">`;
    html += `<span style="color:var(--text-muted)">${lang === 'th' ? 'ลงไป' : 'Bet'} <b style="color:var(--text-primary)">${fmtM(totalBet)}</b></span>`;
    html += `<span style="color:var(--text-muted)">${lang === 'th' ? 'ถูก' : 'Won'} <b style="color:var(--accent)">${nWon}</b> · ${lang === 'th' ? 'ผิด' : 'Lost'} <b style="color:var(--wrong)">${nLost}</b> · ${lang === 'th' ? 'รอ' : 'Pend'} <b>${nPend}</b></span>`;
    if (pendPayout > 0) html += `<span style="color:var(--text-muted)">${lang === 'th' ? 'รอรับ' : 'Pend payout'} <b style="color:var(--accent)">${pendPayout}</b></span>`;
    html += `</div>`;

    const myTabOn = SUBTAB_ON, myTabOff = SUBTAB_OFF;
    const myPending = mySlips.filter(s => s.status === 'pending');
    const myHistory = mySlips.filter(s => s.status === 'approved');
    const myDefaultTab = myPending.length > 0 ? 'mypend' : 'myhist';

    html += `<div style="display:flex;gap:6px;margin-bottom:12px">`;
    html += `<button class="my-tab-btn" data-mytab="mypend" style="${myDefaultTab === 'mypend' ? myTabOn : myTabOff}">${lang === 'th' ? 'รอผล' : 'Pending'} (${myPending.length})</button>`;
    html += `<button class="my-tab-btn" data-mytab="myhist" style="${myDefaultTab === 'myhist' ? myTabOn : myTabOff}">${lang === 'th' ? 'ประวัติ' : 'History'} (${myHistory.length})</button>`;
    html += `</div>`;

    html += `<div class="my-tab-pane" data-mytab="mypend" style="${myDefaultTab === 'mypend' ? '' : 'display:none'}">`;
    if (myPending.length === 0) {
      html += `<div style="color:var(--text-muted);font-size:0.85rem;padding:8px 0">${lang === 'th' ? 'ไม่มีสลิปรอผล' : 'No pending slips'}</div>`;
    } else {
      myPending.forEach((slip, idx) => { html += renderSlip(slip, idx); });
    }
    html += `</div>`;

    html += `<div class="my-tab-pane" data-mytab="myhist" style="${myDefaultTab === 'myhist' ? '' : 'display:none'}">`;
    if (myHistory.length === 0) {
      html += `<div style="color:var(--text-muted);font-size:0.85rem;padding:8px 0">${lang === 'th' ? 'ยังไม่มีประวัติ' : 'No history yet'}</div>`;
    } else {
      myHistory.forEach((slip, idx) => { html += renderSlip(slip, myPending.length + idx); });
    }
    html += `</div>`;
  }

  html += `</div>`; // slip-list
  html += `</div>`; // bet-main-bet

  // ── Tab: สลิปเพื่อน (nested player sub-tabs) ─────────────────────
  html += `<div id="bet-main-friends" style="display:none">`;
  if (!pendingFriendSlips.length) {
    html += `<div style="color:var(--text-muted);text-align:center;padding:40px">${lang === 'th' ? 'ยังไม่มีสลิปเพื่อน' : "No friends' slips yet"}</div>`;
  } else {
    const fDefaultTab = friendReady.length > 0 ? 'fready' : 'fwait';
    html += `<div style="display:flex;gap:6px;margin-bottom:12px">`;
    html += `<button class="fstatus-tab" data-fs="fready" style="${fDefaultTab === 'fready' ? SUBTAB_ON : SUBTAB_OFF}">${lang === 'th' ? 'รอ approve' : 'Ready'} (${friendReady.length})</button>`;
    html += `<button class="fstatus-tab" data-fs="fwait"  style="${fDefaultTab === 'fwait'  ? SUBTAB_ON : SUBTAB_OFF}">${lang === 'th' ? 'รอผล' : 'Pending'} (${friendWaiting.length})</button>`;
    html += `</div>`;

    // Pane: รอ approve
    html += `<div class="fstatus-pane" data-fs="fready" style="${fDefaultTab === 'fready' ? '' : 'display:none'}">`;
    if (!friendReady.length) {
      html += `<div style="color:var(--text-muted);text-align:center;padding:24px;font-size:0.85rem">${lang === 'th' ? 'ยังไม่มี slip รอ approve' : 'No slips ready to approve'}</div>`;
    } else {
      const rPlayers = [...new Set(friendReady.map(s => s.player))];
      html += `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">`;
      html += `<button class="fready-ptab" data-frp="all" style="${SUBTAB_ON}">${lang === 'th' ? 'ทั้งหมด' : 'All'} (${friendReady.length})</button>`;
      rPlayers.forEach(p => { const n = friendReady.filter(s => s.player === p).length; html += `<button class="fready-ptab" data-frp="${p}" style="${SUBTAB_OFF}">${getDisplayName(p)} (${n})</button>`; });
      html += `</div>`;
      html += `<div class="fready-ppane" data-frp="all">`; friendReady.forEach(s => { html += renderSlipCard(s, { showPlayer: true, showCopy: true }); }); html += `</div>`;
      rPlayers.forEach(p => { html += `<div class="fready-ppane" data-frp="${p}" style="display:none">`; friendReady.filter(s => s.player === p).forEach(s => { html += renderSlipCard(s, { showPlayer: true, showCopy: true }); }); html += `</div>`; });
    }
    html += `</div>`;

    // Pane: รอผล
    html += `<div class="fstatus-pane" data-fs="fwait" style="${fDefaultTab === 'fwait' ? '' : 'display:none'}">`;
    if (!friendWaiting.length) {
      html += `<div style="color:var(--text-muted);text-align:center;padding:24px;font-size:0.85rem">${lang === 'th' ? 'ไม่มี slip รอผล' : 'No pending slips'}</div>`;
    } else {
      const wPlayers = [...new Set(friendWaiting.map(s => s.player))];
      html += `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">`;
      html += `<button class="fwait-ptab" data-fwp="all" style="${SUBTAB_ON}">${lang === 'th' ? 'ทั้งหมด' : 'All'} (${friendWaiting.length})</button>`;
      wPlayers.forEach(p => { const n = friendWaiting.filter(s => s.player === p).length; html += `<button class="fwait-ptab" data-fwp="${p}" style="${SUBTAB_OFF}">${getDisplayName(p)} (${n})</button>`; });
      html += `</div>`;
      html += `<div class="fwait-ppane" data-fwp="all">`; friendWaiting.forEach(s => { html += renderSlipCard(s, { showPlayer: true, showCopy: true }); }); html += `</div>`;
      wPlayers.forEach(p => { html += `<div class="fwait-ppane" data-fwp="${p}" style="display:none">`; friendWaiting.filter(s => s.player === p).forEach(s => { html += renderSlipCard(s, { showPlayer: true, showCopy: true }); }); html += `</div>`; });
    }
    html += `</div>`;
  }
  html += `</div>`; // bet-main-friends

  container.innerHTML = html;
  bindGwPicker(container);

  // Rules toggle
  container.querySelector('#bet-rules-toggle')?.addEventListener('click', () => {
    const txt = container.querySelector('#bet-rules-text');
    const btn = container.querySelector('#bet-rules-toggle');
    const open = txt.style.display === 'none';
    txt.style.display = open ? '' : 'none';
    btn.textContent = open ? (currentLang === 'th' ? 'กติกา ▾' : 'Rules ▾') : (currentLang === 'th' ? 'กติกา ▸' : 'Rules ▸');
  });

  // Random pick chips — สุ่ม N picks จาก slot pool (AH slot + O/U slot ต่อคู่)
  container.querySelectorAll('.bet-random-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const countRaw = chip.dataset.count;
      const matchIds = [...new Set(
        [...container.querySelectorAll('.bet-pick:not([disabled])')].map(b => b.dataset.match)
      )].filter(Boolean);
      const slots = [];
      matchIds.forEach(id => {
        const ahBtns = [...container.querySelectorAll(`.ah-btn.bet-pick:not(.ou-btn)[data-match="${id}"]`)];
        const ouBtns = [...container.querySelectorAll(`.ou-btn.bet-pick[data-match="${id}"]`)];
        if (ahBtns.length) slots.push(ahBtns);
        if (ouBtns.length) slots.push(ouBtns);
      });
      slots.sort(() => Math.random() - 0.5);
      const n = countRaw === 'all' ? slots.length : Math.min(parseInt(countRaw), slots.length);
      [...container.querySelectorAll('.bet-pick.selected')].forEach(btn => btn.click());
      slots.slice(0, n).forEach(btns => {
        btns[Math.floor(Math.random() * btns.length)].click();
      });
    });
  });

  // Copy friend slip → pre-fill bet picks
  container.querySelectorAll('.slip-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ts = btn.dataset.ts;
      const allSlips = getAllSlips();
      const slip = allSlips.find(s => String(s.timestamp) === String(ts));
      if (!slip) return;

      const validPicks = (slip.picks || []).filter(p => {
        const m = (state.matchById && state.matchById[p.match_id]) || MATCHES.find(x => x.id === p.match_id);
        return m && !isMatchLocked(m);
      });

      if (!validPicks.length) {
        showToast(currentLang === 'th' ? 'ทุก match ล็อคแล้ว copy ไม่ได้' : 'All matches locked');
        return;
      }

      // Switch to แทงบอล tab
      container.querySelectorAll('.bet-main-tab').forEach(b => {
        b.style.cssText = b.dataset.main === 'bet' ? tabOn : tabOff;
      });
      container.querySelector('#bet-main-bet').style.display     = '';
      container.querySelector('#bet-main-friends').style.display = 'none';

      // Click matching bet-pick buttons to select them
      validPicks.forEach(p => {
        const sel = `.bet-pick[data-match="${p.match_id}"][data-type="${p.type}"][data-pick="${p.pick}"]`;
        const pickBtn = container.querySelector(sel);
        if (pickBtn && !pickBtn.classList.contains('selected')) pickBtn.click();
      });

      showToast(currentLang === 'th' ? `Copy ${validPicks.length} picks แล้ว` : `Copied ${validPicks.length} picks`);
      container.querySelector('#bet-main-bet')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Follow bet (แทงตามเลย)
  container.querySelectorAll('.slip-follow-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ts = btn.dataset.ts;
      const allSlips = getAllSlips();
      const slip = allSlips.find(s => String(s.timestamp) === String(ts));
      if (!slip) return;

      const validPicks = (slip.picks || []).filter(p => {
        const m = (state.matchById && state.matchById[p.match_id]) || MATCHES.find(x => x.id === p.match_id);
        return m && !isMatchLocked(m);
      });

      if (!validPicks.length) {
        showToast(currentLang === 'th' ? 'ทุก match ล็อคแล้ว' : 'All matches locked');
        return;
      }

      const pickSummary = validPicks.map(p => {
        const m = (state.matchById && state.matchById[p.match_id]) || MATCHES.find(x => x.id === p.match_id);
        const t1 = TEAMS[m?.team1], t2 = TEAMS[m?.team2];
        const name1 = t1 ? (currentLang === 'th' ? t1.nameTh : t1.name) : m?.team1;
        const name2 = t2 ? (currentLang === 'th' ? t2.nameTh : t2.name) : m?.team2;
        const isOu = p.type === 'ou';
        const pickName = isOu
          ? (p.pick === 'over' ? 'สูง' : 'ต่ำ') + ' ' + (p.line || '')
          : (TEAMS[p.pick] ? (currentLang === 'th' ? TEAMS[p.pick].nameTh : TEAMS[p.pick].name) : p.pick);
        return `${name1}-${name2}: ${pickName} @${p.odds}`;
      }).join('\n');

      const msg = `แทงตาม ${getDisplayName(slip.player)}\n${pickSummary}\nจำนวน: ${fmtM(slip.bet)}\n\nยืนยัน?`;
      if (!window.confirm(msg)) return;

      const combinedOdds = validPicks.reduce((a, p) => a * p.odds, 1);
      const newSlip = {
        bet: slip.bet,
        combined_odds: Math.round(combinedOdds * 1000) / 1000,
        payout: Math.round(slip.bet * combinedOdds),
        picks: validPicks.map(p => ({
          match_id: p.match_id,
          pick: p.pick,
          odds: p.odds,
          type: p.type,
          line: p.line,
        })),
      };

      btn.disabled = true;
      btn.textContent = '...';
      const result = await submitSlip(newSlip);
      if (result && result.success) {
        showToast(currentLang === 'th' ? 'แทงตามแล้ว!' : 'Bet placed!');
        renderBetting();
      } else if (result && result.code === 'odds_changed') {
        // Copying a friend's slip copies their price too — it may have moved since
        await handleOddsRejection();
      } else if (result && result.code === 'match_locked') {
        showToast(currentLang === 'th' ? 'คู่นี้ปิดรับแทงแล้ว' : 'Match is closed', 5000);
        await refreshMatches();
        renderBetting();
      } else {
        showToast((result && result.error) || (currentLang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error'));
        btn.disabled = false;
        btn.textContent = 'แทงตาม';
      }
    });
  });

  // Top tab switching (แทงบอล / สลิปเพื่อน / ภาพรวม)
  container.querySelectorAll('.bet-main-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.main;
      container.querySelectorAll('.bet-main-tab').forEach(b => { b.style.cssText = b.dataset.main === key ? tabOn : tabOff; });
      container.querySelector('#bet-main-bet').style.display     = key === 'bet'     ? '' : 'none';
      container.querySelector('#bet-main-friends').style.display = key === 'friends' ? '' : 'none';
    });
  });

  // สลิปเพื่อน — status tabs (รอ approve / รอผล)
  container.querySelectorAll('.fstatus-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.fs;
      container.querySelectorAll('.fstatus-tab').forEach(b => { b.style.cssText = b.dataset.fs === key ? SUBTAB_ON : SUBTAB_OFF; });
      container.querySelectorAll('.fstatus-pane').forEach(p => { p.style.display = p.dataset.fs === key ? '' : 'none'; });
    });
  });
  container.querySelectorAll('.fready-ptab').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.frp;
      container.querySelectorAll('.fready-ptab').forEach(b => { b.style.cssText = b.dataset.frp === key ? SUBTAB_ON : SUBTAB_OFF; });
      container.querySelectorAll('.fready-ppane').forEach(p => { p.style.display = p.dataset.frp === key ? '' : 'none'; });
    });
  });
  container.querySelectorAll('.fwait-ptab').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.fwp;
      container.querySelectorAll('.fwait-ptab').forEach(b => { b.style.cssText = b.dataset.fwp === key ? SUBTAB_ON : SUBTAB_OFF; });
      container.querySelectorAll('.fwait-ppane').forEach(p => { p.style.display = p.dataset.fwp === key ? '' : 'none'; });
    });
  });

  // My slips subtab switching
  container.querySelectorAll('.my-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.mytab;
      container.querySelectorAll('.my-tab-btn').forEach(b => { b.style.cssText = b.dataset.mytab === key ? SUBTAB_ON : SUBTAB_OFF; });
      container.querySelectorAll('.my-tab-pane').forEach(p => { p.style.display = p.dataset.mytab === key ? '' : 'none'; });
    });
  });


  // Pick state: key = "matchId_ah" / "matchId_ou" / "matchId_corner" / "matchId_card"
  let betPicks = {};

  // Click handlers for picks (toggle on/off)
  container.querySelectorAll('.bet-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      const matchId  = btn.dataset.match;
      const pick     = btn.dataset.pick;
      const odds     = parseFloat(btn.dataset.odds);
      const pickType = btn.dataset.type || (btn.classList.contains('ou-btn') ? 'ou' : 'ah');
      const key      = matchId + '_' + pickType;

      if (btn.classList.contains('selected')) {
        btn.classList.remove('selected');
        delete betPicks[key];
      } else {
        container.querySelectorAll(`.bet-pick[data-match="${matchId}"][data-type="${pickType}"]`).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        betPicks[key] = { matchId, pick, odds, pickType };
      }
      updateBettingSummary(betPicks, container);
    });
  });

  container.querySelector('#bet-amount')?.addEventListener('input', () => {
    updateBettingSummary(betPicks, container);
  });

  // Save button
  container.querySelector('#bet-save-btn')?.addEventListener('click', async () => {
    const betAmount = parseInt(container.querySelector('#bet-amount').value) || 0;
    const pickEntries = Object.entries(betPicks);
    const pickCount = pickEntries.length;
    const matchCount = new Set(pickEntries.map(([, d]) => d.matchId)).size;

    // Validate: max 2 picks per match; single (1 pick), step (2 in 1 match, or multi-match)
    const _ppm = {};
    pickEntries.forEach(([, d]) => { _ppm[d.matchId] = (_ppm[d.matchId] || 0) + 1; });
    const _tooMany = Object.values(_ppm).some(n => n > 2);
    let valid = false;
    if (_tooMany) valid = false;
    // Singles used to be allowed only on matches kicking off today, which in a
    // gameweek view meant the button silently did nothing. Any open match now.
    else if (pickCount === 1) valid = true;
    // AH + O/U on one match used to be allowed here. It was never a real bet
    // type — every such slip in the WC pool was cancelled by hand — and a step
    // is 3 picks minimum, so it is refused with a reason instead.
    else if (pickCount === 2) {
      showToast(lang === 'th' ? 'สเต็ปขั้นต่ำ 3 picks' : 'A step needs at least 3 picks', 4000);
      return;
    }
    else if (matchCount >= 3) valid = true;
    else if (matchCount === 2 && pickCount >= 4) valid = true;

    if (!valid) return;

    // House rules, mirrored from BET_RULES. The server enforces the same limits
    // in validatePicks/submitSlip — this is only so the message is instant.
    const isStepSlip = pickCount >= BET_RULES.MIN_STEP_PICKS;
    if (betAmount < BET_RULES.MIN_BET) {
      showToast(lang === 'th' ? `ขั้นต่ำ ${BET_RULES.MIN_BET}` : `Min ${BET_RULES.MIN_BET}`);
      return;
    }
    // Only เต็ง has a stake cap — the payout cap below bounds steps
    if (!isStepSlip && betAmount > BET_RULES.MAX_SINGLE) {
      showToast(lang === 'th'
        ? `เต็งสูงสุด ${fmtM(BET_RULES.MAX_SINGLE)}`
        : `Single max ${fmtM(BET_RULES.MAX_SINGLE)}`, 4000);
      return;
    }
    const previewPayout = Math.round(betAmount * pickEntries.reduce((a, [, d]) => a * d.odds, 1));
    if (previewPayout > BET_RULES.MAX_PAYOUT) {
      showToast(lang === 'th'
        ? `ได้สูงสุด ${fmtM(BET_RULES.MAX_PAYOUT)} ต่อสลิป — ลดเงินหรือลดคู่`
        : `Max payout ${fmtM(BET_RULES.MAX_PAYOUT)} per slip — lower the stake or drop a leg`, 5000);
      return;
    }
    const cutoffMs = (isStepSlip ? BET_RULES.STEP_CUTOFF_MIN : BET_RULES.SINGLE_CUTOFF_MIN) * 60 * 1000;
    const tooLate = pickEntries.some(([, d]) => {
      const m = (state.matchById && state.matchById[d.matchId]);
      return m && Date.now() >= kickoffUtc(m.date).getTime() - cutoffMs;
    });
    if (tooLate) {
      showToast(lang === 'th' ? 'คู่นี้ปิดรับแทงแล้ว' : 'Match is closed', 5000);
      return;
    }
    // เต็ง has an opening time too — say when, rather than just refusing.
    // The admin can override the opening per gameweek from the ราคา tab; the
    // server checks the same thing, this is only so the message is instant.
    if (!isStepSlip) {
      const sm = (state.matchById && state.matchById[pickEntries[0][1].matchId]);
      const betState = sm ? betStateOfGw(sm.gw) : 'auto';
      if (betState === 'closed') {
        showToast(lang === 'th' ? 'ตอนนี้ปิดรับเต็ง — สเต็ปยังแทงได้' : 'Singles are closed right now — steps are still open', 5000);
        return;
      }
      const opensAt = sm && betState === 'auto' ? singleOpensAt(sm.gw) : 0;
      if (opensAt && Date.now() < opensAt) {
        const t = new Date(opensAt + 7 * 3600 * 1000);
        const d = `${t.getUTCDate()}/${t.getUTCMonth() + 1}`;
        const hhmm = `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}`;
        showToast(lang === 'th'
          ? `เต็งยังไม่เปิด — เปิด ${d} ${hhmm} น.`
          : `Singles not open yet — opens ${d} ${hhmm}`, 6000);
        return;
      }
    }

    const dup = checkDuplicatePicks(betPicks);
    if (dup) {
      if (!window.confirm(lang === 'th' ? 'มีสลิปนี้อยู่แล้ว\nแน่ใจจะแทงซ้ำ?' : 'Duplicate slip — place anyway?')) return;
    }

    const picks = pickEntries.map(([, data]) => ({
      match_id: data.matchId,
      pick: data.pick,
      odds: data.odds,
      type: data.pickType,
      line: data.pickType === 'corner'   ? state.cornerLines[data.matchId]
          : data.pickType === 'card'     ? state.cardLines[data.matchId]
          : data.pickType === 'ou'       ? state.ouLines[data.matchId]
          : data.pickType === 'champion' ? null
          :                                state.ahLines[data.matchId],
    }));

    const combinedOdds = picks.reduce((acc, p) => acc * p.odds, 1);

    const slip = {
      bet: betAmount,
      combined_odds: Math.round(combinedOdds * 1000) / 1000,
      payout: Math.round(betAmount * combinedOdds),
      picks: picks,
    };

    if (typeof submitSlip === 'function') {
      showLoading();
      // Last-second price check, so a stale tab finds out here rather than
      // getting rejected by the server
      const moved = await refreshMatches();
      if (moved && oddsMovedFor(picks)) {
        hideLoading();
        await handleOddsRejection();
        return;
      }
      const result = await submitSlip(slip);
      hideLoading();
      if (result && !result.success) {
        if (result.code === 'odds_changed') { await handleOddsRejection(); return; }
        if (result.code === 'need_3_picks') {
          showToast(lang === 'th' ? 'สเต็ปขั้นต่ำ 3 picks' : 'A step needs at least 3 picks', 4000);
          return;
        }
        if (result.code === 'single_too_early') {
          showToast(lang === 'th' ? 'เต็งยังไม่เปิดสำหรับนัดนี้' : 'Singles are not open yet for this gameweek', 5000);
          return;
        }
        // Admin closed เต็ง for this gameweek while the tab was open
        if (result.code === 'bet_closed') {
          showToast(lang === 'th' ? 'ตอนนี้ปิดรับเต็ง — สเต็ปยังแทงได้' : 'Singles are closed right now — steps are still open', 5000);
          await refreshMatches(true);
          return;
        }
        if (result.code === 'max_payout') {
          showToast(lang === 'th'
            ? `ได้สูงสุด ${fmtM(BET_RULES.MAX_PAYOUT)} ต่อสลิป`
            : `Max payout ${fmtM(BET_RULES.MAX_PAYOUT)} per slip`, 5000);
          return;
        }
        if (result.code === 'max_stake') {
          showToast(lang === 'th' ? `เกินลิมิต (สูงสุด ${fmtM(result.max)})` : `Over limit (max ${fmtM(result.max)})`, 5000);
          return;
        }
        if (result.code === 'match_locked') {
          showToast(lang === 'th' ? 'คู่นี้ปิดรับแทงแล้ว' : 'Match is closed', 5000);
          await refreshMatches();
          renderBetting();
          return;
        }
        showToast(result.error || 'Error');
        return;
      }
    }

    showToast(lang === 'th' ? 'บันทึกแล้ว' : 'Bet placed');
    renderBetting();
  });

  // Delete slip buttons
  container.querySelectorAll('.slip-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ts = btn.dataset.ts;
      if (typeof cancelSlip === 'function') {
        await cancelSlip(ts);
      }
      renderBetting();
    });
  });

  // Approve slip buttons (admin only)
  container.querySelectorAll('.slip-approve-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ts = btn.dataset.ts;
      const result = await approveSlip(ts);
      if (result && result.success) {
        const allSlips = getAllSlips();
        const slip = allSlips.find(s => String(s.timestamp) === String(ts));
        if (slip) slip.status = 'approved';
        updateTabBadges();
        showToast(lang === 'th' ? 'ยืนยันแล้ว' : 'Approved');
        renderBetting();
      } else {
        showToast(result?.error || 'Error');
      }
    });
  });

  // Logout
  container.querySelector('#bet-logout')?.addEventListener('click', () => {
    state.currentPlayer = null;
    localStorage.removeItem('epl2627_player');
    localStorage.removeItem('epl2627_pin');
    renderBetting();
  });
}

// --- Odds moved between tapping and submitting ---

// Do the picks the player is holding still match the odds now in state?
function oddsMovedFor(picks) {
  return (picks || []).some(p => {
    const cur = currentOddsFor(p);
    if (cur.odds == null) return true;
    return Math.abs(Number(p.odds) - cur.odds) > 1e-6
        || Math.abs(Number(p.line) - Number(cur.line)) > 1e-6;
  });
}

function currentOddsFor(p) {
  const m = (state.matchById || {})[p.match_id];
  if (!m) return { odds: null, line: null };
  if (p.type === 'ou') {
    return { odds: p.pick === 'over' ? state.ouOddsO[p.match_id] : state.ouOddsU[p.match_id], line: state.ouLines[p.match_id] };
  }
  return { odds: String(p.pick) === String(m.team1) ? state.ahOddsH[p.match_id] : state.ahOddsA[p.match_id], line: state.ahLines[p.match_id] };
}

// Never place the bet at either the old or the new price silently — show the new
// one and make them tap again.
async function handleOddsRejection() {
  await refreshMatches(true);   // fresh=1: skip the server cache, get the real price
  showToast(currentLang === 'th'
    ? 'ราคาเปลี่ยน — เลือกใหม่แล้วยืนยันอีกครั้ง'
    : 'Odds changed — please re-pick and confirm', 6000);
  renderBetting();
}

// Champion outright bet — WC-only, currently DORMANT. It keys off M101/M102/M104
// (the WC semi-finals and final), which don't exist in the EPL fixture list, so
// getChampionTeams() returns [] and renderChampionCard() renders nothing.
// Re-enabling it for a title winner needs a season-long slip that sits outside
// monthly settlement — left for later rather than half-wired now.
function isChampionLocked() {
  const m101 = (state.matchById && state.matchById['M101']) || MATCHES.find(x => x.id === 'M101');
  return m101 ? isMatchLocked(m101) : false;
}

function getChampionTeams() {
  const m101 = (state.matchById && state.matchById['M101']) || MATCHES.find(x => x.id === 'M101');
  const m102 = (state.matchById && state.matchById['M102']) || MATCHES.find(x => x.id === 'M102');
  const teams = [];
  [m101, m102].forEach(m => { if (m) { if (m.team1) teams.push(m.team1); if (m.team2) teams.push(m.team2); } });
  return teams;
}

function getChampionWinner() {
  const m104 = (state.matchById && state.matchById['M104']) || MATCHES.find(x => x.id === 'M104');
  const result = m104 && state.matches[m104.id];
  if (!m104 || !result || typeof result.team1_score !== 'number' || typeof result.team2_score !== 'number') return null;
  return result.team1_score > result.team2_score ? m104.team1 : m104.team2;
}

function renderChampionCard() {
  const lang = currentLang;
  const teams = getChampionTeams().filter(tc => TEAMS[tc] && state.championOdds[tc] != null);
  if (!teams.length) return '';

  const locked = isChampionLocked();
  const winner = getChampionWinner();

  let html = `<div class="card" style="padding:10px;margin-bottom:12px${locked ? ';opacity:0.7' : ''}">`;
  html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">`;
  html += `<span style="background:var(--primary);color:#fff;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;white-space:nowrap">🏆 ${lang === 'th' ? 'ทีมแชมป์' : 'Champion'}</span>`;
  if (locked && !winner) html += `<span style="font-size:0.75rem;color:var(--text-muted)">${lang === 'th' ? 'ปิดรับแทงแล้ว' : 'Betting closed'}</span>`;
  html += `</div>`;
  html += `<div style="display:flex;flex-wrap:wrap;gap:6px">`;
  teams.forEach(tc => {
    const t = TEAMS[tc];
    const name = lang === 'th' ? t.nameTh : t.name;
    const odds = state.championOdds[tc] || 2.00;
    if (locked) {
      const isWinner = winner === tc;
      const style = isWinner
        ? `disabled style="flex:1;min-width:120px;font-size:0.8rem;cursor:default;pointer-events:none;background:rgba(212,160,23,0.15);border:1px solid var(--accent);color:var(--accent);font-weight:700"`
        : `disabled style="flex:1;min-width:120px;font-size:0.8rem;cursor:default;pointer-events:none;opacity:0.35"`;
      html += `<button class="ah-btn" ${style}>${t.flag} ${name} <span class="odds-tag">@${odds}</span></button>`;
    } else {
      html += `<button class="ah-btn bet-pick" data-match="CHAMPION" data-pick="${tc}" data-odds="${odds}" data-type="champion" style="flex:1;min-width:120px;font-size:0.8rem">${t.flag} ${name} <span class="odds-tag">@${odds}</span></button>`;
    }
  });
  html += `</div></div>`;
  return html;
}

function renderBettingCardLocked(m) {
  const lang = currentLang;
  const t1 = TEAMS[m.team1];
  const t2 = TEAMS[m.team2];
  if (!t1 || !t2) return '';

  const ahLine     = state.ahLines[m.id] || '';
  const ouLine     = state.ouLines[m.id] || '';
  const cornerLine = state.cornerLines[m.id] || '';
  const cardLine   = state.cardLines[m.id] || '';
  const ahOddsH    = state.ahOddsH[m.id] || 1.80;
  const ahOddsA    = state.ahOddsA[m.id] || 1.90;
  const ouOddsO    = state.ouOddsO[m.id] || 1.90;
  const ouOddsU    = state.ouOddsU[m.id] || 1.90;
  const cOddsO     = state.cornerOddsO[m.id] || 1.90;
  const cOddsU     = state.cornerOddsU[m.id] || 1.90;
  const cardOddsO  = state.cardOddsO[m.id] || 1.90;
  const cardOddsU  = state.cardOddsU[m.id] || 1.90;
  const t1Name = lang === 'th' ? t1.nameTh : t1.name;
  const t2Name = lang === 'th' ? t2.nameTh : t2.name;
  const result = state.matches[m.id];
  const s1 = result?.team1_score;
  const s2 = result?.team2_score;
  const hasScore = typeof s1 === 'number' && typeof s2 === 'number';
  const scoreLabel = hasScore ? `${s1} - ${s2}` : (lang === 'th' ? 'กำลังแข่ง' : 'Live');
  const dis = 'disabled';

  let ahWinSide = null, ouWinSide = null, cornerWinSide = null, cardWinSide = null;
  if (hasScore && ahLine) {
    const ahOutcome = getAHOutcome(parseFloat(ahLine), s1, s2);
    if (ahOutcome.team1 === 'full' || ahOutcome.team1 === 'half') ahWinSide = 'team1';
    else if (ahOutcome.team2 === 'full' || ahOutcome.team2 === 'half') ahWinSide = 'team2';
  }
  if (hasScore && ouLine) {
    const ouOutcome = getOUOutcome(parseFloat(ouLine), s1 + s2);
    if (ouOutcome.over === 'full' || ouOutcome.over === 'half') ouWinSide = 'over';
    else if (ouOutcome.under === 'full' || ouOutcome.under === 'half') ouWinSide = 'under';
  }
  const cr = result?.corner_result;
  if (cornerLine && cr != null && cr !== '') {
    const cOut = getOUOutcome(parseFloat(cornerLine), parseFloat(cr));
    if (cOut.over === 'full' || cOut.over === 'half') cornerWinSide = 'over';
    else if (cOut.under === 'full' || cOut.under === 'half') cornerWinSide = 'under';
  }
  const cardR = result?.card_result;
  if (cardLine && cardR != null && cardR !== '') {
    const cardOut = getOUOutcome(parseFloat(cardLine), parseFloat(cardR));
    if (cardOut.over === 'full' || cardOut.over === 'half') cardWinSide = 'over';
    else if (cardOut.under === 'full' || cardOut.under === 'half') cardWinSide = 'under';
  }

  const btnStyle = (isWinner) => isWinner
    ? `${dis} style="flex:1;font-size:0.8rem;cursor:default;pointer-events:none;background:rgba(212,160,23,0.15);border:1px solid var(--accent);color:var(--accent);font-weight:700"`
    : `${dis} style="flex:1;font-size:0.8rem;cursor:default;pointer-events:none;opacity:0.35"`;

  let html = `<div class="card" style="padding:10px;margin-bottom:6px;position:relative;opacity:0.7">`;
  html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">`;
  html += `<span style="font-size:0.75rem;color:var(--text-muted)">${formatMatchDate(m, lang)}</span>`;
  html += `<span style="font-size:0.75rem">${t1.flag} ${t1Name} vs ${t2.flag} ${t2Name}</span>`;
  html += `<span style="font-size:0.8rem;font-weight:700;color:var(--text-muted)">${scoreLabel}</span>`;
  html += `</div>`;

  if (ahLine) {
    const ahH = formatAhFav(ahLine, true);
    const ahA = formatAhFav(ahLine, false);
    html += `<div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">`;
    html += `<span style="background:var(--secondary);color:#fff;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;white-space:nowrap">AH</span>`;
    html += `<button ${btnStyle(ahWinSide === 'team1')} class="ah-btn">${t1Name} <span style="font-weight:700">${ahH}</span> <span class="odds-tag">@${ahOddsH}</span></button>`;
    html += `<button ${btnStyle(ahWinSide === 'team2')} class="ah-btn">${t2Name} <span style="font-weight:700">${ahA}</span> <span class="odds-tag">@${ahOddsA}</span></button>`;
    html += `</div>`;
  }

  if (ouLine) {
    html += `<div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">`;
    html += `<span style="background:var(--accent);color:#000;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;white-space:nowrap">${lang === 'th' ? 'สูงต่ำ' : 'O/U'} ${ouLine}</span>`;
    html += `<button ${btnStyle(ouWinSide === 'over')} class="ah-btn ou-btn">${lang === 'th' ? 'สูง' : 'Over'} <span class="odds-tag">@${ouOddsO}</span></button>`;
    html += `<button ${btnStyle(ouWinSide === 'under')} class="ah-btn ou-btn">${lang === 'th' ? 'ต่ำ' : 'Under'} <span class="odds-tag">@${ouOddsU}</span></button>`;
    html += `</div>`;
  }

  if (cornerLine) {
    const cLabel = cr != null && cr !== '' ? ` (${cr})` : '';
    html += `<div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">`;
    html += `<span style="background:var(--text-muted);color:var(--bg-card);padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;white-space:nowrap">⛳ ${cornerLine}${cLabel}</span>`;
    html += `<button ${btnStyle(cornerWinSide === 'over')} class="ah-btn">${lang === 'th' ? 'มุมสูง' : 'Over'} <span class="odds-tag">@${cOddsO}</span></button>`;
    html += `<button ${btnStyle(cornerWinSide === 'under')} class="ah-btn">${lang === 'th' ? 'มุมต่ำ' : 'Under'} <span class="odds-tag">@${cOddsU}</span></button>`;
    html += `</div>`;
  }

  if (cardLine) {
    const cardLabel = cardR != null && cardR !== '' ? ` (${cardR})` : '';
    html += `<div style="display:flex;align-items:center;gap:4px">`;
    html += `<span style="background:var(--text-muted);color:var(--bg-card);padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;white-space:nowrap">🟨 ${cardLine}${cardLabel}</span>`;
    html += `<button ${btnStyle(cardWinSide === 'over')} class="ah-btn">${lang === 'th' ? 'ใบสูง' : 'Over'} <span class="odds-tag">@${cardOddsO}</span></button>`;
    html += `<button ${btnStyle(cardWinSide === 'under')} class="ah-btn">${lang === 'th' ? 'ใบต่ำ' : 'Under'} <span class="odds-tag">@${cardOddsU}</span></button>`;
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

function renderBettingCard(m) {
  const lang = currentLang;
  const t1 = TEAMS[m.team1];
  const t2 = TEAMS[m.team2];
  if (!t1 || !t2) return '';

  const ahLine     = state.ahLines[m.id] || '';
  const ouLine     = state.ouLines[m.id] || '';
  const cornerLine = state.cornerLines[m.id] || '';
  const cardLine   = state.cardLines[m.id] || '';
  const ahOddsH    = state.ahOddsH[m.id] || 1.80;
  const ahOddsA    = state.ahOddsA[m.id] || 1.90;
  const ouOddsO    = state.ouOddsO[m.id] || 1.90;
  const ouOddsU    = state.ouOddsU[m.id] || 1.90;
  const cOddsO     = state.cornerOddsO[m.id] || 1.90;
  const cOddsU     = state.cornerOddsU[m.id] || 1.90;
  const cardOddsO  = state.cardOddsO[m.id] || 1.90;
  const cardOddsU  = state.cardOddsU[m.id] || 1.90;
  const t1Name = lang === 'th' ? t1.nameTh : t1.name;
  const t2Name = lang === 'th' ? t2.nameTh : t2.name;

  let html = `<div class="card" style="padding:10px;margin-bottom:6px">`;
  html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">`;
  html += `<span style="font-size:0.75rem;color:var(--text-muted)">${formatMatchDate(m, lang)}</span>`;
  html += `<span style="font-size:0.75rem">${t1.flag} ${t1Name} vs ${t2.flag} ${t2Name}</span>`;
  html += `</div>`;

  if (ahLine) {
    const ahH = formatAhFav(ahLine, true);
    const ahA = formatAhFav(ahLine, false);
    html += `<div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">`;
    html += `<span style="background:var(--secondary);color:#fff;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;white-space:nowrap">AH</span>`;
    html += `<button class="ah-btn bet-pick" data-match="${m.id}" data-pick="${m.team1}" data-odds="${ahOddsH}" data-type="ah" style="flex:1;font-size:0.8rem">${t1.flag} ${t1Name} <span style="font-weight:700">${ahH}</span> <span class="odds-tag">@${ahOddsH}</span></button>`;
    html += `<button class="ah-btn bet-pick" data-match="${m.id}" data-pick="${m.team2}" data-odds="${ahOddsA}" data-type="ah" style="flex:1;font-size:0.8rem">${t2.flag} ${t2Name} <span style="font-weight:700">${ahA}</span> <span class="odds-tag">@${ahOddsA}</span></button>`;
    html += `</div>`;
  }

  if (ouLine) {
    html += `<div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">`;
    html += `<span style="background:var(--accent);color:#000;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;white-space:nowrap">${lang === 'th' ? 'สูงต่ำ' : 'O/U'} ${ouLine}</span>`;
    html += `<button class="ah-btn ou-btn bet-pick" data-match="${m.id}" data-pick="over"  data-odds="${ouOddsO}" data-type="ou" style="flex:1;font-size:0.8rem">${lang === 'th' ? 'สูง' : 'Over'} <span class="odds-tag">@${ouOddsO}</span></button>`;
    html += `<button class="ah-btn ou-btn bet-pick" data-match="${m.id}" data-pick="under" data-odds="${ouOddsU}" data-type="ou" style="flex:1;font-size:0.8rem">${lang === 'th' ? 'ต่ำ' : 'Under'} <span class="odds-tag">@${ouOddsU}</span></button>`;
    html += `</div>`;
  }

  if (cornerLine) {
    html += `<div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">`;
    html += `<span style="background:var(--text-muted);color:var(--bg-card);padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;white-space:nowrap">⛳ ${cornerLine}</span>`;
    html += `<button class="ah-btn corner-btn bet-pick" data-match="${m.id}" data-pick="over"  data-odds="${cOddsO}" data-type="corner" style="flex:1;font-size:0.8rem">${lang === 'th' ? 'มุมสูง' : 'Over'} <span class="odds-tag">@${cOddsO}</span></button>`;
    html += `<button class="ah-btn corner-btn bet-pick" data-match="${m.id}" data-pick="under" data-odds="${cOddsU}" data-type="corner" style="flex:1;font-size:0.8rem">${lang === 'th' ? 'มุมต่ำ' : 'Under'} <span class="odds-tag">@${cOddsU}</span></button>`;
    html += `</div>`;
  }

  if (cardLine) {
    html += `<div style="display:flex;align-items:center;gap:4px">`;
    html += `<span style="background:var(--text-muted);color:var(--bg-card);padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;white-space:nowrap">🟨 ${cardLine}</span>`;
    html += `<button class="ah-btn card-btn bet-pick" data-match="${m.id}" data-pick="over"  data-odds="${cardOddsO}" data-type="card" style="flex:1;font-size:0.8rem">${lang === 'th' ? 'ใบสูง' : 'Over'} <span class="odds-tag">@${cardOddsO}</span></button>`;
    html += `<button class="ah-btn card-btn bet-pick" data-match="${m.id}" data-pick="under" data-odds="${cardOddsU}" data-type="card" style="flex:1;font-size:0.8rem">${lang === 'th' ? 'ใบต่ำ' : 'Under'} <span class="odds-tag">@${cardOddsU}</span></button>`;
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

function checkDuplicatePicks(picks) {
  const pending = (state.slips || []).filter(s => s.status === 'pending');
  if (!pending.length || !Object.keys(picks).length) return null;
  const newKeys = new Set(Object.values(picks).map(p => `${p.matchId}_${p.pickType}_${p.pick}`));
  for (const slip of pending) {
    const slipKeys = new Set((slip.picks || []).map(p => `${p.match_id}_${p.type}_${p.pick}`));
    const overlap = [...newKeys].filter(k => slipKeys.has(k));
    if (overlap.length === newKeys.size && newKeys.size === slipKeys.size) return { type: 'exact', slip };
  }
  return null;
}

function updateBettingSummary(picks, container) {
  const lang = currentLang;
  const keys = Object.keys(picks);
  const matchCount = new Set(keys.map(k => picks[k].matchId)).size;
  const summaryEl = container.querySelector('#bet-summary');
  const oddsEl = container.querySelector('#bet-odds-display');
  const payoutEl = container.querySelector('#bet-payout-display');
  const saveBtn = container.querySelector('#bet-save-btn');
  const betAmount = parseInt(container.querySelector('#bet-amount')?.value) || 0;

  if (!summaryEl) return;

  // Validate: max 2 picks per match, 1 pick = single, 2 picks (1 match) = step, 3+ = step
  let pickType = '';
  let valid = true;

  const picksPerMatch = {};
  Object.values(picks).forEach(p => { picksPerMatch[p.matchId] = (picksPerMatch[p.matchId] || 0) + 1; });
  const tooManyInMatch = Object.values(picksPerMatch).some(n => n > 2);

  if (tooManyInMatch) {
    pickType = lang === 'th' ? '1 คู่ max 2 picks (AH/O/U/มุม)' : 'Max 2 picks per match';
    valid = false;
  } else if (keys.length === 1) {
    const sd = Object.values(picks)[0];
    const sm = (state.matchById && state.matchById[sd.matchId]) || MATCHES.find(x => x.id === sd.matchId);
    if (sm && !isMatchToday(sm)) {
      pickType = lang === 'th' ? 'เต็ง 1 แทงได้แค่วันที่แข่ง' : 'Single: match-day only';
      valid = false;
    } else {
      pickType = 'SINGLE';
    }
  } else if (keys.length === 2 && matchCount === 1) {
    pickType = 'STEP';
  } else if (keys.length >= 4 && matchCount >= 2) {
    pickType = 'STEP';
  } else if (keys.length >= 3 && matchCount >= 3) {
    pickType = 'STEP';
  } else if (matchCount === 2 && keys.length < 4) {
    pickType = lang === 'th' ? '2 คู่ต้อง 4 picks (AH+O/U)' : '2 matches need 4 picks (AH+O/U)';
    valid = false;
  } else {
    pickType = lang === 'th' ? 'ต้อง 3+ คู่ หรือ 2 คู่×4 picks' : 'Need 3+ matches or 2 matches × 4 picks';
    valid = false;
  }

  summaryEl.textContent = `${lang === 'th' ? 'เลือก' : 'Picks'}: ${keys.length} (${matchCount} ${lang === 'th' ? 'คู่' : 'matches'}) — ${pickType}`;

  if (valid) {
    const combinedOdds = Object.values(picks).reduce((acc, p) => acc * p.odds, 1);
    const payout = Math.round(betAmount * combinedOdds);
    const profit = payout - betAmount;
    oddsEl.textContent = `${lang === 'th' ? 'ราคารวม' : 'Odds'}: ${combinedOdds.toFixed(3)}`;
    oddsEl.style.color = 'var(--accent)';

    const capMsgs = [
      'โอ้โห แทงเยอะจัง — จ่ายสูงสุดแค่ 100,000 ต่อ slip นะ 😂',
      'step เทพมากเลย แต่ขอบอกว่า max จ่าย 100,000 นะจ้ะ 🙏',
      'ฝันหวานดี แต่ได้รับสูงสุดแค่ 100,000 ต่อ slip นะเว้ย 555',
      'อย่าโลภ — จ่ายสูงสุด 100,000 ต่อ slip แค่นั้นเอง 😅',
      'ได้ไม่เกิน 100,000 ต่อ slip นะ ไม่ว่าจะถูกกี่ตัว 😤',
    ];
    const capWarn = payout > 100000
      ? `<div style="margin-top:6px;font-size:0.95rem;font-weight:800;color:#f97316">⚠️ ${capMsgs[Math.floor(Math.random() * capMsgs.length)]}</div>`
      : '';
    payoutEl.innerHTML = `${lang === 'th' ? 'ถูก' : 'Win'}: ${fmtM(payout)} (+${fmtM(profit)}) · ${lang === 'th' ? 'ผิด' : 'Lose'}: -${fmtM(betAmount)}${capWarn}`;
    payoutEl.style.color = 'var(--accent)';
    const dup = checkDuplicatePicks(picks);
    if (dup) {
      payoutEl.innerHTML += `<div style="margin-top:4px;font-size:0.82rem;color:#f97316;font-weight:700">${lang === 'th' ? '⚠️ มีสลิปนี้อยู่แล้ว — แน่ใจจะแทงซ้ำ?' : '⚠️ Duplicate slip — place anyway?'}</div>`;
    }
    if (saveBtn) saveBtn.disabled = false;
  } else {
    const combinedOdds = Object.values(picks).reduce((acc, p) => acc * p.odds, 1);
    oddsEl.textContent = `${lang === 'th' ? 'ราคารวม' : 'Odds'}: ${combinedOdds.toFixed(3)}`;
    oddsEl.style.color = 'var(--text-muted)';
    payoutEl.textContent = pickType;
    payoutEl.style.color = 'var(--wrong)';
    saveBtn.disabled = true;
  }
}

function renderSlip(slip, idx) {
  return renderSlipCard(slip, { idx, showPlayer: state.isAdmin, showDelete: true, showDetails: true });
}

function getPickResultBadge(pick, match) {
  if (pick.type === 'champion') {
    const winner = getChampionWinner();
    if (!winner) return '';
    return pick.pick === winner ? '<span class="badge badge-exact">✓</span>' : '<span class="badge badge-wrong">✗</span>';
  }

  const result = state.matches[match.id];

  if (pick.type === 'corner') {
    if (!result || result.corner_result == null || result.corner_result === '') return '';
    const cornerLine = pick.line || state.cornerLines[match.id];
    if (!cornerLine) return '';
    const outcome = getOUOutcome(parseFloat(cornerLine), parseFloat(result.corner_result));
    const res = outcome[pick.pick];
    if (res === 'full') return '<span class="badge badge-exact">✓</span>';
    if (res === 'half') return '<span class="badge badge-exact">½✓</span>';
    if (res === 'push') return '<span class="badge badge-correct">Push</span>';
    if (res === 'half_loss') return '<span class="badge badge-wrong">½✗</span>';
    return '<span class="badge badge-wrong">✗</span>';
  }

  if (pick.type === 'card') {
    if (!result || result.card_result == null || result.card_result === '') return '';
    const cardLine = pick.line || state.cardLines[match.id];
    if (!cardLine) return '';
    const outcome = getOUOutcome(parseFloat(cardLine), parseFloat(result.card_result));
    const res = outcome[pick.pick];
    if (res === 'full') return '<span class="badge badge-exact">✓</span>';
    if (res === 'half') return '<span class="badge badge-exact">½✓</span>';
    if (res === 'push') return '<span class="badge badge-correct">Push</span>';
    if (res === 'half_loss') return '<span class="badge badge-wrong">½✗</span>';
    return '<span class="badge badge-wrong">✗</span>';
  }

  if (!result || typeof result.team1_score !== 'number' || typeof result.team2_score !== 'number') return '';

  if (pick.type === 'ou') {
    const ouLine = pick.line || state.ouLines[match.id];
    if (!ouLine) return '';
    const total = result.team1_score + result.team2_score;
    const outcome = getOUOutcome(parseFloat(ouLine), total);
    const res = outcome[pick.pick];
    if (res === 'full') return '<span class="badge badge-exact">✓</span>';
    if (res === 'half') return '<span class="badge badge-exact">½✓</span>';
    if (res === 'push') return '<span class="badge badge-correct">Push</span>';
    if (res === 'half_loss') return '<span class="badge badge-wrong">½✗</span>';
    return '<span class="badge badge-wrong">✗</span>';
  } else {
    const ahLine = pick.line || state.ahLines[match.id];
    if (!ahLine) return '';
    const outcome = getAHOutcome(parseFloat(ahLine), result.team1_score, result.team2_score);
    const side = pick.pick === match.team1 ? 'team1' : 'team2';
    const res = outcome[side];
    if (res === 'full') return '<span class="badge badge-exact">✓</span>';
    if (res === 'half') return '<span class="badge badge-exact">½✓</span>';
    if (res === 'push') return '<span class="badge badge-correct">Push</span>';
    if (res === 'half_loss') return '<span class="badge badge-wrong">½✗</span>';
    return '<span class="badge badge-wrong">✗</span>';
  }
}

function renderSlipCard(slip, opts) {
  opts = opts || {};
  const lang        = currentLang;
  const showPlayer  = !!opts.showPlayer;
  const showDelete  = !!opts.showDelete;
  const showDetails = !!opts.showDetails;

  const resolved     = typeof resolveSlip === 'function' ? resolveSlip(slip) : { status: slip.status, profit: 0 };
  const st           = resolved.status;
  const picks        = slip.picks || [];
  const isStep       = picks.length >= 2;
  const isApproved   = slip.status === 'approved';
  const needsApprove = state.isAdmin && (st === 'won' || st === 'lost') && slip.status !== 'approved' && slip.status !== 'cancelled';

  const statusColors = { pending: 'var(--secondary)', won: 'var(--accent)', lost: 'var(--secondary)', approved: 'var(--accent)' };
  const statusLabels = { pending: lang === 'th' ? 'รอผล' : 'Pending', won: lang === 'th' ? 'ถูก' : 'Won', lost: lang === 'th' ? 'ผิด' : 'Lost', approved: lang === 'th' ? 'ยืนยันแล้ว' : 'Approved' };

  let cardStyle = 'border:1px solid var(--border);background:var(--bg-card)';
  if      (st === 'lost')              cardStyle = 'border:3px solid var(--secondary);box-shadow:0 0 0 3px rgba(46,134,171,0.20);background:rgba(46,134,171,0.10)';
  else if (st === 'won' || isApproved) cardStyle = 'border:3px solid var(--accent);box-shadow:0 0 0 3px rgba(240,201,41,0.25);background:rgba(240,201,41,0.10)';

  const _sd = [slip.player, getDisplayName(slip.player)];
  picks.forEach(p => {
    if (p.type === 'ou') { _sd.push('ou over under สูง ต่ำ'); }
    else { const t = TEAMS[p.pick]; _sd.push(p.pick); if (t) { _sd.push(t.name, t.nameTh); } }
    const _m = MATCHES.find(x => x.id === p.match_id);
    if (_m) { [_m.team1, _m.team2].forEach(tc => { const t2 = TEAMS[tc]; _sd.push(tc); if (t2) _sd.push(t2.name, t2.nameTh); }); }
  });
  const _search = _sd.filter(Boolean).join(' ').toLowerCase();

  let html = `<div class="card slip-card" data-search="${_search}" style="padding:10px;margin-bottom:8px;${cardStyle}">`;

  // Header
  html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">`;
  html += `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">`;
  if (showPlayer) html += `<span style="font-size:0.88rem;font-weight:700;color:var(--primary)">${getDisplayName(slip.player)}</span>`;
  { const d = new Date(slip.timestamp); const idxPart = opts.idx != null ? `#${opts.idx + 1} · ` : ''; html += `<span style="font-size:0.75rem;color:var(--text-muted)">${idxPart}${d.toLocaleDateString('th-TH')} ${d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>`; }
  html += `<span style="font-size:0.72rem;color:var(--text-muted);background:var(--bg-input);padding:2px 7px;border-radius:4px">${isStep ? 'STEP' : 'SINGLE'}</span>`;
  html += `</div>`;
  html += `<div style="display:flex;align-items:center;gap:8px">`;
  if (showDelete) {
    const ownPending = slip.player === state.currentPlayer && slip.status === 'pending';
    const noLocked   = !picks.some(p => { const m = (state.matchById && state.matchById[p.match_id]) || MATCHES.find(x => x.id === p.match_id); return m && isMatchLocked(m); });
    if (ownPending && (state.isAdmin || noLocked)) {
      html += `<button class="slip-delete-btn" data-ts="${slip.timestamp}" style="background:var(--wrong);border:none;color:#fff;padding:5px 14px;border-radius:6px;font-size:0.85rem;font-weight:700;cursor:pointer">🗑 ${lang === 'th' ? 'ลบสลิป' : 'Delete'}</button>`;
      if (!state.isAdmin && noLocked) {
        const earliest = picks.reduce((min, p) => {
          const m = (state.matchById && state.matchById[p.match_id]) || MATCHES.find(x => x.id === p.match_id);
          const t = m ? kickoffUtc(m.date).getTime() - 10 * 60 * 1000 : Infinity;
          return Math.min(min, t);
        }, Infinity);
        const msLeft = earliest - Date.now();
        if (msLeft > 0) {
          const h = Math.floor(msLeft / 3600000);
          const m = Math.floor((msLeft % 3600000) / 60000);
          const label = h > 0 ? `${h}h ${m}m` : `${m}m`;
          html += `<span style="font-size:0.7rem;color:var(--text-muted)">⏱ ลบได้อีก ${label}</span>`;
        }
      }
    }
  }
  if (opts.showCopy) {
    html += `<button class="slip-copy-btn" data-ts="${slip.timestamp}" style="background:var(--secondary);border:none;color:#fff;padding:5px 12px;border-radius:6px;font-size:0.82rem;font-weight:700;cursor:pointer">Copy</button>`;
    html += `<button class="slip-follow-btn" data-ts="${slip.timestamp}" style="background:var(--accent);border:none;color:#000;padding:5px 12px;border-radius:6px;font-size:0.82rem;font-weight:700;cursor:pointer">แทงตาม</button>`;
  }
  if (needsApprove) {
    html += `<button class="slip-approve-btn" data-ts="${slip.timestamp}" style="background:var(--accent);color:#000;border:none;padding:4px 12px;border-radius:4px;font-size:0.78rem;font-weight:700;cursor:pointer">${lang === 'th' ? '✓ ยืนยัน' : '✓ Approve'}</button>`;
  }
  if (isApproved) {
    html += `<span style="background:var(--secondary);color:#fff;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700">✓ ${lang === 'th' ? 'ยืนยันแล้ว' : 'Approved'}</span>`;
  }
  html += `<span style="font-size:0.8rem;font-weight:700;color:${statusColors[st]}">${statusLabels[st]}</span>`;
  html += `</div></div>`;

  // Picks
  html += `<div style="margin-bottom:6px">`;
  picks.forEach(p => {
    if (p.type === 'champion') {
      const t = TEAMS[p.pick];
      const name = t ? (lang === 'th' ? t.nameTh : t.name) : p.pick;
      const pickLabel = `🏆 ${name}`;
      const badge = typeof getPickResultBadge === 'function' ? getPickResultBadge(p, null) : '';
      if (showDetails) {
        const winner = typeof getChampionWinner === 'function' ? getChampionWinner() : null;
        const pickOutcome = winner ? (p.pick === winner ? 'full' : 'loss') : null;
        let pickBg = '';
        if      (pickOutcome === 'full') pickBg = 'background:rgba(212,160,23,0.12);border-left:3px solid var(--accent);border-radius:4px;padding:4px 6px;margin:2px 0;';
        else if (pickOutcome === 'loss') pickBg = 'background:rgba(46,134,171,0.10);border-left:3px solid var(--secondary);border-radius:4px;padding:4px 6px;margin:2px 0;';
        html += `<div style="font-size:0.8rem;display:flex;justify-content:space-between;align-items:center;${pickBg}">`;
        html += `<span>· ${pickLabel} ${p.odds ? '<span class="odds-tag">@' + p.odds + '</span>' : ''} ${badge}</span>`;
        html += `<span style="color:var(--text-muted)">${lang === 'th' ? 'ทีมแชมป์' : 'Champion'}</span>`;
        html += `</div>`;
      } else {
        html += `<div style="font-size:0.78rem;color:var(--text-muted);line-height:1.5">· ${pickLabel} <span class="odds-tag">@${p.odds}</span> ${badge}</div>`;
      }
      return;
    }
    const match = MATCHES.find(m => m.id === p.match_id);
    if (!match) return;
    const t1 = TEAMS[match.team1];
    const t2 = TEAMS[match.team2];
    const t1Name = t1 ? (lang === 'th' ? t1.nameTh : t1.name) : match.team1;
    const t2Name = t2 ? (lang === 'th' ? t2.nameTh : t2.name) : match.team2;

    let pickLabel = '';
    if (p.type === 'corner') {
      const lineLabel = p.line || state.cornerLines[match.id] || '';
      pickLabel = `⛳ มุม${p.pick === 'over' ? (lang === 'th' ? 'สูง' : 'Over') : (lang === 'th' ? 'ต่ำ' : 'Under')} ${lineLabel}`;
    } else if (p.type === 'ou') {
      const lineLabel = p.line || state.ouLines[match.id] || '';
      pickLabel = `${match.team1}-${match.team2} ${p.pick === 'over' ? (lang === 'th' ? 'สูง' : 'Over') : (lang === 'th' ? 'ต่ำ' : 'Under')} ${lineLabel}`;
    } else {
      const picked = TEAMS[p.pick];
      const lineLabel = p.line || state.ahLines[match.id] || '';
      const isHome = p.pick === match.team1;
      pickLabel = `${picked ? (lang === 'th' ? picked.nameTh : picked.name) : p.pick} ${lineLabel ? formatAhFav(lineLabel, isHome) : ''}`;
    }

    const badge = typeof getPickResultBadge === 'function' ? getPickResultBadge(p, match) : '';

    if (showDetails) {
      const pickOutcome = typeof getPickOutcome === 'function' ? getPickOutcome(p, state.matches[match.id]) : null;
      let pickBg = '';
      if      (pickOutcome === 'full')                               pickBg = 'background:rgba(212,160,23,0.12);border-left:3px solid var(--accent);border-radius:4px;padding:4px 6px;margin:2px 0;';
      else if (pickOutcome === 'half')                               pickBg = 'background:rgba(212,160,23,0.06);border-left:3px solid var(--accent);border-radius:4px;padding:4px 6px;margin:2px 0;';
      else if (pickOutcome === 'loss' || pickOutcome === 'half_loss') pickBg = 'background:rgba(46,134,171,0.10);border-left:3px solid var(--secondary);border-radius:4px;padding:4px 6px;margin:2px 0;';
      else if (pickOutcome === 'push')                               pickBg = 'border-left:3px solid var(--text-muted);border-radius:4px;padding:4px 6px;margin:2px 0;';
      const result = state.matches[match.id];
      const hasResult = result && typeof result.team1_score === 'number' && typeof result.team2_score === 'number';
      const scoreStr = hasResult ? ` <span style="font-weight:700">${result.team1_score}-${result.team2_score}</span>` : '';
      html += `<div style="font-size:0.8rem;display:flex;justify-content:space-between;align-items:center;${pickBg}">`;
      html += `<span>· ${pickLabel} ${p.odds ? '<span class="odds-tag">@' + p.odds + '</span>' : ''} ${badge}</span>`;
      html += `<span style="color:var(--text-muted)">${t1Name} vs ${t2Name}${scoreStr}</span>`;
      html += `</div>`;
    } else {
      html += `<div style="font-size:0.78rem;color:var(--text-muted);line-height:1.5">· ${pickLabel} <span class="odds-tag">@${p.odds}</span> ${badge}</div>`;
    }
  });
  html += `</div>`;

  // Footer
  const displayOdds = slip.combined_odds || slip.odds || (picks.length ? picks.reduce((a, p) => a * (p.odds || 1), 1).toFixed(3) : '-');
  html += `<div style="padding-top:6px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-size:0.85rem">`;
  html += `<span style="color:var(--text-muted)">${fmtM(slip.bet)} × ${displayOdds}`;
  if (st === 'won' || isApproved) html += ` → <b style="color:var(--accent)">+${fmtM(resolved.profit)}</b>`;
  else if (st === 'lost')          html += ` → <b style="color:var(--secondary)">${fmtM(resolved.profit)}</b>`;
  else                             html += ` → <b style="color:var(--accent)">${lang === 'th' ? 'จ่าย' : 'Payout'} ${fmtM(slip.payout)}</b>`;
  html += `</span></div>`;

  html += `</div>`;
  return html;
}

function renderBettingLoginForm(container) {
  const lang = currentLang;
  let html = '<div class="login-form">';
  html += `<h2>${t('login.title')}</h2>`;
  html += `<div id="bet-login-error" class="login-error"></div>`;

  html += `<select id="bet-login-name"><option value="">${t('login.name')}</option>`;
  if (state.players.length) {
    state.players.forEach(p => {
      html += `<option value="${p.player_id}">${p.display_name}</option>`;
    });
  } else {
    ['Pisan', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6'].forEach(name => {
      html += `<option value="${name.toLowerCase()}">${name}</option>`;
    });
  }
  html += '</select>';

  html += `<input type="password" id="bet-login-pin" placeholder="${t('login.pin')}" maxlength="4" inputmode="numeric">`;
  html += `<button class="btn btn-primary" id="bet-login-btn">${t('login.btn')}</button>`;
  html += '</div>';

  container.innerHTML = html;

  container.querySelector('#bet-login-btn').addEventListener('click', async () => {
    const name = container.querySelector('#bet-login-name').value;
    const pin = container.querySelector('#bet-login-pin').value;
    if (!name || !pin) return;

    showLoading();
    const result = await loginPlayer(name, pin);

    if (result.success) {
      await refreshData();
      buildLinesFromMatches();
      // is_admin only becomes known here — without this the admin-only tabs
      // (ราคา, Insight) stay hidden until the page is reloaded
      updateAdminUI();
      await renderBetting();
      updateTabBadges();
      hideLoading();
    } else {
      hideLoading();
      container.querySelector('#bet-login-error').textContent = t('login.wrong');
    }
  });
}
