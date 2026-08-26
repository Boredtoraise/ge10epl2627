// EPL 2026/27 — season data
// Fixtures: https://fixturedownload.com/results/epl-2026 (380 matches, 20 teams, GW1-38)
// Generated from epl_matches_import.csv — the same file imported into the Sheet's `matches` tab.
// The Sheet is the live fixture source: kickoff changes and postponements come from there
// and override the `date` below. This file only provides the static skeleton so the app can
// render before any network call returns.

const SEASON = '2026/27';

// `flag` is kept (the WC UI templates read it) but clubs have no flag — empty by design.
const TEAMS = {
  ARS: { name: 'Arsenal', nameTh: 'อาร์เซนอล', flag: '' },
  AVL: { name: 'Aston Villa', nameTh: 'แอสตัน วิลลา', flag: '' },
  BOU: { name: 'Bournemouth', nameTh: 'บอร์นมัธ', flag: '' },
  BRE: { name: 'Brentford', nameTh: 'เบรนท์ฟอร์ด', flag: '' },
  BHA: { name: 'Brighton', nameTh: 'ไบรท์ตัน', flag: '' },
  CHE: { name: 'Chelsea', nameTh: 'เชลซี', flag: '' },
  COV: { name: 'Coventry', nameTh: 'โคเวนทรี', flag: '' },
  CRY: { name: 'Crystal Palace', nameTh: 'คริสตัล พาเลซ', flag: '' },
  EVE: { name: 'Everton', nameTh: 'เอฟเวอร์ตัน', flag: '' },
  FUL: { name: 'Fulham', nameTh: 'ฟูแล่ม', flag: '' },
  HUL: { name: 'Hull City', nameTh: 'ฮัลล์ ซิตี้', flag: '' },
  IPS: { name: 'Ipswich', nameTh: 'อิปสวิช', flag: '' },
  LEE: { name: 'Leeds', nameTh: 'ลีดส์', flag: '' },
  LIV: { name: 'Liverpool', nameTh: 'ลิเวอร์พูล', flag: '' },
  MCI: { name: 'Man City', nameTh: 'แมนฯ ซิตี้', flag: '' },
  MUN: { name: 'Man Utd', nameTh: 'แมนฯ ยูไนเต็ด', flag: '' },
  NEW: { name: 'Newcastle', nameTh: 'นิวคาสเซิล', flag: '' },
  NFO: { name: "Nott'm Forest", nameTh: 'น็อตติงแฮม ฟอเรสต์', flag: '' },
  TOT: { name: 'Spurs', nameTh: 'สเปอร์ส', flag: '' },
  SUN: { name: 'Sunderland', nameTh: 'ซันเดอร์แลนด์', flag: '' },
};

