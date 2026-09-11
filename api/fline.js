// Vercel Serverless Function: /api/fline
// Fetches F-Line & F-Line Appeal Reports directly from Tamil Nilam portal (Rural & Natham)
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

function fetchFlineRaw(endpoint, inputObj, userId = 'dlurpet', password = '16-03-1992', roleId = '7', timeoutMs = 35000) {
  return new Promise((resolve, reject) => {
    const sha1Password = crypto.createHash('sha1').update(password).digest('hex');
    const t = Date.now().toString();
    const inputStr = JSON.stringify(inputObj);
    const hash = crypto.createHmac('sha256', sha1Password).update(userId + t).digest('hex');

    const options = {
      hostname: 'tamilnilam.tn.gov.in',
      port: 443,
      path: '/Tnilam_Service_N/Report_Service/' + endpoint + '?jsoncallback=cb',
      method: 'POST',
      headers: {
        'emp_value': userId,
        'signature': hash,
        'timestamp': t,
        'roleId': roleId,
        'Content-Type': 'application/json',
        'Referer': 'https://tamilnilam.tn.gov.in/Revenue/Fline_report.html',
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
          reject(new Error(`Failed to parse F-Line response: ${body.substring(0, 300)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`F-Line portal request timed out after ${timeoutMs}ms.`));
    });
    req.write(inputStr);
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
    const reportType = (params.reportType || 'FLINE').toUpperCase(); // 'FLINE' vs 'APPEAL'
    const landCategory = (params.landCategory || 'rural').toLowerCase(); // 'rural' vs 'natham'
    const stmtFlag = params.stmtFlag || 'Current'; // 'Current' vs 'OPT'
    const fromDate = formatDateToYYYYMMDD(params.fromDate || '2026-09-01');
    const toDate = formatDateToYYYYMMDD(params.toDate || '2026-09-10');
    const mode = params.mode || 'details'; // 'details' vs 'summary'
    const username = params.username || 'dlurpet';
    const password = params.password || '16-03-1992';
    const roleId = params.roleId || '7';

    const typeFlag = landCategory === 'natham' ? 'N' : 'R';

    if (mode === 'summary') {
      const summaryPayload = {
        reportType: reportType,
        TypeFlag: typeFlag,
        DistCode: distCode,
        flagVal: 'T',
        Stmt_Flag: stmtFlag,
        frmDate: fromDate,
        toDate: toDate
      };

      const rawData = await fetchFlineRaw('getFlineReport', summaryPayload, username, password, roleId, 35000);
      const period = `F-LINE ${reportType} ${typeFlag === 'N' ? 'NATHAM' : 'RURAL'} SUMMARY REPORT FROM: ${formatDateToDDMMYYYY(fromDate)} TO: ${formatDateToDDMMYYYY(toDate)}`;

      res.status(200).json({
        success: true,
        reportType,
        landCategory,
        stmtFlag,
        period,
        asOn: `AND PENDING AS ON: ${formatDateToDDMMYYYY(toDate)}`,
        data: rawData,
        summaryRows: rawData.Fline_detail || []
      });
      return;
    }

    // DETAILS MODE
    const detailPayload = {
      reportType: reportType,
      TypeFlag: typeFlag,
      DistCode: distCode,
      FlagVal: '',
      frmDate: fromDate,
      toDate: toDate
    };

    const rawData = await fetchFlineRaw('getFlineReport_details', detailPayload, username, password, roleId, 35000);

    if (rawData.Status === 3 || rawData.Status === '3' || (rawData.StatusDesc && rawData.StatusDesc.includes('No Data'))) {
      res.status(200).json({
        success: true,
        reportType,
        landCategory,
        stmtFlag,
        period: `F-LINE ${reportType} ${typeFlag === 'N' ? 'NATHAM' : 'RURAL'} PENDING REPORT FROM: ${formatDateToDDMMYYYY(fromDate)} TO: ${formatDateToDDMMYYYY(toDate)}`,
        asOn: `AND PENDING AS ON: ${formatDateToDDMMYYYY(toDate)}`,
        applications: [],
        totalApplications: 0
      });
      return;
    }

    const rawList = rawData.Fline_detail || [];

    // Filter and normalize applications for selected taluk if specified
    const normalizedApps = [];
    rawList.forEach(item => {
      // Filter by taluk if talukCode is specified
      const itemTalukCode = String(item.taluk_code || '').padStart(2, '0');
      const targetTalukCode = String(talukCode || '').padStart(2, '0');
      
      if (talukCode && itemTalukCode && targetTalukCode && itemTalukCode !== targetTalukCode) {
        return;
      }

      normalizedApps.push({
        appl_id: item.appl_id || '',
        appl_date: item.appl_dt || item.appl_date || '',
        district_name: item.district_name || '',
        taluk_name: item.taluk_name || '',
        village_name: (item.village_name || '').trim(),
        survey_no: item.sur_sub || item.survey_no || '',
        pending_days: item.opt_days || item.pending_days || '0',
        total_pending: item.opt_days || item.pending_days || '0',
        pending_at: item.pending_at || 'Surveyor',
        appl_status: item.appl_status || 'Pending',
        update_dt: item.update_dt || '',
        reportType: reportType,
        landCategory: landCategory
      });
    });

    const period = `F-LINE ${reportType} ${typeFlag === 'N' ? 'NATHAM' : 'RURAL'} DETAIL REPORT FROM: ${formatDateToDDMMYYYY(fromDate)} TO: ${formatDateToDDMMYYYY(toDate)}`;

    res.status(200).json({
      success: true,
      reportType,
      landCategory,
      stmtFlag,
      period,
      asOn: `AND PENDING AS ON: ${formatDateToDDMMYYYY(toDate)}`,
      applications: normalizedApps,
      totalApplications: normalizedApps.length
    });

  } catch (error) {
    console.error('API /api/fline error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
