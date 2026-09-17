// Vercel Serverless Function: /api/nisd-rural
// Fetches OPT Pending Report directly from Tamil Nilam portal (Rural & Natham)
const crypto = require('crypto');
const https = require('https');

function formatDateToDDMMYYYY(d) {
  if (!d) return '';
  if (/^\d{2}-\d{2}-\d{4}$/.test(d)) return d;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split('-');
    return `${day}-${m}-${y}`;
  }
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatDateToYYYYMMDD(d) {
  if (!d) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  if (/^\d{2}-\d{2}-\d{4}$/.test(d)) {
    const [day, m, y] = d.split('-');
    return `${y}-${m}-${day}`;
  }
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function fetchTamilNilamRaw(inputObj, userId = 'dlurpet', password = '16-03-1992', roleId = '7', timeoutMs = 35000) {
  return new Promise((resolve, reject) => {
    const sha1Password = crypto.createHash('sha1').update(password).digest('hex');
    const t = Date.now().toString();
    const inputVal = JSON.stringify(inputObj);
    const finalVal = userId + t + inputVal;
    const hash = crypto.createHmac('sha256', sha1Password).update(finalVal).digest('hex');

    const options = {
      hostname: 'tamilnilam.tn.gov.in',
      port: 443,
      path: '/Tnilam_Service_N/Report_Service/opt_pending_ason_today?jsoncallback=cb',
      method: 'POST',
      headers: {
        'emp_value': userId,
        'signature': hash,
        'timestamp': t,
        'roleId': roleId,
        'Referer': 'https://tamilnilam.tn.gov.in/Revenue/OptApplicationPendingAson.html',
        'Origin': 'https://tamilnilam.tn.gov.in',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Content-Length': Buffer.byteLength(inputVal)
      },
      rejectUnauthorized: false
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonStr = body.replace(/^cb\(/, '').replace(/\);?$/, '');
          const data = JSON.parse(jsonStr);
          resolve(data);
        } catch (err) {
          reject(new Error(`Failed to parse Tamil Nilam response: ${body.substring(0, 300)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Tamil Nilam portal request timed out after ${timeoutMs}ms. Tamil Nilam server may be slow or firewall blocked.`));
    });
    req.write(inputVal);
    req.end();
  });
}

function fetchNathamRaw(inputObj, userId = 'dlurpet', password = '16-03-1992', roleId = '7', timeoutMs = 35000) {
  return new Promise((resolve, reject) => {
    const sha1Password = crypto.createHash('sha1').update(password).digest('hex');
    const t = Date.now().toString();
    const inputStr = JSON.stringify(inputObj);
    // Natham API uses HMAC(sha1(password), userId + timestamp)
    const hash = crypto.createHmac('sha256', sha1Password).update(userId + t).digest('hex');

    const options = {
      hostname: 'tamilnilam.tn.gov.in',
      port: 443,
      path: '/Tnilam_Service_N/Report_Service/GetNathamOptDetails?jsoncallback=cb',
      method: 'POST',
      headers: {
        'emp_value': userId,
        'signature': hash,
        'timestamp': t,
        'roleId': roleId,
        'Content-Type': 'application/json',
        'Referer': 'https://tamilnilam.tn.gov.in/Revenue/Natham_OPT_Pending_report.html',
        'Origin': 'https://tamilnilam.tn.gov.in',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Content-Length': Buffer.byteLength(inputStr)
      },
      rejectUnauthorized: false
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonStr = body.replace(/^cb\(/, '').replace(/\);?$/, '');
          const data = JSON.parse(jsonStr);
          resolve(data);
        } catch (err) {
          reject(new Error(`Failed to parse Natham response: ${body.substring(0, 300)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Natham portal request timed out after ${timeoutMs}ms.`));
    });
    req.write(inputStr);
    req.end();
  });
}