// Kickoff times are Thai time (UTC+7). Thailand has no DST, so these stay correct
// across the UK's BST -> GMT switch mid-season.
const MATCHES = [
  // --- GW1 (2026-08) ---
  { id: 'E01-001', gw: 1, period: '2026-08', num: 1, date: '2026-08-22T02:00', team1: 'ARS', team2: 'COV', venue: 'Emirates Stadium' },
  { id: 'E01-002', gw: 1, period: '2026-08', num: 2, date: '2026-08-22T18:30', team1: 'HUL', team2: 'MUN', venue: 'MKM Stadium' },
  { id: 'E01-003', gw: 1, period: '2026-08', num: 3, date: '2026-08-22T21:00', team1: 'EVE', team2: 'CRY', venue: 'Hill Dickinson Stadium' },
  { id: 'E01-004', gw: 1, period: '2026-08', num: 4, date: '2026-08-22T21:00', team1: 'IPS', team2: 'SUN', venue: 'Portman Road' },
  { id: 'E01-005', gw: 1, period: '2026-08', num: 5, date: '2026-08-22T21:00', team1: 'NFO', team2: 'LEE', venue: 'The City Ground' },
  { id: 'E01-006', gw: 1, period: '2026-08', num: 6, date: '2026-08-22T23:30', team1: 'BRE', team2: 'TOT', venue: 'Gtech Community Stadium' },
  { id: 'E01-007', gw: 1, period: '2026-08', num: 7, date: '2026-08-23T20:00', team1: 'BHA', team2: 'AVL', venue: 'American Express Stadium' },
  { id: 'E01-008', gw: 1, period: '2026-08', num: 8, date: '2026-08-23T20:00', team1: 'MCI', team2: 'BOU', venue: 'Etihad Stadium' },
  { id: 'E01-009', gw: 1, period: '2026-08', num: 9, date: '2026-08-23T22:30', team1: 'NEW', team2: 'LIV', venue: "St. James' Park" },
  { id: 'E01-010', gw: 1, period: '2026-08', num: 10, date: '2026-08-25T02:00', team1: 'FUL', team2: 'CHE', venue: 'Craven Cottage' },
  // --- GW2 (2026-08) ---
  { id: 'E02-001', gw: 2, period: '2026-08', num: 11, date: '2026-08-29T02:00', team1: 'CRY', team2: 'MCI', venue: 'Selhurst Park' },
  { id: 'E02-002', gw: 2, period: '2026-08', num: 12, date: '2026-08-29T18:30', team1: 'LIV', team2: 'NFO', venue: 'Anfield' },
  { id: 'E02-003', gw: 2, period: '2026-08', num: 13, date: '2026-08-29T21:00', team1: 'BOU', team2: 'EVE', venue: 'Vitality Stadium' },
  { id: 'E02-004', gw: 2, period: '2026-08', num: 14, date: '2026-08-29T21:00', team1: 'COV', team2: 'HUL', venue: 'Coventry Building Society Arena' },
  { id: 'E02-005', gw: 2, period: '2026-08', num: 15, date: '2026-08-29T23:30', team1: 'TOT', team2: 'NEW', venue: 'Tottenham Hotspur Stadium' },
  { id: 'E02-006', gw: 2, period: '2026-08', num: 16, date: '2026-08-30T20:00', team1: 'CHE', team2: 'BHA', venue: 'Stamford Bridge' },
  { id: 'E02-007', gw: 2, period: '2026-08', num: 17, date: '2026-08-30T20:00', team1: 'LEE', team2: 'BRE', venue: 'Elland Road' },
  { id: 'E02-008', gw: 2, period: '2026-08', num: 18, date: '2026-08-30T20:00', team1: 'SUN', team2: 'FUL', venue: 'Stadium of Light' },
  { id: 'E02-009', gw: 2, period: '2026-08', num: 19, date: '2026-08-30T22:30', team1: 'MUN', team2: 'IPS', venue: 'Old Trafford' },
  { id: 'E02-010', gw: 2, period: '2026-08', num: 20, date: '2026-09-01T02:00', team1: 'AVL', team2: 'ARS', venue: 'Villa Park' },
  // --- GW3 (2026-09) ---
  { id: 'E03-001', gw: 3, period: '2026-09', num: 21, date: '2026-09-05T02:00', team1: 'IPS', team2: 'LIV', venue: 'Portman Road' },
  { id: 'E03-002', gw: 3, period: '2026-09', num: 22, date: '2026-09-05T18:30', team1: 'NEW', team2: 'BOU', venue: "St. James' Park" },
  { id: 'E03-003', gw: 3, period: '2026-09', num: 23, date: '2026-09-05T21:00', team1: 'BRE', team2: 'SUN', venue: 'Gtech Community Stadium' },
  { id: 'E03-004', gw: 3, period: '2026-09', num: 24, date: '2026-09-05T21:00', team1: 'BHA', team2: 'LEE', venue: 'American Express Stadium' },
  { id: 'E03-005', gw: 3, period: '2026-09', num: 25, date: '2026-09-05T21:00', team1: 'FUL', team2: 'CRY', venue: 'Craven Cottage' },
  { id: 'E03-006', gw: 3, period: '2026-09', num: 26, date: '2026-09-05T21:00', team1: 'MCI', team2: 'COV', venue: 'Etihad Stadium' },
  { id: 'E03-007', gw: 3, period: '2026-09', num: 27, date: '2026-09-05T21:00', team1: 'NFO', team2: 'TOT', venue: 'The City Ground' },
  { id: 'E03-008', gw: 3, period: '2026-09', num: 28, date: '2026-09-05T23:30', team1: 'HUL', team2: 'AVL', venue: 'MKM Stadium' },
  { id: 'E03-009', gw: 3, period: '2026-09', num: 29, date: '2026-09-06T20:00', team1: 'EVE', team2: 'MUN', venue: 'Hill Dickinson Stadium' },
  { id: 'E03-010', gw: 3, period: '2026-09', num: 30, date: '2026-09-06T22:30', team1: 'ARS', team2: 'CHE', venue: 'Emirates Stadium' },
  // --- GW4 (2026-09) ---
  { id: 'E04-001', gw: 4, period: '2026-09', num: 31, date: '2026-09-12T21:00', team1: 'BOU', team2: 'BRE', venue: 'Vitality Stadium' },
  { id: 'E04-002', gw: 4, period: '2026-09', num: 32, date: '2026-09-12T21:00', team1: 'AVL', team2: 'NFO', venue: 'Villa Park' },
  { id: 'E04-003', gw: 4, period: '2026-09', num: 33, date: '2026-09-12T21:00', team1: 'CHE', team2: 'HUL', venue: 'Stamford Bridge' },
  { id: 'E04-004', gw: 4, period: '2026-09', num: 34, date: '2026-09-12T21:00', team1: 'CRY', team2: 'IPS', venue: 'Selhurst Park' },
  { id: 'E04-005', gw: 4, period: '2026-09', num: 35, date: '2026-09-12T21:00', team1: 'LIV', team2: 'FUL', venue: 'Anfield' },
  { id: 'E04-006', gw: 4, period: '2026-09', num: 36, date: '2026-09-12T23:30', team1: 'TOT', team2: 'EVE', venue: 'Tottenham Hotspur Stadium' },
  { id: 'E04-007', gw: 4, period: '2026-09', num: 37, date: '2026-09-13T02:00', team1: 'SUN', team2: 'ARS', venue: 'Stadium of Light' },
  { id: 'E04-008', gw: 4, period: '2026-09', num: 38, date: '2026-09-13T20:00', team1: 'COV', team2: 'BHA', venue: 'Coventry Building Society Arena' },
  { id: 'E04-009', gw: 4, period: '2026-09', num: 39, date: '2026-09-13T22:30', team1: 'MUN', team2: 'MCI', venue: 'Old Trafford' },
  { id: 'E04-010', gw: 4, period: '2026-09', num: 40, date: '2026-09-15T02:00', team1: 'LEE', team2: 'NEW', venue: 'Elland Road' },
  // --- GW5 (2026-09) ---
  { id: 'E05-001', gw: 5, period: '2026-09', num: 41, date: '2026-09-19T02:00', team1: 'BRE', team2: 'CHE', venue: 'Gtech Community Stadium' },
  { id: 'E05-002', gw: 5, period: '2026-09', num: 42, date: '2026-09-19T18:30', team1: 'TOT', team2: 'AVL', venue: 'Tottenham Hotspur Stadium' },
  { id: 'E05-003', gw: 5, period: '2026-09', num: 43, date: '2026-09-19T21:00', team1: 'BHA', team2: 'ARS', venue: 'American Express Stadium' },
  { id: 'E05-004', gw: 5, period: '2026-09', num: 44, date: '2026-09-19T21:00', team1: 'EVE', team2: 'IPS', venue: 'Hill Dickinson Stadium' },
  { id: 'E05-005', gw: 5, period: '2026-09', num: 45, date: '2026-09-19T21:00', team1: 'LEE', team2: 'CRY', venue: 'Elland Road' },
  { id: 'E05-006', gw: 5, period: '2026-09', num: 46, date: '2026-09-19T21:00', team1: 'MCI', team2: 'SUN', venue: 'Etihad Stadium' },
  { id: 'E05-007', gw: 5, period: '2026-09', num: 47, date: '2026-09-19T21:00', team1: 'NEW', team2: 'HUL', venue: "St. James' Park" },
  { id: 'E05-008', gw: 5, period: '2026-09', num: 48, date: '2026-09-19T23:30', team1: 'NFO', team2: 'COV', venue: 'The City Ground' },
  { id: 'E05-009', gw: 5, period: '2026-09', num: 49, date: '2026-09-20T20:00', team1: 'BOU', team2: 'LIV', venue: 'Vitality Stadium' },
  { id: 'E05-010', gw: 5, period: '2026-09', num: 50, date: '2026-09-20T22:30', team1: 'FUL', team2: 'MUN', venue: 'Craven Cottage' },
  // --- GW6 (2026-10) ---
  { id: 'E06-001', gw: 6, period: '2026-10', num: 51, date: '2026-10-10T18:30', team1: 'ARS', team2: 'LEE', venue: 'Emirates Stadium' },
  { id: 'E06-002', gw: 6, period: '2026-10', num: 52, date: '2026-10-10T21:00', team1: 'AVL', team2: 'BRE', venue: 'Villa Park' },
  { id: 'E06-003', gw: 6, period: '2026-10', num: 53, date: '2026-10-10T21:00', team1: 'CHE', team2: 'BOU', venue: 'Stamford Bridge' },
  { id: 'E06-004', gw: 6, period: '2026-10', num: 54, date: '2026-10-10T21:00', team1: 'IPS', team2: 'FUL', venue: 'Portman Road' },
  { id: 'E06-005', gw: 6, period: '2026-10', num: 55, date: '2026-10-10T21:00', team1: 'SUN', team2: 'BHA', venue: 'Stadium of Light' },
  { id: 'E06-006', gw: 6, period: '2026-10', num: 56, date: '2026-10-10T23:30', team1: 'MUN', team2: 'TOT', venue: 'Old Trafford' },
  { id: 'E06-007', gw: 6, period: '2026-10', num: 57, date: '2026-10-11T20:00', team1: 'CRY', team2: 'NFO', venue: 'Selhurst Park' },
  { id: 'E06-008', gw: 6, period: '2026-10', num: 58, date: '2026-10-11T20:00', team1: 'HUL', team2: 'EVE', venue: 'MKM Stadium' },
  { id: 'E06-009', gw: 6, period: '2026-10', num: 59, date: '2026-10-11T22:30', team1: 'LIV', team2: 'MCI', venue: 'Anfield' },
  { id: 'E06-010', gw: 6, period: '2026-10', num: 60, date: '2026-10-13T02:00', team1: 'COV', team2: 'NEW', venue: 'Coventry Building Society Arena' },
  // --- GW7 (2026-10) ---
  { id: 'E07-001', gw: 7, period: '2026-10', num: 61, date: '2026-10-17T18:30', team1: 'EVE', team2: 'CHE', venue: 'Hill Dickinson Stadium' },
  { id: 'E07-002', gw: 7, period: '2026-10', num: 62, date: '2026-10-17T21:00', team1: 'BRE', team2: 'LIV', venue: 'Gtech Community Stadium' },
  { id: 'E07-003', gw: 7, period: '2026-10', num: 63, date: '2026-10-17T21:00', team1: 'FUL', team2: 'HUL', venue: 'Craven Cottage' },
  { id: 'E07-004', gw: 7, period: '2026-10', num: 64, date: '2026-10-17T21:00', team1: 'MCI', team2: 'IPS', venue: 'Etihad Stadium' },
  { id: 'E07-005', gw: 7, period: '2026-10', num: 65, date: '2026-10-17T23:30', team1: 'NEW', team2: 'AVL', venue: "St. James' Park" },
  { id: 'E07-006', gw: 7, period: '2026-10', num: 66, date: '2026-10-18T20:00', team1: 'BOU', team2: 'SUN', venue: 'Vitality Stadium' },
  { id: 'E07-007', gw: 7, period: '2026-10', num: 67, date: '2026-10-18T20:00', team1: 'BHA', team2: 'CRY', venue: 'American Express Stadium' },
  { id: 'E07-008', gw: 7, period: '2026-10', num: 68, date: '2026-10-18T20:00', team1: 'LEE', team2: 'MUN', venue: 'Elland Road' },
  { id: 'E07-009', gw: 7, period: '2026-10', num: 69, date: '2026-10-18T22:30', team1: 'NFO', team2: 'ARS', venue: 'The City Ground' },
  { id: 'E07-010', gw: 7, period: '2026-10', num: 70, date: '2026-10-20T02:00', team1: 'TOT', team2: 'COV', venue: 'Tottenham Hotspur Stadium' },
  // --- GW8 (2026-10) ---
  { id: 'E08-001', gw: 8, period: '2026-10', num: 71, date: '2026-10-24T02:00', team1: 'IPS', team2: 'NFO', venue: 'Portman Road' },
  { id: 'E08-002', gw: 8, period: '2026-10', num: 72, date: '2026-10-24T18:30', team1: 'AVL', team2: 'MCI', venue: 'Villa Park' },
  { id: 'E08-003', gw: 8, period: '2026-10', num: 73, date: '2026-10-24T21:00', team1: 'ARS', team2: 'EVE', venue: 'Emirates Stadium' },
  { id: 'E08-004', gw: 8, period: '2026-10', num: 74, date: '2026-10-24T21:00', team1: 'COV', team2: 'FUL', venue: 'Coventry Building Society Arena' },
  { id: 'E08-005', gw: 8, period: '2026-10', num: 75, date: '2026-10-24T21:00', team1: 'LIV', team2: 'BHA', venue: 'Anfield' },
  { id: 'E08-006', gw: 8, period: '2026-10', num: 76, date: '2026-10-24T23:30', team1: 'CHE', team2: 'TOT', venue: 'Stamford Bridge' },
  { id: 'E08-007', gw: 8, period: '2026-10', num: 77, date: '2026-10-25T21:00', team1: 'CRY', team2: 'NEW', venue: 'Selhurst Park' },
  { id: 'E08-008', gw: 8, period: '2026-10', num: 78, date: '2026-10-25T21:00', team1: 'HUL', team2: 'BRE', venue: 'MKM Stadium' },
  { id: 'E08-009', gw: 8, period: '2026-10', num: 79, date: '2026-10-25T21:00', team1: 'MUN', team2: 'BOU', venue: 'Old Trafford' },
  { id: 'E08-010', gw: 8, period: '2026-10', num: 80, date: '2026-10-25T23:30', team1: 'SUN', team2: 'LEE', venue: 'Stadium of Light' },
  // --- GW9 (2026-10) ---
  { id: 'E09-001', gw: 9, period: '2026-10', num: 81, date: '2026-10-31T19:30', team1: 'CHE', team2: 'MUN', venue: 'Stamford Bridge' },
  { id: 'E09-002', gw: 9, period: '2026-10', num: 82, date: '2026-10-31T22:00', team1: 'BOU', team2: 'LEE', venue: 'Vitality Stadium' },
  { id: 'E09-003', gw: 9, period: '2026-10', num: 83, date: '2026-10-31T22:00', team1: 'BRE', team2: 'NFO', venue: 'Gtech Community Stadium' },
  { id: 'E09-004', gw: 9, period: '2026-10', num: 84, date: '2026-10-31T22:00', team1: 'COV', team2: 'SUN', venue: 'Coventry Building Society Arena' },
  { id: 'E09-005', gw: 9, period: '2026-10', num: 85, date: '2026-10-31T22:00', team1: 'HUL', team2: 'IPS', venue: 'MKM Stadium' },
  { id: 'E09-006', gw: 9, period: '2026-10', num: 86, date: '2026-10-31T22:00', team1: 'MCI', team2: 'BHA', venue: 'Etihad Stadium' },
  { id: 'E09-007', gw: 9, period: '2026-10', num: 87, date: '2026-11-01T00:30', team1: 'TOT', team2: 'CRY', venue: 'Tottenham Hotspur Stadium' },
  { id: 'E09-008', gw: 9, period: '2026-10', num: 88, date: '2026-11-01T21:00', team1: 'AVL', team2: 'FUL', venue: 'Villa Park' },
  { id: 'E09-009', gw: 9, period: '2026-10', num: 89, date: '2026-11-01T23:30', team1: 'LIV', team2: 'ARS', venue: 'Anfield' },
  { id: 'E09-010', gw: 9, period: '2026-10', num: 90, date: '2026-11-03T03:00', team1: 'NEW', team2: 'EVE', venue: "St. James' Park" },
  // --- GW10 (2026-11) ---
  { id: 'E10-001', gw: 10, period: '2026-11', num: 91, date: '2026-11-07T22:00', team1: 'ARS', team2: 'HUL', venue: 'Emirates Stadium' },
  { id: 'E10-002', gw: 10, period: '2026-11', num: 92, date: '2026-11-07T22:00', team1: 'BHA', team2: 'BRE', venue: 'American Express Stadium' },
  { id: 'E10-003', gw: 10, period: '2026-11', num: 93, date: '2026-11-07T22:00', team1: 'CRY', team2: 'LIV', venue: 'Selhurst Park' },
  { id: 'E10-004', gw: 10, period: '2026-11', num: 94, date: '2026-11-07T22:00', team1: 'EVE', team2: 'COV', venue: 'Hill Dickinson Stadium' },
  { id: 'E10-005', gw: 10, period: '2026-11', num: 95, date: '2026-11-07T22:00', team1: 'FUL', team2: 'NEW', venue: 'Craven Cottage' },
  { id: 'E10-006', gw: 10, period: '2026-11', num: 96, date: '2026-11-07T22:00', team1: 'IPS', team2: 'BOU', venue: 'Portman Road' },
  { id: 'E10-007', gw: 10, period: '2026-11', num: 97, date: '2026-11-07T22:00', team1: 'LEE', team2: 'TOT', venue: 'Elland Road' },
  { id: 'E10-008', gw: 10, period: '2026-11', num: 98, date: '2026-11-07T22:00', team1: 'MUN', team2: 'AVL', venue: 'Old Trafford' },
  { id: 'E10-009', gw: 10, period: '2026-11', num: 99, date: '2026-11-07T22:00', team1: 'NFO', team2: 'MCI', venue: 'The City Ground' },
  { id: 'E10-010', gw: 10, period: '2026-11', num: 100, date: '2026-11-07T22:00', team1: 'SUN', team2: 'CHE', venue: 'Stadium of Light' },
  // --- GW11 (2026-11) ---
  { id: 'E11-001', gw: 11, period: '2026-11', num: 101, date: '2026-11-21T22:00', team1: 'BOU', team2: 'NFO', venue: 'Vitality Stadium' },
  { id: 'E11-002', gw: 11, period: '2026-11', num: 102, date: '2026-11-21T22:00', team1: 'AVL', team2: 'SUN', venue: 'Villa Park' },
  { id: 'E11-003', gw: 11, period: '2026-11', num: 103, date: '2026-11-21T22:00', team1: 'BRE', team2: 'EVE', venue: 'Gtech Community Stadium' },
  { id: 'E11-004', gw: 11, period: '2026-11', num: 104, date: '2026-11-21T22:00', team1: 'CHE', team2: 'LEE', venue: 'Stamford Bridge' },
  { id: 'E11-005', gw: 11, period: '2026-11', num: 105, date: '2026-11-21T22:00', team1: 'COV', team2: 'CRY', venue: 'Coventry Building Society Arena' },
  { id: 'E11-006', gw: 11, period: '2026-11', num: 106, date: '2026-11-21T22:00', team1: 'HUL', team2: 'BHA', venue: 'MKM Stadium' },
  { id: 'E11-007', gw: 11, period: '2026-11', num: 107, date: '2026-11-21T22:00', team1: 'LIV', team2: 'MUN', venue: 'Anfield' },
  { id: 'E11-008', gw: 11, period: '2026-11', num: 108, date: '2026-11-21T22:00', team1: 'MCI', team2: 'FUL', venue: 'Etihad Stadium' },
  { id: 'E11-009', gw: 11, period: '2026-11', num: 109, date: '2026-11-21T22:00', team1: 'NEW', team2: 'ARS', venue: "St. James' Park" },
  { id: 'E11-010', gw: 11, period: '2026-11', num: 110, date: '2026-11-21T22:00', team1: 'TOT', team2: 'IPS', venue: 'Tottenham Hotspur Stadium' },
  // --- GW12 (2026-11) ---
  { id: 'E12-001', gw: 12, period: '2026-11', num: 111, date: '2026-11-28T22:00', team1: 'ARS', team2: 'MCI', venue: 'Emirates Stadium' },
  { id: 'E12-002', gw: 12, period: '2026-11', num: 112, date: '2026-11-28T22:00', team1: 'BHA', team2: 'NEW', venue: 'American Express Stadium' },
  { id: 'E12-003', gw: 12, period: '2026-11', num: 113, date: '2026-11-28T22:00', team1: 'CRY', team2: 'HUL', venue: 'Selhurst Park' },
  { id: 'E12-004', gw: 12, period: '2026-11', num: 114, date: '2026-11-28T22:00', team1: 'EVE', team2: 'LIV', venue: 'Hill Dickinson Stadium' },
  { id: 'E12-005', gw: 12, period: '2026-11', num: 115, date: '2026-11-28T22:00', team1: 'FUL', team2: 'BOU', venue: 'Craven Cottage' },
  { id: 'E12-006', gw: 12, period: '2026-11', num: 116, date: '2026-11-28T22:00', team1: 'IPS', team2: 'AVL', venue: 'Portman Road' },
  { id: 'E12-007', gw: 12, period: '2026-11', num: 117, date: '2026-11-28T22:00', team1: 'LEE', team2: 'COV', venue: 'Elland Road' },
  { id: 'E12-008', gw: 12, period: '2026-11', num: 118, date: '2026-11-28T22:00', team1: 'MUN', team2: 'BRE', venue: 'Old Trafford' },
  { id: 'E12-009', gw: 12, period: '2026-11', num: 119, date: '2026-11-28T22:00', team1: 'NFO', team2: 'CHE', venue: 'The City Ground' },
  { id: 'E12-010', gw: 12, period: '2026-11', num: 120, date: '2026-11-28T22:00', team1: 'SUN', team2: 'TOT', venue: 'Stadium of Light' },
  // --- GW13 (2026-12) ---
  { id: 'E13-001', gw: 13, period: '2026-12', num: 121, date: '2026-12-03T03:00', team1: 'BOU', team2: 'BHA', venue: 'Vitality Stadium' },
  { id: 'E13-002', gw: 13, period: '2026-12', num: 122, date: '2026-12-03T03:00', team1: 'AVL', team2: 'EVE', venue: 'Villa Park' },
  { id: 'E13-003', gw: 13, period: '2026-12', num: 123, date: '2026-12-03T03:00', team1: 'BRE', team2: 'ARS', venue: 'Gtech Community Stadium' },
  { id: 'E13-004', gw: 13, period: '2026-12', num: 124, date: '2026-12-03T03:00', team1: 'CHE', team2: 'CRY', venue: 'Stamford Bridge' },
  { id: 'E13-005', gw: 13, period: '2026-12', num: 125, date: '2026-12-03T03:00', team1: 'COV', team2: 'IPS', venue: 'Coventry Building Society Arena' },
  { id: 'E13-006', gw: 13, period: '2026-12', num: 126, date: '2026-12-03T03:00', team1: 'HUL', team2: 'NFO', venue: 'MKM Stadium' },
  { id: 'E13-007', gw: 13, period: '2026-12', num: 127, date: '2026-12-03T03:00', team1: 'LIV', team2: 'SUN', venue: 'Anfield' },
  { id: 'E13-008', gw: 13, period: '2026-12', num: 128, date: '2026-12-03T03:00', team1: 'MCI', team2: 'LEE', venue: 'Etihad Stadium' },
  { id: 'E13-009', gw: 13, period: '2026-12', num: 129, date: '2026-12-03T03:00', team1: 'NEW', team2: 'MUN', venue: "St. James' Park" },
  { id: 'E13-010', gw: 13, period: '2026-12', num: 130, date: '2026-12-03T03:00', team1: 'TOT', team2: 'FUL', venue: 'Tottenham Hotspur Stadium' },
  // --- GW14 (2026-12) ---
  { id: 'E14-001', gw: 14, period: '2026-12', num: 131, date: '2026-12-05T22:00', team1: 'BOU', team2: 'HUL', venue: 'Vitality Stadium' },
  { id: 'E14-002', gw: 14, period: '2026-12', num: 132, date: '2026-12-05T22:00', team1: 'AVL', team2: 'CRY', venue: 'Villa Park' },
  { id: 'E14-003', gw: 14, period: '2026-12', num: 133, date: '2026-12-05T22:00', team1: 'BRE', team2: 'MCI', venue: 'Gtech Community Stadium' },
  { id: 'E14-004', gw: 14, period: '2026-12', num: 134, date: '2026-12-05T22:00', team1: 'CHE', team2: 'LIV', venue: 'Stamford Bridge' },
  { id: 'E14-005', gw: 14, period: '2026-12', num: 135, date: '2026-12-05T22:00', team1: 'EVE', team2: 'FUL', venue: 'Hill Dickinson Stadium' },
  { id: 'E14-006', gw: 14, period: '2026-12', num: 136, date: '2026-12-05T22:00', team1: 'LEE', team2: 'IPS', venue: 'Elland Road' },
  { id: 'E14-007', gw: 14, period: '2026-12', num: 137, date: '2026-12-05T22:00', team1: 'MUN', team2: 'COV', venue: 'Old Trafford' },
  { id: 'E14-008', gw: 14, period: '2026-12', num: 138, date: '2026-12-05T22:00', team1: 'NEW', team2: 'SUN', venue: "St. James' Park" },
  { id: 'E14-009', gw: 14, period: '2026-12', num: 139, date: '2026-12-05T22:00', team1: 'NFO', team2: 'BHA', venue: 'The City Ground' },
  { id: 'E14-010', gw: 14, period: '2026-12', num: 140, date: '2026-12-05T22:00', team1: 'TOT', team2: 'ARS', venue: 'Tottenham Hotspur Stadium' },
  // --- GW15 (2026-12) ---
  { id: 'E15-001', gw: 15, period: '2026-12', num: 141, date: '2026-12-12T22:00', team1: 'ARS', team2: 'BOU', venue: 'Emirates Stadium' },
  { id: 'E15-002', gw: 15, period: '2026-12', num: 142, date: '2026-12-12T22:00', team1: 'BHA', team2: 'EVE', venue: 'American Express Stadium' },
  { id: 'E15-003', gw: 15, period: '2026-12', num: 143, date: '2026-12-12T22:00', team1: 'COV', team2: 'AVL', venue: 'Coventry Building Society Arena' },
  { id: 'E15-004', gw: 15, period: '2026-12', num: 144, date: '2026-12-12T22:00', team1: 'CRY', team2: 'MUN', venue: 'Selhurst Park' },
  { id: 'E15-005', gw: 15, period: '2026-12', num: 145, date: '2026-12-12T22:00', team1: 'FUL', team2: 'BRE', venue: 'Craven Cottage' },
  { id: 'E15-006', gw: 15, period: '2026-12', num: 146, date: '2026-12-12T22:00', team1: 'HUL', team2: 'TOT', venue: 'MKM Stadium' },
  { id: 'E15-007', gw: 15, period: '2026-12', num: 147, date: '2026-12-12T22:00', team1: 'IPS', team2: 'NEW', venue: 'Portman Road' },
  { id: 'E15-008', gw: 15, period: '2026-12', num: 148, date: '2026-12-12T22:00', team1: 'LIV', team2: 'LEE', venue: 'Anfield' },
  { id: 'E15-009', gw: 15, period: '2026-12', num: 149, date: '2026-12-12T22:00', team1: 'MCI', team2: 'CHE', venue: 'Etihad Stadium' },
  { id: 'E15-010', gw: 15, period: '2026-12', num: 150, date: '2026-12-12T22:00', team1: 'SUN', team2: 'NFO', venue: 'Stadium of Light' },
  // --- GW16 (2026-12) ---
  { id: 'E16-001', gw: 16, period: '2026-12', num: 151, date: '2026-12-19T22:00', team1: 'BOU', team2: 'COV', venue: 'Vitality Stadium' },
  { id: 'E16-002', gw: 16, period: '2026-12', num: 152, date: '2026-12-19T22:00', team1: 'ARS', team2: 'MUN', venue: 'Emirates Stadium' },
  { id: 'E16-003', gw: 16, period: '2026-12', num: 153, date: '2026-12-19T22:00', team1: 'BRE', team2: 'NEW', venue: 'Gtech Community Stadium' },
  { id: 'E16-004', gw: 16, period: '2026-12', num: 154, date: '2026-12-19T22:00', team1: 'BHA', team2: 'IPS', venue: 'American Express Stadium' },
  { id: 'E16-005', gw: 16, period: '2026-12', num: 155, date: '2026-12-19T22:00', team1: 'CHE', team2: 'AVL', venue: 'Stamford Bridge' },
  { id: 'E16-006', gw: 16, period: '2026-12', num: 156, date: '2026-12-19T22:00', team1: 'LEE', team2: 'FUL', venue: 'Elland Road' },
  { id: 'E16-007', gw: 16, period: '2026-12', num: 157, date: '2026-12-19T22:00', team1: 'LIV', team2: 'TOT', venue: 'Anfield' },
  { id: 'E16-008', gw: 16, period: '2026-12', num: 158, date: '2026-12-19T22:00', team1: 'MCI', team2: 'HUL', venue: 'Etihad Stadium' },
  { id: 'E16-009', gw: 16, period: '2026-12', num: 159, date: '2026-12-19T22:00', team1: 'NFO', team2: 'EVE', venue: 'The City Ground' },
  { id: 'E16-010', gw: 16, period: '2026-12', num: 160, date: '2026-12-19T22:00', team1: 'SUN', team2: 'CRY', venue: 'Stadium of Light' },
  // --- GW17 (2026-12) ---
  { id: 'E17-001', gw: 17, period: '2026-12', num: 161, date: '2026-12-26T22:00', team1: 'AVL', team2: 'LEE', venue: 'Villa Park' },
  { id: 'E17-002', gw: 17, period: '2026-12', num: 162, date: '2026-12-26T22:00', team1: 'COV', team2: 'CHE', venue: 'Coventry Building Society Arena' },
  { id: 'E17-003', gw: 17, period: '2026-12', num: 163, date: '2026-12-26T22:00', team1: 'CRY', team2: 'ARS', venue: 'Selhurst Park' },
  { id: 'E17-004', gw: 17, period: '2026-12', num: 164, date: '2026-12-26T22:00', team1: 'EVE', team2: 'SUN', venue: 'Hill Dickinson Stadium' },
  { id: 'E17-005', gw: 17, period: '2026-12', num: 165, date: '2026-12-26T22:00', team1: 'FUL', team2: 'BHA', venue: 'Craven Cottage' },
  { id: 'E17-006', gw: 17, period: '2026-12', num: 166, date: '2026-12-26T22:00', team1: 'HUL', team2: 'LIV', venue: 'MKM Stadium' },
  { id: 'E17-007', gw: 17, period: '2026-12', num: 167, date: '2026-12-26T22:00', team1: 'IPS', team2: 'BRE', venue: 'Portman Road' },
  { id: 'E17-008', gw: 17, period: '2026-12', num: 168, date: '2026-12-26T22:00', team1: 'MUN', team2: 'NFO', venue: 'Old Trafford' },
  { id: 'E17-009', gw: 17, period: '2026-12', num: 169, date: '2026-12-26T22:00', team1: 'NEW', team2: 'MCI', venue: "St. James' Park" },
  { id: 'E17-010', gw: 17, period: '2026-12', num: 170, date: '2026-12-26T22:00', team1: 'TOT', team2: 'BOU', venue: 'Tottenham Hotspur Stadium' },
  // --- GW18 (2026-12) ---
  { id: 'E18-001', gw: 18, period: '2026-12', num: 171, date: '2026-12-31T03:00', team1: 'AVL', team2: 'LIV', venue: 'Villa Park' },
  { id: 'E18-002', gw: 18, period: '2026-12', num: 172, date: '2026-12-31T03:00', team1: 'COV', team2: 'BRE', venue: 'Coventry Building Society Arena' },
  { id: 'E18-003', gw: 18, period: '2026-12', num: 173, date: '2026-12-31T03:00', team1: 'CRY', team2: 'BOU', venue: 'Selhurst Park' },
  { id: 'E18-004', gw: 18, period: '2026-12', num: 174, date: '2026-12-31T03:00', team1: 'EVE', team2: 'MCI', venue: 'Hill Dickinson Stadium' },
  { id: 'E18-005', gw: 18, period: '2026-12', num: 175, date: '2026-12-31T03:00', team1: 'FUL', team2: 'ARS', venue: 'Craven Cottage' },
  { id: 'E18-006', gw: 18, period: '2026-12', num: 176, date: '2026-12-31T03:00', team1: 'HUL', team2: 'LEE', venue: 'MKM Stadium' },
  { id: 'E18-007', gw: 18, period: '2026-12', num: 177, date: '2026-12-31T03:00', team1: 'IPS', team2: 'CHE', venue: 'Portman Road' },
  { id: 'E18-008', gw: 18, period: '2026-12', num: 178, date: '2026-12-31T03:00', team1: 'MUN', team2: 'SUN', venue: 'Old Trafford' },
  { id: 'E18-009', gw: 18, period: '2026-12', num: 179, date: '2026-12-31T03:00', team1: 'NEW', team2: 'NFO', venue: "St. James' Park" },
  { id: 'E18-010', gw: 18, period: '2026-12', num: 180, date: '2026-12-31T03:00', team1: 'TOT', team2: 'BHA', venue: 'Tottenham Hotspur Stadium' },
  // --- GW19 (2027-01) ---
  { id: 'E19-001', gw: 19, period: '2027-01', num: 181, date: '2027-01-02T22:00', team1: 'BOU', team2: 'AVL', venue: 'Vitality Stadium' },
  { id: 'E19-002', gw: 19, period: '2027-01', num: 182, date: '2027-01-02T22:00', team1: 'ARS', team2: 'IPS', venue: 'Emirates Stadium' },
  { id: 'E19-003', gw: 19, period: '2027-01', num: 183, date: '2027-01-02T22:00', team1: 'BRE', team2: 'CRY', venue: 'Gtech Community Stadium' },
  { id: 'E19-004', gw: 19, period: '2027-01', num: 184, date: '2027-01-02T22:00', team1: 'BHA', team2: 'MUN', venue: 'American Express Stadium' },
  { id: 'E19-005', gw: 19, period: '2027-01', num: 185, date: '2027-01-02T22:00', team1: 'CHE', team2: 'NEW', venue: 'Stamford Bridge' },
  { id: 'E19-006', gw: 19, period: '2027-01', num: 186, date: '2027-01-02T22:00', team1: 'LEE', team2: 'EVE', venue: 'Elland Road' },
  { id: 'E19-007', gw: 19, period: '2027-01', num: 187, date: '2027-01-02T22:00', team1: 'LIV', team2: 'COV', venue: 'Anfield' },
  { id: 'E19-008', gw: 19, period: '2027-01', num: 188, date: '2027-01-02T22:00', team1: 'MCI', team2: 'TOT', venue: 'Etihad Stadium' },
  { id: 'E19-009', gw: 19, period: '2027-01', num: 189, date: '2027-01-02T22:00', team1: 'NFO', team2: 'FUL', venue: 'The City Ground' },
  { id: 'E19-010', gw: 19, period: '2027-01', num: 190, date: '2027-01-02T22:00', team1: 'SUN', team2: 'HUL', venue: 'Stadium of Light' },
  // --- GW20 (2027-01) ---
  { id: 'E20-001', gw: 20, period: '2027-01', num: 191, date: '2027-01-07T03:00', team1: 'ARS', team2: 'BRE', venue: 'Emirates Stadium' },
  { id: 'E20-002', gw: 20, period: '2027-01', num: 192, date: '2027-01-07T03:00', team1: 'BHA', team2: 'BOU', venue: 'American Express Stadium' },
  { id: 'E20-003', gw: 20, period: '2027-01', num: 193, date: '2027-01-07T03:00', team1: 'CRY', team2: 'CHE', venue: 'Selhurst Park' },
  { id: 'E20-004', gw: 20, period: '2027-01', num: 194, date: '2027-01-07T03:00', team1: 'EVE', team2: 'AVL', venue: 'Hill Dickinson Stadium' },
  { id: 'E20-005', gw: 20, period: '2027-01', num: 195, date: '2027-01-07T03:00', team1: 'FUL', team2: 'TOT', venue: 'Craven Cottage' },
  { id: 'E20-006', gw: 20, period: '2027-01', num: 196, date: '2027-01-07T03:00', team1: 'IPS', team2: 'COV', venue: 'Portman Road' },
  { id: 'E20-007', gw: 20, period: '2027-01', num: 197, date: '2027-01-07T03:00', team1: 'LEE', team2: 'MCI', venue: 'Elland Road' },
  { id: 'E20-008', gw: 20, period: '2027-01', num: 198, date: '2027-01-07T03:00', team1: 'MUN', team2: 'NEW', venue: 'Old Trafford' },
  { id: 'E20-009', gw: 20, period: '2027-01', num: 199, date: '2027-01-07T03:00', team1: 'NFO', team2: 'HUL', venue: 'The City Ground' },
  { id: 'E20-010', gw: 20, period: '2027-01', num: 200, date: '2027-01-07T03:00', team1: 'SUN', team2: 'LIV', venue: 'Stadium of Light' },
  // --- GW21 (2027-01) ---
  { id: 'E21-001', gw: 21, period: '2027-01', num: 201, date: '2027-01-16T22:00', team1: 'BOU', team2: 'IPS', venue: 'Vitality Stadium' },
  { id: 'E21-002', gw: 21, period: '2027-01', num: 202, date: '2027-01-16T22:00', team1: 'AVL', team2: 'MUN', venue: 'Villa Park' },
  { id: 'E21-003', gw: 21, period: '2027-01', num: 203, date: '2027-01-16T22:00', team1: 'BRE', team2: 'BHA', venue: 'Gtech Community Stadium' },
  { id: 'E21-004', gw: 21, period: '2027-01', num: 204, date: '2027-01-16T22:00', team1: 'CHE', team2: 'SUN', venue: 'Stamford Bridge' },
  { id: 'E21-005', gw: 21, period: '2027-01', num: 205, date: '2027-01-16T22:00', team1: 'COV', team2: 'EVE', venue: 'Coventry Building Society Arena' },
  { id: 'E21-006', gw: 21, period: '2027-01', num: 206, date: '2027-01-16T22:00', team1: 'HUL', team2: 'ARS', venue: 'MKM Stadium' },
  { id: 'E21-007', gw: 21, period: '2027-01', num: 207, date: '2027-01-16T22:00', team1: 'LIV', team2: 'CRY', venue: 'Anfield' },
  { id: 'E21-008', gw: 21, period: '2027-01', num: 208, date: '2027-01-16T22:00', team1: 'MCI', team2: 'NFO', venue: 'Etihad Stadium' },
  { id: 'E21-009', gw: 21, period: '2027-01', num: 209, date: '2027-01-16T22:00', team1: 'NEW', team2: 'FUL', venue: "St. James' Park" },
  { id: 'E21-010', gw: 21, period: '2027-01', num: 210, date: '2027-01-16T22:00', team1: 'TOT', team2: 'LEE', venue: 'Tottenham Hotspur Stadium' },
  // --- GW22 (2027-01) ---
  { id: 'E22-001', gw: 22, period: '2027-01', num: 211, date: '2027-01-23T22:00', team1: 'ARS', team2: 'NEW', venue: 'Emirates Stadium' },
  { id: 'E22-002', gw: 22, period: '2027-01', num: 212, date: '2027-01-23T22:00', team1: 'BHA', team2: 'MCI', venue: 'American Express Stadium' },
  { id: 'E22-003', gw: 22, period: '2027-01', num: 213, date: '2027-01-23T22:00', team1: 'CRY', team2: 'TOT', venue: 'Selhurst Park' },
  { id: 'E22-004', gw: 22, period: '2027-01', num: 214, date: '2027-01-23T22:00', team1: 'EVE', team2: 'BRE', venue: 'Hill Dickinson Stadium' },
  { id: 'E22-005', gw: 22, period: '2027-01', num: 215, date: '2027-01-23T22:00', team1: 'FUL', team2: 'AVL', venue: 'Craven Cottage' },
  { id: 'E22-006', gw: 22, period: '2027-01', num: 216, date: '2027-01-23T22:00', team1: 'IPS', team2: 'HUL', venue: 'Portman Road' },
  { id: 'E22-007', gw: 22, period: '2027-01', num: 217, date: '2027-01-23T22:00', team1: 'LEE', team2: 'CHE', venue: 'Elland Road' },
  { id: 'E22-008', gw: 22, period: '2027-01', num: 218, date: '2027-01-23T22:00', team1: 'MUN', team2: 'LIV', venue: 'Old Trafford' },
  { id: 'E22-009', gw: 22, period: '2027-01', num: 219, date: '2027-01-23T22:00', team1: 'NFO', team2: 'BOU', venue: 'The City Ground' },
  { id: 'E22-010', gw: 22, period: '2027-01', num: 220, date: '2027-01-23T22:00', team1: 'SUN', team2: 'COV', venue: 'Stadium of Light' },
  // --- GW23 (2027-01) ---
  { id: 'E23-001', gw: 23, period: '2027-01', num: 221, date: '2027-01-30T22:00', team1: 'BOU', team2: 'FUL', venue: 'Vitality Stadium' },
  { id: 'E23-002', gw: 23, period: '2027-01', num: 222, date: '2027-01-30T22:00', team1: 'AVL', team2: 'IPS', venue: 'Villa Park' },
  { id: 'E23-003', gw: 23, period: '2027-01', num: 223, date: '2027-01-30T22:00', team1: 'BRE', team2: 'MUN', venue: 'Gtech Community Stadium' },
  { id: 'E23-004', gw: 23, period: '2027-01', num: 224, date: '2027-01-30T22:00', team1: 'CHE', team2: 'NFO', venue: 'Stamford Bridge' },
  { id: 'E23-005', gw: 23, period: '2027-01', num: 225, date: '2027-01-30T22:00', team1: 'COV', team2: 'LEE', venue: 'Coventry Building Society Arena' },
  { id: 'E23-006', gw: 23, period: '2027-01', num: 226, date: '2027-01-30T22:00', team1: 'HUL', team2: 'CRY', venue: 'MKM Stadium' },
  { id: 'E23-007', gw: 23, period: '2027-01', num: 227, date: '2027-01-30T22:00', team1: 'LIV', team2: 'EVE', venue: 'Anfield' },
  { id: 'E23-008', gw: 23, period: '2027-01', num: 228, date: '2027-01-30T22:00', team1: 'MCI', team2: 'ARS', venue: 'Etihad Stadium' },
  { id: 'E23-009', gw: 23, period: '2027-01', num: 229, date: '2027-01-30T22:00', team1: 'NEW', team2: 'BHA', venue: "St. James' Park" },
  { id: 'E23-010', gw: 23, period: '2027-01', num: 230, date: '2027-01-30T22:00', team1: 'TOT', team2: 'SUN', venue: 'Tottenham Hotspur Stadium' },
  // --- GW24 (2027-02) ---
  { id: 'E24-001', gw: 24, period: '2027-02', num: 231, date: '2027-02-06T22:00', team1: 'ARS', team2: 'LIV', venue: 'Emirates Stadium' },
  { id: 'E24-002', gw: 24, period: '2027-02', num: 232, date: '2027-02-06T22:00', team1: 'BHA', team2: 'HUL', venue: 'American Express Stadium' },
  { id: 'E24-003', gw: 24, period: '2027-02', num: 233, date: '2027-02-06T22:00', team1: 'CRY', team2: 'COV', venue: 'Selhurst Park' },
  { id: 'E24-004', gw: 24, period: '2027-02', num: 234, date: '2027-02-06T22:00', team1: 'EVE', team2: 'NEW', venue: 'Hill Dickinson Stadium' },
  { id: 'E24-005', gw: 24, period: '2027-02', num: 235, date: '2027-02-06T22:00', team1: 'FUL', team2: 'MCI', venue: 'Craven Cottage' },
  { id: 'E24-006', gw: 24, period: '2027-02', num: 236, date: '2027-02-06T22:00', team1: 'IPS', team2: 'TOT', venue: 'Portman Road' },
  { id: 'E24-007', gw: 24, period: '2027-02', num: 237, date: '2027-02-06T22:00', team1: 'LEE', team2: 'BOU', venue: 'Elland Road' },
  { id: 'E24-008', gw: 24, period: '2027-02', num: 238, date: '2027-02-06T22:00', team1: 'MUN', team2: 'CHE', venue: 'Old Trafford' },
  { id: 'E24-009', gw: 24, period: '2027-02', num: 239, date: '2027-02-06T22:00', team1: 'NFO', team2: 'BRE', venue: 'The City Ground' },
  { id: 'E24-010', gw: 24, period: '2027-02', num: 240, date: '2027-02-06T22:00', team1: 'SUN', team2: 'AVL', venue: 'Stadium of Light' },
  // --- GW25 (2027-02) ---
  { id: 'E25-001', gw: 25, period: '2027-02', num: 241, date: '2027-02-11T03:00', team1: 'AVL', team2: 'BOU', venue: 'Villa Park' },
  { id: 'E25-002', gw: 25, period: '2027-02', num: 242, date: '2027-02-11T03:00', team1: 'COV', team2: 'LIV', venue: 'Coventry Building Society Arena' },
  { id: 'E25-003', gw: 25, period: '2027-02', num: 243, date: '2027-02-11T03:00', team1: 'CRY', team2: 'BRE', venue: 'Selhurst Park' },
  { id: 'E25-004', gw: 25, period: '2027-02', num: 244, date: '2027-02-11T03:00', team1: 'EVE', team2: 'LEE', venue: 'Hill Dickinson Stadium' },
  { id: 'E25-005', gw: 25, period: '2027-02', num: 245, date: '2027-02-11T03:00', team1: 'FUL', team2: 'NFO', venue: 'Craven Cottage' },
  { id: 'E25-006', gw: 25, period: '2027-02', num: 246, date: '2027-02-11T03:00', team1: 'HUL', team2: 'SUN', venue: 'MKM Stadium' },
  { id: 'E25-007', gw: 25, period: '2027-02', num: 247, date: '2027-02-11T03:00', team1: 'IPS', team2: 'ARS', venue: 'Portman Road' },
  { id: 'E25-008', gw: 25, period: '2027-02', num: 248, date: '2027-02-11T03:00', team1: 'MUN', team2: 'BHA', venue: 'Old Trafford' },
  { id: 'E25-009', gw: 25, period: '2027-02', num: 249, date: '2027-02-11T03:00', team1: 'NEW', team2: 'CHE', venue: "St. James' Park" },
  { id: 'E25-010', gw: 25, period: '2027-02', num: 250, date: '2027-02-11T03:00', team1: 'TOT', team2: 'MCI', venue: 'Tottenham Hotspur Stadium' },
  // --- GW26 (2027-02) ---
  { id: 'E26-001', gw: 26, period: '2027-02', num: 251, date: '2027-02-20T22:00', team1: 'BOU', team2: 'CRY', venue: 'Vitality Stadium' },
  { id: 'E26-002', gw: 26, period: '2027-02', num: 252, date: '2027-02-20T22:00', team1: 'ARS', team2: 'FUL', venue: 'Emirates Stadium' },
  { id: 'E26-003', gw: 26, period: '2027-02', num: 253, date: '2027-02-20T22:00', team1: 'BRE', team2: 'COV', venue: 'Gtech Community Stadium' },
  { id: 'E26-004', gw: 26, period: '2027-02', num: 254, date: '2027-02-20T22:00', team1: 'BHA', team2: 'TOT', venue: 'American Express Stadium' },
  { id: 'E26-005', gw: 26, period: '2027-02', num: 255, date: '2027-02-20T22:00', team1: 'CHE', team2: 'IPS', venue: 'Stamford Bridge' },
  { id: 'E26-006', gw: 26, period: '2027-02', num: 256, date: '2027-02-20T22:00', team1: 'LEE', team2: 'AVL', venue: 'Elland Road' },
  { id: 'E26-007', gw: 26, period: '2027-02', num: 257, date: '2027-02-20T22:00', team1: 'LIV', team2: 'HUL', venue: 'Anfield' },
  { id: 'E26-008', gw: 26, period: '2027-02', num: 258, date: '2027-02-20T22:00', team1: 'MCI', team2: 'NEW', venue: 'Etihad Stadium' },
  { id: 'E26-009', gw: 26, period: '2027-02', num: 259, date: '2027-02-20T22:00', team1: 'NFO', team2: 'MUN', venue: 'The City Ground' },
  { id: 'E26-010', gw: 26, period: '2027-02', num: 260, date: '2027-02-20T22:00', team1: 'SUN', team2: 'EVE', venue: 'Stadium of Light' },
  // --- GW27 (2027-02) ---
  { id: 'E27-001', gw: 27, period: '2027-02', num: 261, date: '2027-02-27T22:00', team1: 'AVL', team2: 'CHE', venue: 'Villa Park' },
  { id: 'E27-002', gw: 27, period: '2027-02', num: 262, date: '2027-02-27T22:00', team1: 'COV', team2: 'BOU', venue: 'Coventry Building Society Arena' },
  { id: 'E27-003', gw: 27, period: '2027-02', num: 263, date: '2027-02-27T22:00', team1: 'CRY', team2: 'SUN', venue: 'Selhurst Park' },
  { id: 'E27-004', gw: 27, period: '2027-02', num: 264, date: '2027-02-27T22:00', team1: 'EVE', team2: 'NFO', venue: 'Hill Dickinson Stadium' },
  { id: 'E27-005', gw: 27, period: '2027-02', num: 265, date: '2027-02-27T22:00', team1: 'FUL', team2: 'LEE', venue: 'Craven Cottage' },
  { id: 'E27-006', gw: 27, period: '2027-02', num: 266, date: '2027-02-27T22:00', team1: 'HUL', team2: 'MCI', venue: 'MKM Stadium' },
  { id: 'E27-007', gw: 27, period: '2027-02', num: 267, date: '2027-02-27T22:00', team1: 'IPS', team2: 'BHA', venue: 'Portman Road' },
  { id: 'E27-008', gw: 27, period: '2027-02', num: 268, date: '2027-02-27T22:00', team1: 'MUN', team2: 'ARS', venue: 'Old Trafford' },
  { id: 'E27-009', gw: 27, period: '2027-02', num: 269, date: '2027-02-27T22:00', team1: 'NEW', team2: 'BRE', venue: "St. James' Park" },
  { id: 'E27-010', gw: 27, period: '2027-02', num: 270, date: '2027-02-27T22:00', team1: 'TOT', team2: 'LIV', venue: 'Tottenham Hotspur Stadium' },
  // --- GW28 (2027-03) ---
  { id: 'E28-001', gw: 28, period: '2027-03', num: 271, date: '2027-03-04T03:00', team1: 'BOU', team2: 'TOT', venue: 'Vitality Stadium' },
  { id: 'E28-002', gw: 28, period: '2027-03', num: 272, date: '2027-03-04T03:00', team1: 'ARS', team2: 'CRY', venue: 'Emirates Stadium' },
  { id: 'E28-003', gw: 28, period: '2027-03', num: 273, date: '2027-03-04T03:00', team1: 'BRE', team2: 'IPS', venue: 'Gtech Community Stadium' },
  { id: 'E28-004', gw: 28, period: '2027-03', num: 274, date: '2027-03-04T03:00', team1: 'BHA', team2: 'FUL', venue: 'American Express Stadium' },
  { id: 'E28-005', gw: 28, period: '2027-03', num: 275, date: '2027-03-04T03:00', team1: 'CHE', team2: 'COV', venue: 'Stamford Bridge' },
  { id: 'E28-006', gw: 28, period: '2027-03', num: 276, date: '2027-03-04T03:00', team1: 'LEE', team2: 'HUL', venue: 'Elland Road' },
  { id: 'E28-007', gw: 28, period: '2027-03', num: 277, date: '2027-03-04T03:00', team1: 'LIV', team2: 'AVL', venue: 'Anfield' },
  { id: 'E28-008', gw: 28, period: '2027-03', num: 278, date: '2027-03-04T03:00', team1: 'MCI', team2: 'EVE', venue: 'Etihad Stadium' },
  { id: 'E28-009', gw: 28, period: '2027-03', num: 279, date: '2027-03-04T03:00', team1: 'NFO', team2: 'NEW', venue: 'The City Ground' },
  { id: 'E28-010', gw: 28, period: '2027-03', num: 280, date: '2027-03-04T03:00', team1: 'SUN', team2: 'MUN', venue: 'Stadium of Light' },
  // --- GW29 (2027-03) ---
  { id: 'E29-001', gw: 29, period: '2027-03', num: 281, date: '2027-03-13T22:00', team1: 'BOU', team2: 'NEW', venue: 'Vitality Stadium' },
  { id: 'E29-002', gw: 29, period: '2027-03', num: 282, date: '2027-03-13T22:00', team1: 'AVL', team2: 'HUL', venue: 'Villa Park' },
  { id: 'E29-003', gw: 29, period: '2027-03', num: 283, date: '2027-03-13T22:00', team1: 'CHE', team2: 'ARS', venue: 'Stamford Bridge' },
  { id: 'E29-004', gw: 29, period: '2027-03', num: 284, date: '2027-03-13T22:00', team1: 'COV', team2: 'MCI', venue: 'Coventry Building Society Arena' },
  { id: 'E29-005', gw: 29, period: '2027-03', num: 285, date: '2027-03-13T22:00', team1: 'CRY', team2: 'FUL', venue: 'Selhurst Park' },
  { id: 'E29-006', gw: 29, period: '2027-03', num: 286, date: '2027-03-13T22:00', team1: 'LEE', team2: 'BHA', venue: 'Elland Road' },
  { id: 'E29-007', gw: 29, period: '2027-03', num: 287, date: '2027-03-13T22:00', team1: 'LIV', team2: 'IPS', venue: 'Anfield' },
  { id: 'E29-008', gw: 29, period: '2027-03', num: 288, date: '2027-03-13T22:00', team1: 'MUN', team2: 'EVE', venue: 'Old Trafford' },
  { id: 'E29-009', gw: 29, period: '2027-03', num: 289, date: '2027-03-13T22:00', team1: 'SUN', team2: 'BRE', venue: 'Stadium of Light' },
  { id: 'E29-010', gw: 29, period: '2027-03', num: 290, date: '2027-03-13T22:00', team1: 'TOT', team2: 'NFO', venue: 'Tottenham Hotspur Stadium' },
  // --- GW30 (2027-03) ---
  { id: 'E30-001', gw: 30, period: '2027-03', num: 291, date: '2027-03-20T22:00', team1: 'ARS', team2: 'SUN', venue: 'Emirates Stadium' },
  { id: 'E30-002', gw: 30, period: '2027-03', num: 292, date: '2027-03-20T22:00', team1: 'BRE', team2: 'BOU', venue: 'Gtech Community Stadium' },
  { id: 'E30-003', gw: 30, period: '2027-03', num: 293, date: '2027-03-20T22:00', team1: 'BHA', team2: 'COV', venue: 'American Express Stadium' },
  { id: 'E30-004', gw: 30, period: '2027-03', num: 294, date: '2027-03-20T22:00', team1: 'EVE', team2: 'TOT', venue: 'Hill Dickinson Stadium' },
  { id: 'E30-005', gw: 30, period: '2027-03', num: 295, date: '2027-03-20T22:00', team1: 'FUL', team2: 'LIV', venue: 'Craven Cottage' },
  { id: 'E30-006', gw: 30, period: '2027-03', num: 296, date: '2027-03-20T22:00', team1: 'HUL', team2: 'CHE', venue: 'MKM Stadium' },
  { id: 'E30-007', gw: 30, period: '2027-03', num: 297, date: '2027-03-20T22:00', team1: 'IPS', team2: 'CRY', venue: 'Portman Road' },
  { id: 'E30-008', gw: 30, period: '2027-03', num: 298, date: '2027-03-20T22:00', team1: 'MCI', team2: 'MUN', venue: 'Etihad Stadium' },
  { id: 'E30-009', gw: 30, period: '2027-03', num: 299, date: '2027-03-20T22:00', team1: 'NEW', team2: 'LEE', venue: "St. James' Park" },
  { id: 'E30-010', gw: 30, period: '2027-03', num: 300, date: '2027-03-20T22:00', team1: 'NFO', team2: 'AVL', venue: 'The City Ground' },
  // --- GW31 (2027-04) ---
  { id: 'E31-001', gw: 31, period: '2027-04', num: 301, date: '2027-04-10T21:00', team1: 'BOU', team2: 'MCI', venue: 'Vitality Stadium' },
  { id: 'E31-002', gw: 31, period: '2027-04', num: 302, date: '2027-04-10T21:00', team1: 'AVL', team2: 'BHA', venue: 'Villa Park' },
  { id: 'E31-003', gw: 31, period: '2027-04', num: 303, date: '2027-04-10T21:00', team1: 'CHE', team2: 'FUL', venue: 'Stamford Bridge' },
  { id: 'E31-004', gw: 31, period: '2027-04', num: 304, date: '2027-04-10T21:00', team1: 'COV', team2: 'ARS', venue: 'Coventry Building Society Arena' },
  { id: 'E31-005', gw: 31, period: '2027-04', num: 305, date: '2027-04-10T21:00', team1: 'CRY', team2: 'EVE', venue: 'Selhurst Park' },
  { id: 'E31-006', gw: 31, period: '2027-04', num: 306, date: '2027-04-10T21:00', team1: 'LEE', team2: 'NFO', venue: 'Elland Road' },
  { id: 'E31-007', gw: 31, period: '2027-04', num: 307, date: '2027-04-10T21:00', team1: 'LIV', team2: 'NEW', venue: 'Anfield' },
  { id: 'E31-008', gw: 31, period: '2027-04', num: 308, date: '2027-04-10T21:00', team1: 'MUN', team2: 'HUL', venue: 'Old Trafford' },
  { id: 'E31-009', gw: 31, period: '2027-04', num: 309, date: '2027-04-10T21:00', team1: 'SUN', team2: 'IPS', venue: 'Stadium of Light' },
  { id: 'E31-010', gw: 31, period: '2027-04', num: 310, date: '2027-04-10T21:00', team1: 'TOT', team2: 'BRE', venue: 'Tottenham Hotspur Stadium' },
  // --- GW32 (2027-04) ---
  { id: 'E32-001', gw: 32, period: '2027-04', num: 311, date: '2027-04-17T21:00', team1: 'ARS', team2: 'AVL', venue: 'Emirates Stadium' },
  { id: 'E32-002', gw: 32, period: '2027-04', num: 312, date: '2027-04-17T21:00', team1: 'BRE', team2: 'LEE', venue: 'Gtech Community Stadium' },
  { id: 'E32-003', gw: 32, period: '2027-04', num: 313, date: '2027-04-17T21:00', team1: 'BHA', team2: 'CHE', venue: 'American Express Stadium' },
  { id: 'E32-004', gw: 32, period: '2027-04', num: 314, date: '2027-04-17T21:00', team1: 'EVE', team2: 'BOU', venue: 'Hill Dickinson Stadium' },
  { id: 'E32-005', gw: 32, period: '2027-04', num: 315, date: '2027-04-17T21:00', team1: 'FUL', team2: 'SUN', venue: 'Craven Cottage' },
  { id: 'E32-006', gw: 32, period: '2027-04', num: 316, date: '2027-04-17T21:00', team1: 'HUL', team2: 'COV', venue: 'MKM Stadium' },
  { id: 'E32-007', gw: 32, period: '2027-04', num: 317, date: '2027-04-17T21:00', team1: 'IPS', team2: 'MUN', venue: 'Portman Road' },
  { id: 'E32-008', gw: 32, period: '2027-04', num: 318, date: '2027-04-17T21:00', team1: 'MCI', team2: 'CRY', venue: 'Etihad Stadium' },
  { id: 'E32-009', gw: 32, period: '2027-04', num: 319, date: '2027-04-17T21:00', team1: 'NEW', team2: 'TOT', venue: "St. James' Park" },
  { id: 'E32-010', gw: 32, period: '2027-04', num: 320, date: '2027-04-17T21:00', team1: 'NFO', team2: 'LIV', venue: 'The City Ground' },
  // --- GW33 (2027-04) ---
  { id: 'E33-001', gw: 33, period: '2027-04', num: 321, date: '2027-04-24T21:00', team1: 'BOU', team2: 'ARS', venue: 'Vitality Stadium' },
  { id: 'E33-002', gw: 33, period: '2027-04', num: 322, date: '2027-04-24T21:00', team1: 'AVL', team2: 'COV', venue: 'Villa Park' },
  { id: 'E33-003', gw: 33, period: '2027-04', num: 323, date: '2027-04-24T21:00', team1: 'BRE', team2: 'FUL', venue: 'Gtech Community Stadium' },
  { id: 'E33-004', gw: 33, period: '2027-04', num: 324, date: '2027-04-24T21:00', team1: 'CHE', team2: 'MCI', venue: 'Stamford Bridge' },
  { id: 'E33-005', gw: 33, period: '2027-04', num: 325, date: '2027-04-24T21:00', team1: 'EVE', team2: 'BHA', venue: 'Hill Dickinson Stadium' },
  { id: 'E33-006', gw: 33, period: '2027-04', num: 326, date: '2027-04-24T21:00', team1: 'LEE', team2: 'LIV', venue: 'Elland Road' },
  { id: 'E33-007', gw: 33, period: '2027-04', num: 327, date: '2027-04-24T21:00', team1: 'MUN', team2: 'CRY', venue: 'Old Trafford' },
  { id: 'E33-008', gw: 33, period: '2027-04', num: 328, date: '2027-04-24T21:00', team1: 'NEW', team2: 'IPS', venue: "St. James' Park" },
  { id: 'E33-009', gw: 33, period: '2027-04', num: 329, date: '2027-04-24T21:00', team1: 'NFO', team2: 'SUN', venue: 'The City Ground' },
  { id: 'E33-010', gw: 33, period: '2027-04', num: 330, date: '2027-04-24T21:00', team1: 'TOT', team2: 'HUL', venue: 'Tottenham Hotspur Stadium' },
  // --- GW34 (2027-05) ---
  { id: 'E34-001', gw: 34, period: '2027-05', num: 331, date: '2027-05-01T21:00', team1: 'ARS', team2: 'TOT', venue: 'Emirates Stadium' },
  { id: 'E34-002', gw: 34, period: '2027-05', num: 332, date: '2027-05-01T21:00', team1: 'BHA', team2: 'NFO', venue: 'American Express Stadium' },
  { id: 'E34-003', gw: 34, period: '2027-05', num: 333, date: '2027-05-01T21:00', team1: 'COV', team2: 'MUN', venue: 'Coventry Building Society Arena' },
  { id: 'E34-004', gw: 34, period: '2027-05', num: 334, date: '2027-05-01T21:00', team1: 'CRY', team2: 'AVL', venue: 'Selhurst Park' },
  { id: 'E34-005', gw: 34, period: '2027-05', num: 335, date: '2027-05-01T21:00', team1: 'FUL', team2: 'EVE', venue: 'Craven Cottage' },
  { id: 'E34-006', gw: 34, period: '2027-05', num: 336, date: '2027-05-01T21:00', team1: 'HUL', team2: 'BOU', venue: 'MKM Stadium' },
  { id: 'E34-007', gw: 34, period: '2027-05', num: 337, date: '2027-05-01T21:00', team1: 'IPS', team2: 'LEE', venue: 'Portman Road' },
  { id: 'E34-008', gw: 34, period: '2027-05', num: 338, date: '2027-05-01T21:00', team1: 'LIV', team2: 'CHE', venue: 'Anfield' },
  { id: 'E34-009', gw: 34, period: '2027-05', num: 339, date: '2027-05-01T21:00', team1: 'MCI', team2: 'BRE', venue: 'Etihad Stadium' },
  { id: 'E34-010', gw: 34, period: '2027-05', num: 340, date: '2027-05-01T21:00', team1: 'SUN', team2: 'NEW', venue: 'Stadium of Light' },
  // --- GW35 (2027-05) ---
  { id: 'E35-001', gw: 35, period: '2027-05', num: 341, date: '2027-05-08T21:00', team1: 'BOU', team2: 'MUN', venue: 'Vitality Stadium' },
  { id: 'E35-002', gw: 35, period: '2027-05', num: 342, date: '2027-05-08T21:00', team1: 'BRE', team2: 'AVL', venue: 'Gtech Community Stadium' },
  { id: 'E35-003', gw: 35, period: '2027-05', num: 343, date: '2027-05-08T21:00', team1: 'BHA', team2: 'SUN', venue: 'American Express Stadium' },
  { id: 'E35-004', gw: 35, period: '2027-05', num: 344, date: '2027-05-08T21:00', team1: 'EVE', team2: 'HUL', venue: 'Hill Dickinson Stadium' },
  { id: 'E35-005', gw: 35, period: '2027-05', num: 345, date: '2027-05-08T21:00', team1: 'FUL', team2: 'IPS', venue: 'Craven Cottage' },
  { id: 'E35-006', gw: 35, period: '2027-05', num: 346, date: '2027-05-08T21:00', team1: 'LEE', team2: 'ARS', venue: 'Elland Road' },
  { id: 'E35-007', gw: 35, period: '2027-05', num: 347, date: '2027-05-08T21:00', team1: 'MCI', team2: 'LIV', venue: 'Etihad Stadium' },
  { id: 'E35-008', gw: 35, period: '2027-05', num: 348, date: '2027-05-08T21:00', team1: 'NEW', team2: 'COV', venue: "St. James' Park" },
  { id: 'E35-009', gw: 35, period: '2027-05', num: 349, date: '2027-05-08T21:00', team1: 'NFO', team2: 'CRY', venue: 'The City Ground' },
  { id: 'E35-010', gw: 35, period: '2027-05', num: 350, date: '2027-05-08T21:00', team1: 'TOT', team2: 'CHE', venue: 'Tottenham Hotspur Stadium' },
  // --- GW36 (2027-05) ---
  { id: 'E36-001', gw: 36, period: '2027-05', num: 351, date: '2027-05-15T21:00', team1: 'ARS', team2: 'NFO', venue: 'Emirates Stadium' },
  { id: 'E36-002', gw: 36, period: '2027-05', num: 352, date: '2027-05-15T21:00', team1: 'AVL', team2: 'NEW', venue: 'Villa Park' },
  { id: 'E36-003', gw: 36, period: '2027-05', num: 353, date: '2027-05-15T21:00', team1: 'CHE', team2: 'EVE', venue: 'Stamford Bridge' },
  { id: 'E36-004', gw: 36, period: '2027-05', num: 354, date: '2027-05-15T21:00', team1: 'COV', team2: 'TOT', venue: 'Coventry Building Society Arena' },
  { id: 'E36-005', gw: 36, period: '2027-05', num: 355, date: '2027-05-15T21:00', team1: 'CRY', team2: 'BHA', venue: 'Selhurst Park' },
  { id: 'E36-006', gw: 36, period: '2027-05', num: 356, date: '2027-05-15T21:00', team1: 'HUL', team2: 'FUL', venue: 'MKM Stadium' },
  { id: 'E36-007', gw: 36, period: '2027-05', num: 357, date: '2027-05-15T21:00', team1: 'IPS', team2: 'MCI', venue: 'Portman Road' },
  { id: 'E36-008', gw: 36, period: '2027-05', num: 358, date: '2027-05-15T21:00', team1: 'LIV', team2: 'BRE', venue: 'Anfield' },
  { id: 'E36-009', gw: 36, period: '2027-05', num: 359, date: '2027-05-15T21:00', team1: 'MUN', team2: 'LEE', venue: 'Old Trafford' },
  { id: 'E36-010', gw: 36, period: '2027-05', num: 360, date: '2027-05-15T21:00', team1: 'SUN', team2: 'BOU', venue: 'Stadium of Light' },
  // --- GW37 (2027-05) ---
  { id: 'E37-001', gw: 37, period: '2027-05', num: 361, date: '2027-05-23T21:00', team1: 'BOU', team2: 'CHE', venue: 'Vitality Stadium' },
  { id: 'E37-002', gw: 37, period: '2027-05', num: 362, date: '2027-05-23T21:00', team1: 'BRE', team2: 'HUL', venue: 'Gtech Community Stadium' },
  { id: 'E37-003', gw: 37, period: '2027-05', num: 363, date: '2027-05-23T21:00', team1: 'BHA', team2: 'LIV', venue: 'American Express Stadium' },
  { id: 'E37-004', gw: 37, period: '2027-05', num: 364, date: '2027-05-23T21:00', team1: 'EVE', team2: 'ARS', venue: 'Hill Dickinson Stadium' },
  { id: 'E37-005', gw: 37, period: '2027-05', num: 365, date: '2027-05-23T21:00', team1: 'FUL', team2: 'COV', venue: 'Craven Cottage' },
  { id: 'E37-006', gw: 37, period: '2027-05', num: 366, date: '2027-05-23T21:00', team1: 'LEE', team2: 'SUN', venue: 'Elland Road' },
  { id: 'E37-007', gw: 37, period: '2027-05', num: 367, date: '2027-05-23T21:00', team1: 'MCI', team2: 'AVL', venue: 'Etihad Stadium' },
  { id: 'E37-008', gw: 37, period: '2027-05', num: 368, date: '2027-05-23T21:00', team1: 'NEW', team2: 'CRY', venue: "St. James' Park" },
  { id: 'E37-009', gw: 37, period: '2027-05', num: 369, date: '2027-05-23T21:00', team1: 'NFO', team2: 'IPS', venue: 'The City Ground' },
  { id: 'E37-010', gw: 37, period: '2027-05', num: 370, date: '2027-05-23T21:00', team1: 'TOT', team2: 'MUN', venue: 'Tottenham Hotspur Stadium' },
  // --- GW38 (2027-05) ---
  { id: 'E38-001', gw: 38, period: '2027-05', num: 371, date: '2027-05-30T22:00', team1: 'ARS', team2: 'BHA', venue: 'Emirates Stadium' },
  { id: 'E38-002', gw: 38, period: '2027-05', num: 372, date: '2027-05-30T22:00', team1: 'AVL', team2: 'TOT', venue: 'Villa Park' },
  { id: 'E38-003', gw: 38, period: '2027-05', num: 373, date: '2027-05-30T22:00', team1: 'CHE', team2: 'BRE', venue: 'Stamford Bridge' },
  { id: 'E38-004', gw: 38, period: '2027-05', num: 374, date: '2027-05-30T22:00', team1: 'COV', team2: 'NFO', venue: 'Coventry Building Society Arena' },
  { id: 'E38-005', gw: 38, period: '2027-05', num: 375, date: '2027-05-30T22:00', team1: 'CRY', team2: 'LEE', venue: 'Selhurst Park' },
  { id: 'E38-006', gw: 38, period: '2027-05', num: 376, date: '2027-05-30T22:00', team1: 'HUL', team2: 'NEW', venue: 'MKM Stadium' },
  { id: 'E38-007', gw: 38, period: '2027-05', num: 377, date: '2027-05-30T22:00', team1: 'IPS', team2: 'EVE', venue: 'Portman Road' },
  { id: 'E38-008', gw: 38, period: '2027-05', num: 378, date: '2027-05-30T22:00', team1: 'LIV', team2: 'BOU', venue: 'Anfield' },
  { id: 'E38-009', gw: 38, period: '2027-05', num: 379, date: '2027-05-30T22:00', team1: 'MUN', team2: 'FUL', venue: 'Old Trafford' },
  { id: 'E38-010', gw: 38, period: '2027-05', num: 380, date: '2027-05-30T22:00', team1: 'SUN', team2: 'MCI', venue: 'Stadium of Light' },
];

