// Vercel Serverless Function: /api/chitta
// Fetches Districts, Taluks, Villages, and Chitta Extract PDF from Tamil Nilam portal (Tahsildar login)
const crypto = require('crypto');
const https = require('https');

function callTnPortal(servicePath, inputObj, userId = 'rpt_panneerselvam', password = 'Taluk@123', roleId = '8', method = 'GET', timeoutMs = 35000) {
  return new Promise((resolve, reject) => {
    const s1 = crypto.createHash('sha1').update(password).digest('hex');
    const t = Date.now().toString();
    const inputVal = inputObj ? (typeof inputObj === 'string' ? inputObj : JSON.stringify(inputObj)) : '';
    const finalVal = inputVal.length > 0 ? (userId + t + inputVal) : (userId + t);
    const hash = crypto.createHmac('sha256', s1).update(finalVal).digest('hex');

    let fullPath = `/Tnilam_Service_N/${servicePath}`;
    fullPath += fullPath.includes('?') ? `&jsoncallback=cb` : `?jsoncallback=cb`;

    const options = {
      hostname: 'tamilnilam.tn.gov.in',
      port: 443,
      path: fullPath,
      method: method,
      headers: {
        'emp_value': userId,
        'signature': hash,
        'timestamp': t,
        'roleId': String(roleId),
        'Referer': 'https://tamilnilam.tn.gov.in/Revenue/Chitta_Extract_Common.html',
        'Origin': 'https://tamilnilam.tn.gov.in',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json;charset=utf-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      },
      rejectUnauthorized: false
    };

    if (inputVal && (method === 'GET' || method === 'POST')) {
      options.headers['inputVal'] = inputVal;
    }

    if (inputVal && method === 'POST') {
      options.headers['Content-Length'] = Buffer.byteLength(inputVal);
    }

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonStr = body.replace(/^cb\(/, '').replace(/\);?$/, '');
          const data = JSON.parse(jsonStr);
          resolve(data);
        } catch (err) {
          resolve({ error: `Failed to parse response: ${body.substring(0, 300)}`, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Tamil Nilam request timed out after ${timeoutMs}ms.`));
    });

    if (inputVal && method === 'POST') {
      req.write(inputVal);
    }
    req.end();
  });
}

module.exports = async (req, res) => {
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
    const mode = (params.mode || 'districts').toLowerCase();
    const username = params.username || 'rpt_panneerselvam';
    const password = params.password || 'Taluk@123';
    const roleId = params.roleId || '8';

    if (mode === 'districts') {
      const data = await callTnPortal('Master/getAllDistrict', null, username, password, roleId, 'GET');
      if (Array.isArray(data)) {
        const districts = data
          .filter(d => d.dId && d.dName)
          .map(d => ({ id: d.dId, name: d.dName }))
          .sort((a, b) => a.name.localeCompare(b.name));
        return res.status(200).json({ success: true, districts });
      }
      return res.status(200).json({ success: false, error: 'Could not load districts', raw: data });
    }

    if (mode === 'taluks') {
      const distCode = params.distCode || '37';
      const inputObj = { DistrictCode: String(distCode), dist_code: String(distCode) };
      const data = await callTnPortal('Master/getTaluk', inputObj, username, password, roleId, 'GET');
      if (Array.isArray(data)) {
        const taluks = data
          .filter(t => t.tId && t.tName)
          .map(t => ({ id: t.tId, name: t.tName }))
          .sort((a, b) => a.name.localeCompare(b.name));
        return res.status(200).json({ success: true, distCode, taluks });
      }
      return res.status(200).json({ success: false, error: 'Could not load taluks', raw: data });
    }

    if (mode === 'villages') {
      const distCode = params.distCode || '37';
      const talukCode = params.talukCode || '12';
      const inputObj = { DistrictCode: String(distCode), talukCode: String(talukCode) };
      const data = await callTnPortal('Master/getVillage', inputObj, username, password, roleId, 'GET');
      if (data && data.villageArray) {
        try {
          const arr = typeof data.villageArray === 'string' ? JSON.parse(data.villageArray) : data.villageArray;
          const villages = arr
            .filter(v => v.vId && v.vName)
            .map(v => ({ id: v.vId, name: v.vName }))
            .sort((a, b) => a.name.localeCompare(b.name));
          return res.status(200).json({ success: true, distCode, talukCode, villages });
        } catch (e) {
          return res.status(200).json({ success: false, error: 'Failed to parse village array: ' + e.message });
        }
      }
      return res.status(200).json({ success: false, error: 'Could not load villages', raw: data });
    }

    if (mode === 'download' || mode === 'pdf') {
      const distCode = String(params.distCode || '37').padStart(2, '0');
      const talukCode = String(params.talukCode || '12').padStart(2, '0');
      const villageCode = String(params.villageCode || '045').padStart(3, '0');
      const pattaNo = String(params.pattaNo || '').trim();
      const transType = (params.transType || 'N').toUpperCase(); // 'N' for Natham, 'R' for Rural

      if (!pattaNo) {
        return res.status(400).json({ success: false, error: 'Missing patta number (pattaNo)' });
      }

      const inputObj = {
        districtCode: distCode,
        talukCode: talukCode,
        villageCode: villageCode,
        pattaNo: pattaNo,
        txnType: transType,
        outputType: 'pdf',
        transType: transType
      };

      const data = await callTnPortal('Master/getChittaExtractData_pdf', inputObj, username, password, roleId, 'GET');

      if (data && data.base64Output) {
        const filename = `Chitta_${transType === 'N' ? 'Natham' : 'Rural'}_D${distCode}_T${talukCode}_V${villageCode}_Patta${pattaNo}.pdf`;
        
        // If client requested direct binary stream
        if (params.binary === 'true' || params.download === '1') {
          const pdfBuf = Buffer.from(data.base64Output, 'base64');
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.setHeader('Content-Length', pdfBuf.length);
          return res.status(200).send(pdfBuf);
        }

        return res.status(200).json({
          success: true,
          filename,
          base64: data.base64Output,
          statusDesc: data.Status_Desc || 'Success',
          status: data.Status
        });
      }

      const errMsg = data?.IssuePatta || data?.Status_Desc || data?.error || 'Failed to fetch Chitta PDF from Tamil Nilam portal';
      return res.status(200).json({ success: false, error: errMsg, raw: data });
    }

    res.status(400).json({ success: false, error: `Invalid mode: ${mode}` });

  } catch (error) {
    console.error('API /api/chitta error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
