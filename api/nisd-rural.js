// Vercel Serverless Function: /api/nisd-rural
// Fetches OPT Pending Report directly from Tamil Nilam portal
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

function fetchTamilNilamRaw(inputObj, userId = 'dlurpet', password = '16-03-1992', roleId = '7', timeoutMs = 12000) {
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
    const flag = params.flag || 'N'; // NISD
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