function fetchMasterRaw(path, inputObj, userId = 'dlurpet', password = '16-03-1992', roleId = '7', timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const sha1Password = crypto.createHash('sha1').update(password).digest('hex');
    const t = Date.now().toString();
    const inputVal = inputObj ? JSON.stringify(inputObj) : '';
    const finalVal = userId + t + inputVal;
    const hash = crypto.createHmac('sha256', sha1Password).update(finalVal).digest('hex');

    const headers = {
      'emp_value': userId,
      'signature': hash,
      'timestamp': t,
      'roleId': roleId,
      'Referer': 'https://tamilnilam.tn.gov.in/Revenue/OptApplicationPendingAson.html',
      'Origin': 'https://tamilnilam.tn.gov.in',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };
    if (inputVal) headers['inputVal'] = inputVal;

    const options = {
      hostname: 'tamilnilam.tn.gov.in',
      port: 443,
      path: '/Tnilam_Service_N' + path + '?jsoncallback=cb',
      method: 'GET',
      headers: headers,
      rejectUnauthorized: false
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonStr = body.replace(/^cb\(/, '').replace(/\);?$/, '');
          resolve(JSON.parse(jsonStr));
        } catch (err) {
          reject(new Error(`Failed to parse response: ${body.substring(0, 300)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Timed out after ${timeoutMs}ms`));
    });
    req.end();
  });
}

function fetchAppCountVillageThl(distCode, talukCode, fromDate, toDate, userId = 'rpt_panneerselvam', password = 'Nemili@1970', roleId = '8', timeoutMs = 35000) {
  return new Promise((resolve, reject) => {
    const s1 = crypto.createHash('sha1').update(password).digest('hex');
    const t = Date.now().toString();
    const fromStr = formatDateToDDMMYYYY(fromDate);
    const toStr = formatDateToDDMMYYYY(toDate);
    const inputObj = {
      DistrictCode: String(distCode),
      talukCode: String(talukCode).padStart(2, '0'),
      fromdate: fromStr,
      todate: toStr
    };
    const inputVal = JSON.stringify(inputObj);
    const finalVal = userId + t + inputVal;
    const hash = crypto.createHmac('sha256', s1).update(finalVal).digest('hex');

    const options = {
      hostname: 'tamilnilam.tn.gov.in',
      port: 443,
      path: '/Tnilam_Service_N/Report_Service/getAppCountforVillage_thl?jsoncallback=cb',
      method: 'POST',
      headers: {
        'emp_value': userId,
        'signature': hash,
        'timestamp': t,
        'roleId': String(roleId || '8'),
        'inputVal': inputVal,
        'Referer': 'https://tamilnilam.tn.gov.in/Revenue/drilldowntasildar.html',
        'Origin': 'https://tamilnilam.tn.gov.in',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(inputVal),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      rejectUnauthorized: false
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonStr = body.replace(/^cb\(/, '').replace(/\);?$/, '');
          const data = JSON.parse(jsonStr);
          resolve(data);
        } catch (err) {
          reject(new Error(`Failed to parse Tamil Nilam drilldown response: ${body.substring(0, 300)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Tamil Nilam drilldown request timed out after ${timeoutMs}ms.`));
    });
    req.write(inputVal);
    req.end();
  });
}

const SB_URL = 'https://ollhtyeflpggdazrsqsq.supabase.co';
const SB_KEY = 'sb_publishable_vXtlD6VqEY8u_tBSdmw-0A_hxEIlf2j';

const TALUK_MAP = {
  '12': 'Nemili',
  '03': 'Arakkonam',
  '3': 'Arakkonam',
  '02': 'Arcot',
  '2': 'Arcot',
  '13': 'Kalavai',
  '14': 'Sholinghur',
  '04': 'Walajah',
  '4': 'Walajah'
};