// Gameweek -> settlement month. A gameweek never splits across two months.
const GW_PERIOD = {
  1: '2026-08',   2: '2026-08',   3: '2026-09',   4: '2026-09',   5: '2026-09',   6: '2026-10',
  7: '2026-10',   8: '2026-10',   9: '2026-10',   10: '2026-11',   11: '2026-11',   12: '2026-11',
  13: '2026-12',   14: '2026-12',   15: '2026-12',   16: '2026-12',   17: '2026-12',   18: '2026-12',
  19: '2027-01',   20: '2027-01',   21: '2027-01',   22: '2027-01',   23: '2027-01',   24: '2027-02',
  25: '2027-02',   26: '2027-02',   27: '2027-02',   28: '2027-03',   29: '2027-03',   30: '2027-03',
  31: '2027-04',   32: '2027-04',   33: '2027-04',   34: '2027-05',   35: '2027-05',   36: '2027-05',
  37: '2027-05',   38: '2027-05', 
};

// House rules — UI copy. The authoritative copy is RULES in Code.gs; this one
// only drives the messages and the disabled states. Keep the two in sync.
const BET_RULES = {
  MIN_BET: 10,
  MAX_SINGLE: 3000,        // 1 pick. Steps have no stake cap — MAX_PAYOUT bounds them.
  MAX_PAYOUT: 10000,       // per slip
  SINGLE_OPEN_MIN: 180,    // เต็ง opens 3 h before the gameweek's FIRST kickoff...
  SINGLE_OPEN_HOUR_TH: 18, // ...or 18:00 Thai that day, whichever is earlier
  SINGLE_CUTOFF_MIN: 10,   // เต็ง closes 10 min before kickoff
  STEP_CUTOFF_MIN: 10,     // steps: open any time until 10 min before
  MAX_PICKS_PER_MATCH: 2,
  MIN_STEP_PICKS: 3,       // 1 pick = เต็ง, 3+ = สเต็ป, 2 = ไม่ได้
};

