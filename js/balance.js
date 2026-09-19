// ยอดค้าง — who owes what, across the whole season.
//
// The leaderboard answers "who is winning". This tab answers the different
// question the pool actually settles up on: how much money has changed hands on
// paper but not in real life. Two figures per player, deliberately kept apart:
//
//   ปิดยอดแล้ว  — settled months, from `standings`. Final. This is the number
//                 to hand over.
//   เดือนนี้     — the running month, from the live `slips` tab. Still moving,
//                 so it is shown but never folded into the amount owed.
//
// A settled month can be marked paid (`paid` on the standings row, written by
// `mark_paid`). Clearing is per player per month, because that is how the pool
// actually settles up — August handed over while September is still running.
// A paid month leaves ยอดค้าง but stays in the season total: paying the debt
// does not rewrite the scoreboard.

function balanceRows() {
  const players = getPlayers();
  const live = getPeriodSlips();

  return players.map(player => {
    const carry = getSeasonCarry(player);          // every settled month
    // The running month counts only approved slips, the same rule the balance
    // card uses — an unapproved slip is not money anyone owes yet.
    const running = live
      .filter(s => s.player === player && s.status === 'approved')
      .reduce((sum, s) => sum + resolveSlip(s).profit, 0);
    // Slips whose match has not finished: not owed either way yet, but worth
    // showing so a big open position is not a surprise at settlement.
    let openWin = 0, openLose = 0;
    live.filter(s => s.player === player && s.status !== 'cancelled').forEach(s => {
      if (resolveSlip(s).status !== 'pending') return;
      openWin  += Math.max(0, (s.payout || 0) - (s.bet || 0));
      openLose += s.bet || 0;
    });
    // One entry per settled month, so a month can be cleared on its own.
    const months = (state.standings || [])
      .filter(r => r.player === player)
      .sort((a, b) => String(a.period).localeCompare(String(b.period)))
      .map(r => ({ period: String(r.period), money: Number(r.settled_money) || 0, paid: !!r.paid }));

    return {
      player: player,
      settled: carry.money,
      owed: months.filter(m => !m.paid).reduce((sum, m) => sum + m.money, 0),
      months: months,
      running: running,
      openWin: openWin,
      openLose: openLose,
      hasHistory: carry.hasHistory,
    };
  }).filter(r => r.settled || r.running || r.openWin || r.openLose || r.hasHistory);
}

