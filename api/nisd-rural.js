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

function fetchAppCountVillageThl(distCode, talukCode, fromDate, toDate, userId = 'rpt_panneerselvam', password = 'Taluk@123', roleId = '8', timeoutMs = 35000) {
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
    const flag = params.flag || 'N'; // NISD vs ISD
    const landCategory = (params.landCategory || 'rural').toLowerCase(); // 'rural' vs 'natham'
    const fromDate = formatDateToYYYYMMDD(params.fromDate || '2026-08-30');
    const toDate = formatDateToYYYYMMDD(params.toDate || '2026-09-11');
    const mode = params.mode || 'details';
    const villageCode = params.villageCode || '';
    const username = params.username || 'dlurpet';
    const password = params.password || '16-03-1992';
    const roleId = params.roleId || '7';

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
      const p2 = params.password || 'Taluk@123';
      const r2 = params.roleId || '8';
      const nowD = new Date();
      const curDay = String(nowD.getDate()).padStart(2, '0');
      const curMonth = String(nowD.getMonth() + 1).padStart(2, '0');
      const curYear = nowD.getFullYear();
      const defaultFrom = `01-${curMonth}-${curYear}`;
      const defaultTo = `${curDay}-${curMonth}-${curYear}`;
      const fromStr = formatDateToDDMMYYYY(params.fromDate || defaultFrom);
      const toStr = formatDateToDDMMYYYY(params.toDate || defaultTo);

      let rawData = [];
      try {
        rawData = await fetchAppCountVillageThl(distCode, talukCode, fromStr, toStr, u2, p2, r2, 35000);
      } catch (errThl) {
        console.warn('fetchAppCountVillageThl note:', errThl.message);
      }

      // Check if returned rawData actually belongs to the requested talukCode
      const normTargetTaluk = String(talukCode || '').replace(/^0+/, '');
      const filteredThl = (Array.isArray(rawData) ? rawData : []).filter(item => {
        const itemTaluk = String(item.taluk_code || '').replace(/^0+/, '');
        return itemTaluk === normTargetTaluk;
      });

      if (filteredThl.length > 0) {
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

          if (item.scode === '0105') { // Involving Sub-Division
            entry.inv = { approved: appr, pending: pend, rejected: rej, returned: ret, total: tot };
            grandInv.approved += appr;
            grandInv.pending += pend;
            grandInv.rejected += rej;
            grandInv.returned += ret;
            grandInv.total += tot;
          } else if (item.scode === '0103') { // Not Involving Sub-Division
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

      // Fallback: When secondary login (Tahsildar) does not cover this taluk (e.g. Arakkonam taluk 03),
      // fetch live authentic village counts from opt_pending_ason_today using primary credentials (DLU / District User)
      const fromDateYMD = formatDateToYYYYMMDD(params.fromDate || defaultFrom);
      const toDateYMD = formatDateToYYYYMMDD(params.toDate || defaultTo);

      const [invRes, notInvRes] = await Promise.all([
        fetchTamilNilamRaw({
          DistCode: String(distCode),
          taluckcode: String(talukCode).padStart(2, '0'),
          frmDate: fromDateYMD,
          toDate: toDateYMD,
          flag: 'I',
          villType: 'B',
          cdn_flag: 'T'
        }, username, password, roleId, 25000).catch(() => ({})),
        fetchTamilNilamRaw({
          DistCode: String(distCode),
          taluckcode: String(talukCode).padStart(2, '0'),
          frmDate: fromDateYMD,
          toDate: toDateYMD,
          flag: 'N',
          cdn_flag: 'T'
        }, username, password, roleId, 25000).catch(() => ({}))
      ]);

      const notInvMap = new Map();
      (notInvRes.distarr || []).forEach(v => {
        const c = String(v.village_code || '').padStart(3, '0');
        notInvMap.set(c, v);
      });

      const vMap = new Map();
      let sno = 1;
      let grandAll = { approved: 0, pending: 0, rejected: 0, returned: 0, total: 0 };
      let grandInv = { approved: 0, pending: 0, rejected: 0, returned: 0, total: 0 };
      let grandNotInv = { approved: 0, pending: 0, rejected: 0, returned: 0, total: 0 };

      (invRes.distarr || []).forEach(item => {
        const vCode = String(item.village_code || '').padStart(3, '0');
        const vName = (item.village_name || '').trim();
        const ni = notInvMap.get(vCode) || {};

        const invTot = parseInt(item.total || 0, 10);
        const notInvTot = parseInt(ni.total || 0, 10);
        const tot = invTot + notInvTot;

        const invEntry = {
          approved: 0,
          pending: invTot,
          rejected: 0,
          returned: 0,
          total: invTot
        };

        const notInvEntry = {
          approved: 0,
          pending: notInvTot,
          rejected: 0,
          returned: 0,
          total: notInvTot
        };

        vMap.set(vName, {
          sno: sno++,
          code: vCode,
          village: vName,
          village_tname: vName,
          approved: 0,
          pending: tot,
          rejected: 0,
          returned: 0,
          total: tot,
          inv: invEntry,
          notinv: notInvEntry
        });

        grandAll.pending += tot;
        grandAll.total += tot;
        grandInv.pending += invTot;
        grandInv.total += invTot;
        grandNotInv.pending += notInvTot;
        grandNotInv.total += notInvTot;
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