const MATCH_BY_ID = {};
MATCHES.forEach(m => { MATCH_BY_ID[m.id] = m; });

const MATCHES_BY_GW = {};
MATCHES.forEach(m => { (MATCHES_BY_GW[m.gw] = MATCHES_BY_GW[m.gw] || []).push(m); });

// Thai-local kickoff string -> UTC Date. Safe to compare with new Date()
// whatever timezone the viewer is in.
function kickoffUtc(dateThStr) {
  return new Date(dateThStr + ':00+07:00');
}

// Display-friendly kickoff, always Thai time
function formatMatchDate(match, lang) {
  const utc = kickoffUtc(match.date);
  const monthNames = lang === 'th'
    ? ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const thai = new Date(utc.getTime() + 7 * 3600 * 1000);
  const h = thai.getUTCHours().toString().padStart(2, '0');
  const m = thai.getUTCMinutes().toString().padStart(2, '0');
  return `${thai.getUTCDate()} ${monthNames[thai.getUTCMonth()]} ${h}:${m} น.`;
}

function gwLabel(gw, lang) {
  return lang === 'th' ? `นัดที่ ${gw}` : `GW ${gw}`;
}

function periodLabel(period, lang) {
  const [y, m] = String(period).split('-').map(Number);
  const th = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const en = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${(lang === 'th' ? th : en)[m - 1]} ${y}`;
}

// When เต็ง betting opens for a gameweek: 3 h before its earliest kickoff, or
// 18:00 Thai that day if that is earlier. The whole round opens at once, and a
// 02:00 kickoff never pushes the opening to 23:00.
function singleOpensAt(gw) {
  const ms = MATCHES_BY_GW[gw] || [];
  if (!ms.length) return 0;
  const first = Math.min.apply(null, ms.map(m => kickoffUtc(m.date).getTime()));
  const threeHoursBefore = first - BET_RULES.SINGLE_OPEN_MIN * 60 * 1000;
  const TH = 7 * 3600000;
  const thaiDayStart = Math.floor((threeHoursBefore + TH) / 86400000) * 86400000 - TH;
  return Math.min(threeHoursBefore, thaiDayStart + BET_RULES.SINGLE_OPEN_HOUR_TH * 3600000);
}

function gwOf(matchId) {
  const m = /^E(\d{2})-/.exec(String(matchId || ''));
  return m ? Number(m[1]) : null;
}

// The gameweek the app opens on: the first one that still has a match to come.
// Falls back to the last gameweek once the season is over.
function currentGw(now) {
  const t = (now || new Date()).getTime();
  for (let gw = 1; gw <= 38; gw++) {
    const ms = MATCHES_BY_GW[gw] || [];
    if (ms.some(m => kickoffUtc(m.date).getTime() > t)) return gw;
  }
  return 38;
}

function getTeamLabel(code, lang) {
  const t = TEAMS[code];
  if (!t) return String(code);
  return lang === 'th' ? t.nameTh : t.name;
}