function normVName(name) {
  return String(name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function fetchStoredIsdDataset(talukName) {
  return new Promise((resolve) => {
    if (!talukName) return resolve(null);
    const norm = talukName.trim();
    const encoded = encodeURIComponent(norm);
    const url = `${SB_URL}/rest/v1/isd_datasets?taluk=ilike.${encoded}&kind=eq.isdRuralPdf&select=payload,uploaded_at&order=uploaded_at.desc&limit=1`;
    const req = https.request(url, {
      headers: {
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`
      },
      timeout: 8000
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const rows = JSON.parse(body);
          if (rows && rows.length && rows[0].payload) {
            return resolve(rows[0].payload);
          }
        } catch (e) {}
        const url2 = `${SB_URL}/rest/v1/isd_test_datasets?taluk=ilike.${encoded}&kind=eq.isdRuralPdf&select=payload&order=uploaded_at.desc&limit=1`;
        const req2 = https.request(url2, {
          headers: {
            'apikey': SB_KEY,
            'Authorization': `Bearer ${SB_KEY}`
          },
          timeout: 8000
        }, res2 => {
          let body2 = '';
          res2.on('data', c => body2 += c);
          res2.on('end', () => {
            try {
              const rows2 = JSON.parse(body2);
              if (rows2 && rows2.length && rows2[0].payload) {
                return resolve(rows2[0].payload);
              }
            } catch (e) {}
            resolve(null);
          });
        });
        req2.on('error', () => resolve(null));
        req2.end();
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const params = req.method === 'POST' ? req.body || {} : req.query || {};

    const distCode = params.distCode || '37'; // Ranipet
    const talukCode = params.talukCode || '12'; // Nemili
    const talukName = (params.talukName || TALUK_MAP[String(talukCode).padStart(2, '0')] || TALUK_MAP[String(talukCode)] || '').trim();
    const flag = params.flag || 'N'; // NISD vs ISD
    const landCategory = (params.landCategory || 'rural').toLowerCase(); // 'rural' vs 'natham'
    const fromDate = formatDateToYYYYMMDD(params.fromDate || '2026-08-30');
    const toDate = formatDateToYYYYMMDD(params.toDate || '2026-09-11');
    const mode = params.mode || 'details';
    const villageCode = params.villageCode || '';
    const username = params.username || 'rpt_panneerselvam';
    const password = params.password || 'Nemili@1970';
    const roleId = params.roleId || '8';

    // 0. Cascading helper: Taluks for a district
    if (mode === 'taluks') {
      const taluks = await fetchMasterRaw('/Master/getTaluk', { DistrictCode: distCode }, username, password, roleId, 10000);
      const list = (Array.isArray(taluks) ? taluks : []).map(t => ({
        talukCode: String(t.tId || '').padStart(2, '0'),
        talukName: t.tName || ''
      })).filter(t => t.talukCode && t.talukName);

      res.status(200).json({
        success: true,
        distCode,
        taluks: list
      });
      return;
    }

    // 0. Cascading helper: Villages for a taluk
    if (mode === 'villages') {
      const result = await fetchMasterRaw('/Master/getVillage', { DistrictCode: distCode, talukCode }, username, password, roleId, 10000);
      let list = [];
      try {
        const rawArr = JSON.parse(result.villageArray || '[]');
        list = rawArr.map(v => ({
          villageCode: String(v.vId || '').padStart(3, '0'),
          villageName: v.vName || ''
        })).filter(v => v.villageCode && v.villageName);
      } catch (e) {
        console.error('Error parsing villageArray:', e);
      }

      res.status(200).json({
        success: true,
        distCode,
        talukCode,
        villages: list
      });
      return;
    }

    // ISD RURAL APPLICATION STATUS (from drilldowntasildar.html)
    if (mode === 'isd_status' || mode === 'drilldown') {
      const u2 = params.username || 'rpt_panneerselvam';
      const p2 = params.password || 'Nemili@1970';
      const r2 = params.roleId || '8';
      const nowD = new Date();
      const curDay = String(nowD.getDate()).padStart(2, '0');
      const curMonth = String(nowD.getMonth() + 1).padStart(2, '0');
      const curYear = nowD.getFullYear();
      const defaultFrom = `01-${curMonth}-${curYear}`;
      const defaultTo = `${curDay}-${curMonth}-${curYear}`;
      const fromStr = formatDateToDDMMYYYY(params.fromDate || defaultFrom);
      const toStr = formatDateToDDMMYYYY(params.toDate || defaultTo);

      // Try Tahsildar-level drilldown first
      let rawData = [];
      try {
        rawData = await fetchAppCountVillageThl(distCode, talukCode, fromStr, toStr, u2, p2, r2, 35000);
      } catch(e) {
        console.log('fetchAppCountVillageThl note:', e.message);
      }

      // Validate: check if returned records actually match the requested talukCode
      const normTargetTaluk = String(talukCode || '').replace(/^0+/, '');
      const filteredThl = (Array.isArray(rawData) ? rawData : []).filter(item => {
        const itemTaluk = String(item.taluk_code || '').replace(/^0+/, '');
        return itemTaluk === normTargetTaluk;
      });

      if (filteredThl.length > 0) {
        // Tahsildar response matches the requested taluk — use it directly
        const vMap = new Map();
        let sno = 1;
        let grandAll = { approved: 0, pending: 0, rejected: 0, returned: 0, total: 0 };
        let grandInv = { approved: 0, pending: 0, rejected: 0, returned: 0, total: 0 };
        let grandNotInv = { approved: 0, pending: 0, rejected: 0, returned: 0, total: 0 };

        filteredThl.forEach(item => {
          const vCode = item.village_code;
          const vName = (item.village_name || '').trim();
          if (!vMap.has(vCode)) {
            vMap.set(vCode, {
              sno: sno++,
              code: vCode,
              village: vName,
              village_tname: (item.village_tname || '').trim(),
              approved: 0,
              pending: 0,
              rejected: 0,
              returned: 0,
              total: 0,
              inv: null,
              notinv: null
            });
          }
          const entry = vMap.get(vCode);
          const appr = parseInt(item.approved || '0', 10);
          const pend = parseInt(item.pending || '0', 10);
          const rej = parseInt(item.rejected || '0', 10);
          const ret = parseInt(item.returned || '0', 10);
          const tot = parseInt(item.total || '0', 10);

          entry.approved += appr;
          entry.pending += pend;
          entry.rejected += rej;
          entry.returned += ret;
          entry.total += tot;

          grandAll.approved += appr;
          grandAll.pending += pend;
          grandAll.rejected += rej;
          grandAll.returned += ret;
          grandAll.total += tot;

          if (item.scode === '0105') {
            entry.inv = { approved: appr, pending: pend, rejected: rej, returned: ret, total: tot };
            grandInv.approved += appr;
            grandInv.pending += pend;
            grandInv.rejected += rej;
            grandInv.returned += ret;
            grandInv.total += tot;
          } else if (item.scode === '0103') {
            entry.notinv = { approved: appr, pending: pend, rejected: rej, returned: ret, total: tot };
            grandNotInv.approved += appr;
            grandNotInv.pending += pend;
            grandNotInv.rejected += rej;
            grandNotInv.returned += ret;
            grandNotInv.total += tot;
          }
        });

        const villagesList = Array.from(vMap.values());
        const period = `APPLICATION STATUS FROM: ${fromStr} TO: ${toStr}`;

        res.status(200).json({
          success: true,
          distCode,
          talukCode,
          period,
          asOn: `AND PENDING AS ON: ${toStr}`,
          villages: villagesList,
          totalVillages: villagesList.length,
          grand: {
            all: grandAll,
            inv: grandInv,
            notinv: grandNotInv
          },
          name: `TamilNilam_Auto_ISD_Status_${talukCode}.json`
        });
        return;
      }

      // Fallback: Tahsildar account does not cover this taluk.
      // Use District User (dlurpet, roleId 7) via opt_pending_ason_today + Supabase verified disposal data.
      const fromDateYMD = formatDateToYYYYMMDD(params.fromDate || defaultFrom);
      const toDateYMD = formatDateToYYYYMMDD(params.toDate || defaultTo);
      const targetTalukName = talukName || TALUK_MAP[String(talukCode).padStart(2, '0')] || TALUK_MAP[String(talukCode)] || '';

      const [invRes, notInvRes, storedData] = await Promise.all([
        fetchTamilNilamRaw({
          DistCode: String(distCode),
          taluckcode: String(talukCode).padStart(2, '0'),
          frmDate: fromDateYMD,
          toDate: toDateYMD,
          flag: 'I',
          villType: 'B',
          cdn_flag: 'T'
        }, 'dlurpet', '16-03-1992', '7', 25000).catch(() => ({})),
        fetchTamilNilamRaw({
          DistCode: String(distCode),
          taluckcode: String(talukCode).padStart(2, '0'),
          frmDate: fromDateYMD,
          toDate: toDateYMD,
          flag: 'N',
          cdn_flag: 'T'
        }, 'dlurpet', '16-03-1992', '7', 25000).catch(() => ({})),
        fetchStoredIsdDataset(targetTalukName)
      ]);

      const notInvMap = new Map();
      (notInvRes.distarr || []).forEach(v => {
        const c = String(v.village_code || '').padStart(3, '0');
        notInvMap.set(c, v);
      });

      // Index stored verified dataset if available
      const storedByCode = new Map();
      const storedByName = new Map();
      const rawStoredVillages = (storedData && Array.isArray(storedData.villages)) ? storedData.villages : [];
      rawStoredVillages.forEach(sv => {
        if (sv.code) {
          storedByCode.set(String(sv.code).padStart(3, '0'), sv);
          storedByCode.set(String(parseInt(sv.code, 10)), sv);
        }
        if (sv.village) {
          storedByName.set(normVName(sv.village), sv);
        }
      });

      const vMap = new Map();
      const matchedStoredCodes = new Set();
      let sno = 1;
      let grandAll = { approved: 0, pending: 0, rejected: 0, returned: 0, total: 0 };
      let grandInv = { approved: 0, pending: 0, rejected: 0, returned: 0, total: 0 };
      let grandNotInv = { approved: 0, pending: 0, rejected: 0, returned: 0, total: 0 };

      (invRes.distarr || []).forEach(item => {
        const vCode = String(item.village_code || '').padStart(3, '0');
        const vName = (item.village_name || '').trim();
        const ni = notInvMap.get(vCode) || {};

        const invPend = parseInt(item.total || 0, 10);
        const notInvPend = parseInt(ni.total || 0, 10);
        let tot = invPend + notInvPend;

        // Lookup stored verified disposal data
        const sv = storedByCode.get(vCode) || storedByName.get(normVName(vName));
        let appr = 0;
        let rej = 0;
        let ret = 0;
        let invAppr = 0, invRej = 0, invRet = 0, invP = invPend;
        let notInvAppr = 0, notInvRej = 0, notInvRet = 0, notInvP = notInvPend;

        if (sv) {
          if (sv.code) matchedStoredCodes.add(String(sv.code).padStart(3, '0'));
          appr = sv.approved || 0;
          rej = sv.rejected || 0;
          ret = sv.returned || 0;
          if (tot === 0 && (sv.pending || 0) > 0) {
            tot = sv.pending;
          }
          if (sv.inv) {
            invAppr = sv.inv.approved || 0;
            invRej = sv.inv.rejected || 0;
            invRet = sv.inv.returned || 0;
            if (invP === 0 && (sv.inv.pending || 0) > 0) invP = sv.inv.pending;
          }
          if (sv.notinv) {
            notInvAppr = sv.notinv.approved || 0;
            notInvRej = sv.notinv.rejected || 0;
            notInvRet = sv.notinv.returned || 0;
            if (notInvP === 0 && (sv.notinv.pending || 0) > 0) notInvP = sv.notinv.pending;
          }
        }

        const villageTotal = appr + tot + rej + ret;

        const invEntry = {
          approved: invAppr,
          pending: invP,
          rejected: invRej,
          returned: invRet,
          total: invAppr + invP + invRej + invRet
        };

        const notInvEntry = {
          approved: notInvAppr,
          pending: notInvP,
          rejected: notInvRej,
          returned: notInvRet,
          total: notInvAppr + notInvP + notInvRej + notInvRet
        };

        vMap.set(vName, {
          sno: sno++,
          code: vCode,
          village: vName,
          village_tname: item.village_tname || vName,
          approved: appr,
          pending: tot,
          rejected: rej,
          returned: ret,
          total: villageTotal,
          inv: invEntry,
          notinv: notInvEntry
        });

        grandAll.approved += appr;
        grandAll.pending += tot;
        grandAll.rejected += rej;
        grandAll.returned += ret;
        grandAll.total += villageTotal;

        grandInv.approved += invAppr;
        grandInv.pending += invP;
        grandInv.rejected += invRej;
        grandInv.returned += invRet;
        grandInv.total += invEntry.total;

        grandNotInv.approved += notInvAppr;
        grandNotInv.pending += notInvP;
        grandNotInv.rejected += notInvRej;
        grandNotInv.returned += notInvRet;
        grandNotInv.total += notInvEntry.total;
      });

      // Also include any stored villages that didn't have live pending applications today
      rawStoredVillages.forEach(sv => {
        const c3 = String(sv.code || '').padStart(3, '0');
        const vName = (sv.village || '').trim();
        if (!matchedStoredCodes.has(c3) && !vMap.has(vName)) {
          const appr = sv.approved || 0;
          const pend = sv.pending || 0;
          const rej = sv.rejected || 0;
          const ret = sv.returned || 0;
          const tot = sv.total || (appr + pend + rej + ret);

          vMap.set(vName, {
            sno: sno++,
            code: c3,
            village: vName,
            village_tname: sv.village_tname || vName,
            approved: appr,
            pending: pend,
            rejected: rej,
            returned: ret,
            total: tot,
            inv: sv.inv || { approved: appr, pending: pend, rejected: rej, returned: ret, total: tot },
            notinv: sv.notinv || { approved: 0, pending: 0, rejected: 0, returned: 0, total: 0 }
          });

          grandAll.approved += appr;
          grandAll.pending += pend;
          grandAll.rejected += rej;
          grandAll.returned += ret;
          grandAll.total += tot;

          if (sv.inv) {
            grandInv.approved += (sv.inv.approved || 0);
            grandInv.pending += (sv.inv.pending || 0);
            grandInv.rejected += (sv.inv.rejected || 0);
            grandInv.returned += (sv.inv.returned || 0);
            grandInv.total += (sv.inv.total || 0);
          }
          if (sv.notinv) {
            grandNotInv.approved += (sv.notinv.approved || 0);
            grandNotInv.pending += (sv.notinv.pending || 0);
            grandNotInv.rejected += (sv.notinv.rejected || 0);
            grandNotInv.returned += (sv.notinv.returned || 0);
            grandNotInv.total += (sv.notinv.total || 0);
          }
        }
      });

      // If storedData has overall grand numbers that exceed what we aggregated, harmonize them
      if (storedData && storedData.grand && storedData.grand.all && storedData.grand.all.approved > grandAll.approved) {
        grandAll.approved = Math.max(grandAll.approved, storedData.grand.all.approved || 0);
        grandAll.rejected = Math.max(grandAll.rejected, storedData.grand.all.rejected || 0);
        grandAll.returned = Math.max(grandAll.returned, storedData.grand.all.returned || 0);
        grandAll.total = grandAll.approved + grandAll.pending + grandAll.rejected + grandAll.returned;
      }

      const villagesList = Array.from(vMap.values());
      const period = `APPLICATION STATUS FROM: ${fromStr} TO: ${toStr}`;

      res.status(200).json({
        success: true,
        distCode,
        talukCode,
        period,
        asOn: `AND PENDING AS ON: ${toStr}`,
        villages: villagesList,
        totalVillages: villagesList.length,
        grand: {
          all: grandAll,
          inv: grandInv,
          notinv: grandNotInv
        },
        source: rawStoredVillages.length > 0 ? 'district_live_pending_plus_verified_disposal' : 'district_user_fallback',
        name: `TamilNilam_Auto_ISD_Status_${talukCode}.json`
      });
      return;
    }

    // NATHAM REPORT HANDLING
    if (landCategory === 'natham' || mode === 'natham') {
      const nathamPayload = {
        FlagVal: 'Detail',
        TransVal: flag === 'I' ? 'I' : 'N',
        frmDate: fromDate,
        toDate: toDate,
        DCOde: distCode,
        TCOde: `'${talukCode}'`
      };

      const nathamData = await fetchNathamRaw(nathamPayload, username, password, roleId, 35000);
      const rawList = nathamData.NathamOPTportal || [];

      // Filter and normalize applications
      const normalizedApps = [];
      rawList.forEach(item => {
        const status = (item.appl_status || '').trim();
        const pendingAt = (item.pending_at || '').trim();

        // Check if application is pending
        const isPending = status === 'Pending' || (pendingAt && pendingAt !== '-');

        // Role filtering for pending applications
        if (isPending) {
          if (flag === 'N') {
            // NISD Natham: pending at VAO only
            if (pendingAt.toUpperCase() !== 'VAO') return;
          } else {
            // ISD Natham: pending at VAO or Surveyor
            const pUpper = pendingAt.toUpperCase();
            if (!pUpper.includes('VAO') && !pUpper.includes('SURVEYOR')) return;
          }
        }

        normalizedApps.push({
          appl_id: item.appl_id || '',
          appl_date: item.appl_dt || item.appl_date || '',
          district_name: item.district_name || '',
          taluk_name: item.taluk_name || '',
          village_name: (item.village_name || '').trim(),
          zone_name: item.zone_name || '',
          rtr_str: item.rtr_str || '',
          pending_at: pendingAt || '-',
          appl_status: status || (isPending ? 'Pending' : 'Approved'),
          pending_days: item.pending_days || item.current_role || '0',
          total_pending: item.pending_days || item.current_role || '0',
          update_dt: item.update_dt || ''
        });
      });

      const period = `NATHAM OPT APPLICATION RECEIVED FROM: ${formatDateToDDMMYYYY(fromDate)} TO: ${formatDateToDDMMYYYY(toDate)}`;

      res.status(200).json({
        success: true,
        isNatham: true,
        landCategory: 'natham',
        period,
        asOn: `AND PENDING AS ON: ${formatDateToDDMMYYYY(toDate)}`,
        applications: normalizedApps,
        totalApplications: normalizedApps.length
      });
      return;
    }

    // RURAL REPORT HANDLING
    // 1. Fetch taluk summary (cdn_flag: 'T')
    if (mode === 'summary' || mode === 'nisd-range') {
      const summaryData = await fetchTamilNilamRaw({
        DistCode: distCode,
        taluckcode: talukCode,
        frmDate: fromDate,
        toDate: toDate,
        flag: flag,
        villType: flag === 'I' ? (params.villType || 'B') : undefined,
        cdn_flag: 'T'
      }, username, password, roleId, 15000);

      const period = `OPT APPLICATION RECEIVED FROM: ${formatDateToDDMMYYYY(fromDate)} TO: ${formatDateToDDMMYYYY(toDate)}`;
      const asOn = summaryData.datearray && summaryData.datearray[0] ? summaryData.datearray[0].todayDate : '';

      if (mode === 'nisd-range') {
        const rows = (summaryData.distarr || []).map(v => ({
          village: v.village_name || '',
          villageCode: v.village_code || '',
          taluk: v.taluk_name || '',
          zone: v.zone_name || '',
          rtr: parseInt(v.vao_rtr || '0', 10),
          str: parseInt(v.vao_str || '0', 10),
          total: parseInt(v.vao || '0', 10),
          zdt_rtr: parseInt(v.zdt_rtr || '0', 10),
          zdt_str: parseInt(v.zdt_str || '0', 10),
          zdt_total: parseInt(v.zdt || '0', 10),
          hqdt_rtr: parseInt(v.hqdt_rtr || '0', 10),
          hqdt_str: parseInt(v.hqdt_str || '0', 10),
          hqdt_total: parseInt(v.hqdt || '0', 10),
          overall_rtr: parseInt(v.total_rtr || '0', 10),
          overall_str: parseInt(v.total_str || '0', 10),
          overall_total: parseInt(v.total || '0', 10)
        }));

        res.status(200).json({
          success: true,
          period,
          asOn: asOn ? `AND PENDING AS ON: ${asOn}` : '',
          raw: summaryData,
          rows
        });
        return;
      }

      res.status(200).json({
        success: true,
        period,
        asOn,
        data: summaryData
      });
      return;
    }

    // 2. Specific village details (cdn_flag: 'V')
    if (villageCode) {
      const detailData = await fetchTamilNilamRaw({
        DistCode: distCode,
        taluckcode: talukCode,
        vcode: villageCode,
        frmDate: fromDate,
        toDate: toDate,
        flag: flag,
        villType: flag === 'I' ? (params.villType || 'B') : undefined,
        cdn_flag: 'V'
      }, username, password, roleId, 15000);

      const period = `OPT APPLICATION RECEIVED FROM: ${formatDateToDDMMYYYY(fromDate)} TO: ${formatDateToDDMMYYYY(toDate)}`;
      const asOn = detailData.datearray && detailData.datearray[0] ? detailData.datearray[0].todayDate : '';

      res.status(200).json({
        success: true,
        period,
        asOn,
        applications: detailData.distarr || [],
        total: (detailData.distarr || []).length
      });
      return;
    }

    // 3. All village details in the taluk (when no specific villageCode is provided)
    const talukSummary = await fetchTamilNilamRaw({
      DistCode: distCode,
      taluckcode: talukCode,
      frmDate: fromDate,
      toDate: toDate,
      flag: flag,
      villType: flag === 'I' ? (params.villType || 'B') : undefined,
      cdn_flag: 'T'
    }, username, password, roleId, 15000);

    const villages = talukSummary.distarr || [];
    const pendingVillages = villages.filter(v => {
      const tot = parseInt(v.total || v.vao || '0', 10);
      return tot > 0;
    });

    const period = `OPT APPLICATION RECEIVED FROM: ${formatDateToDDMMYYYY(fromDate)} TO: ${formatDateToDDMMYYYY(toDate)}`;
    const asOn = talukSummary.datearray && talukSummary.datearray[0] ? talukSummary.datearray[0].todayDate : '';

    // Concurrently fetch village details in chunks of 10
    const allApplications = [];
    const batchSize = 10;
    for (let i = 0; i < pendingVillages.length; i += batchSize) {
      const chunk = pendingVillages.slice(i, i + batchSize);
      const results = await Promise.all(
        chunk.map(v =>
          fetchTamilNilamRaw({
            DistCode: distCode,
            taluckcode: talukCode,
            vcode: v.village_code,
            frmDate: fromDate,
            toDate: toDate,
            flag: flag,
            villType: flag === 'I' ? (params.villType || 'B') : undefined,
            cdn_flag: 'V'
          }, username, password, roleId, 10000)
            .then(res => res.distarr || [])
            .catch(err => {
              console.error(`Village ${v.village_name} fetch skipped:`, err.message);
              return [];
            })
        )
      );
      results.forEach(arr => allApplications.push(...arr));
    }

    res.status(200).json({
      success: true,
      period,
      asOn,
      summary: talukSummary,
      villagesCount: villages.length,
      pendingVillagesCount: pendingVillages.length,
      applications: allApplications,
      totalApplications: allApplications.length
    });

  } catch (error) {
    console.error('API /api/nisd-rural error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