function renderBalance() {
  const container = document.getElementById('view-balance');
  if (!container) return;
  const lang = currentLang;
  const rows = balanceRows();

  if (!rows.length) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted)">${lang === 'th' ? 'ยังไม่มียอด' : 'Nothing owed yet'}</div>`;
    return;
  }

  // Positive owed = the player is up, so the pool owes them. Months already
  // marked paid drop out of `owed`, which is what empties this page over time.
  const owedToPlayers = rows.filter(r => r.owed > 0).sort((a, b) => b.owed - a.owed);
  const owedByPlayers = rows.filter(r => r.owed < 0).sort((a, b) => a.owed - b.owed);
  const payOut = owedToPlayers.reduce((sum, r) => sum + r.owed, 0);
  const takeIn = owedByPlayers.reduce((sum, r) => sum + Math.abs(r.owed), 0);
  const net = takeIn - payOut;

  const periods = [...new Set((state.standings || []).map(r => String(r.period)))].sort();
  const periodStr = periods.length
    ? periods.map(p => periodLabel(p, lang)).join(', ')
    : (lang === 'th' ? 'ยังไม่มีเดือนที่ปิดยอด' : 'no settled months');

  let html = '';

  html += `<div style="font-weight:800;font-size:1rem;margin-bottom:2px">${lang === 'th' ? 'ยอดค้าง' : 'Outstanding'}</div>`;
  html += `<div style="font-size:0.76rem;color:var(--text-muted);margin-bottom:12px">${lang === 'th' ? 'ปิดยอดแล้ว' : 'Settled'}: ${periodStr}</div>`;

  // --- headline: what the pool nets out to ---
  const netColor = net >= 0 ? 'var(--accent)' : 'var(--secondary)';
  const netLabel = lang === 'th'
    ? (net >= 0 ? 'เก็บเข้ามากกว่าจ่ายออก' : 'จ่ายออกมากกว่าเก็บเข้า')
    : (net >= 0 ? 'more coming in than going out' : 'more going out than coming in');
  html += `<div class="card" style="padding:12px 14px;margin-bottom:12px">`;
  html += `<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">`;
  html += `<span style="font-size:0.82rem;color:var(--text-muted)">${lang === 'th' ? 'ต้องจ่ายออก' : 'To pay out'}</span>`;
  html += `<span style="font-weight:700;color:var(--accent)">${fmtM(payOut)}</span></div>`;
  html += `<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">`;
  html += `<span style="font-size:0.82rem;color:var(--text-muted)">${lang === 'th' ? 'ต้องเก็บเข้า' : 'To collect'}</span>`;
  html += `<span style="font-weight:700;color:var(--secondary)">${fmtM(takeIn)}</span></div>`;
  html += `<div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid var(--border);padding-top:8px">`;
  html += `<span style="font-size:0.82rem;font-weight:700">${lang === 'th' ? 'สุทธิ' : 'Net'}</span>`;
  html += `<span style="font-weight:800;font-size:1.05rem;color:${netColor}">${net >= 0 ? '+' : '-'}${fmtM(Math.abs(net))}</span></div>`;
  html += `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px">${netLabel}</div>`;
  html += `</div>`;

  // One chip per settled month. Admin gets a button on each: เคลียร์แล้ว on an
  // unpaid month, ↩ on a paid one, because a mis-press must be undoable without
  // editing the Sheet by hand.
  const monthChips = (r) => {
    if (!r.months.length) return '';
    let h = `<div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:4px;align-items:center">`;
    r.months.forEach(m => {
      const amt = (m.money >= 0 ? '+' : '-') + fmtM(Math.abs(m.money));
      const label = `${periodLabel(m.period, lang)} ${amt}`;
      if (m.paid) {
        h += `<span style="font-size:0.68rem;color:var(--text-muted);background:var(--bg-input);border-radius:99px;padding:2px 8px">✓ ${label}</span>`;
        if (state.isAdmin) {
          h += `<button class="paid-btn" data-period="${m.period}" data-target="${r.player}" data-paid="0" title="${lang === 'th' ? 'ยกเลิกเคลียร์' : 'Undo'}" style="font-size:0.68rem;padding:2px 6px;background:none;border:1px solid var(--border);border-radius:99px;color:var(--text-muted);cursor:pointer">↩</button>`;
        }
      } else {
        h += `<span style="font-size:0.68rem;border:1px solid var(--border);border-radius:99px;padding:2px 8px">${label}</span>`;
        if (state.isAdmin) {
          h += `<button class="paid-btn" data-period="${m.period}" data-target="${r.player}" data-paid="1" style="font-size:0.68rem;padding:2px 8px;background:var(--bg-input);border:1px solid var(--accent);border-radius:99px;color:var(--accent);cursor:pointer">${lang === 'th' ? 'เคลียร์แล้ว' : 'Mark paid'}</button>`;
        }
      }
    });
    h += `</div>`;
    return h;
  };

  const group = (title, list, sign) => {
    if (!list.length) return '';
    let h = `<div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);margin:14px 0 6px">${title}</div>`;
    list.forEach(r => {
      const isMe = r.player === state.currentPlayer;
      const amount = Math.abs(r.owed);
      const color = sign > 0 ? 'var(--accent)' : 'var(--secondary)';
      h += `<div class="card" style="padding:10px 12px;margin-bottom:6px${isMe ? ';border:1px solid var(--secondary)' : ''}">`;
      h += `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">`;
      h += `<div style="min-width:0"><div style="font-weight:700;font-size:0.92rem">${getDisplayName(r.player)}${isMe ? ' <span style="color:var(--secondary);font-size:0.72rem">★</span>' : ''}</div>`;
      h += `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px">${r.months.length} ${lang === 'th' ? 'เดือน' : r.months.length === 1 ? 'month' : 'months'}`;
      if (r.running) {
        const rs = (r.running >= 0 ? '+' : '-') + fmtM(Math.abs(r.running));
        h += ` · ${lang === 'th' ? 'เดือนนี้' : 'this month'} ${rs}`;
      }
      h += `</div>`;
      if (r.openWin || r.openLose) {
        h += `<div style="font-size:0.7rem;margin-top:2px">⏳ ${lang === 'th' ? 'รอผล' : 'open'}: <span style="color:var(--accent)">+${fmtM(r.openWin)}</span> / <span style="color:var(--secondary)">-${fmtM(r.openLose)}</span></div>`;
      }
      h += monthChips(r);
      h += `</div>`;
      h += `<div style="font-weight:800;font-size:1rem;color:${color};white-space:nowrap">${fmtM(amount)}</div>`;
      h += `</div></div>`;
    });
    return h;
  };

  html += group(lang === 'th' ? 'ต้องจ่ายให้' : 'Pool owes', owedToPlayers, 1);
  html += group(lang === 'th' ? 'ต้องเก็บจาก' : 'Owes the pool', owedByPlayers, -1);

  // Players whose settled total is exactly zero still belong on the page —
  // "nothing owed" is an answer, and their running month may not be zero.
  const level = rows.filter(r => !r.owed);
  if (level.length) {
    html += `<div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);margin:14px 0 6px">${lang === 'th' ? 'ไม่มียอดค้าง' : 'Square'}</div>`;
    level.forEach(r => {
      const rs = r.running ? (r.running >= 0 ? '+' : '-') + fmtM(Math.abs(r.running)) : '';
      html += `<div class="card" style="padding:8px 12px;margin-bottom:6px">`;
      html += `<div style="display:flex;justify-content:space-between;align-items:center">`;
      html += `<span style="font-size:0.88rem">${getDisplayName(r.player)}</span>`;
      html += `<span style="font-size:0.76rem;color:var(--text-muted)">${rs ? (lang === 'th' ? 'เดือนนี้ ' : 'this month ') + rs : '—'}</span>`;
      html += `</div>`;
      html += monthChips(r);
      html += `</div>`;
    });
  }

  html += `<div style="font-size:0.72rem;color:var(--text-muted);margin:14px 0 24px;line-height:1.6">`;
  html += lang === 'th'
    ? 'ยอดค้าง = เดือนที่ปิดยอดแล้วและยังไม่ได้เคลียร์ (จากตาราง standings) — เดือนที่ยังไม่ปิดแสดงแยกไว้ เพราะยังเปลี่ยนได้<br>กด "เคลียร์แล้ว" เมื่อรับ/จ่ายเงินจริงแล้ว — เดือนนั้นจะหลุดจากยอดค้าง แต่ยังนับใน "รวม" ที่หน้าสรุปเหมือนเดิม'
    : 'Outstanding counts settled months that have not been cleared (from the standings tab). The running month is shown separately because it can still change.<br>Press "Mark paid" once the money actually changed hands — that month leaves this page but still counts in the season total.';
  html += `</div>`;

  container.innerHTML = html;

  container.querySelectorAll('.paid-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const period = btn.dataset.period;
      const target = btn.dataset.target;
      const paid = btn.dataset.paid === '1';
      const who = getDisplayName(target);
      const when = periodLabel(period, lang);
      const ask = paid
        ? (lang === 'th' ? `เคลียร์ยอด ${when} ของ ${who} แล้วใช่ไหม?` : `Mark ${who}'s ${when} as paid?`)
        : (lang === 'th' ? `ยกเลิกการเคลียร์ ${when} ของ ${who}?` : `Undo paid on ${who}'s ${when}?`);
      if (!confirm(ask)) return;

      btn.disabled = true;
      const result = await markPaid(period, target, paid);
      if (result && result.success) {
        // Patch the row we already have rather than refetching — `standings` is
        // cached server-side for 5 min and mark_paid already cleared it, but a
        // reload here would cost another queued script start for one cell.
        const row = (state.standings || []).find(r =>
          r.player === target && String(r.period) === String(period));
        if (row) row.paid = result.paid;
        renderBalance();
      } else {
        alert((lang === 'th' ? 'บันทึกไม่สำเร็จ: ' : 'Failed: ') + ((result && result.error) || '?'));
        btn.disabled = false;
      }
    });
  });
}
