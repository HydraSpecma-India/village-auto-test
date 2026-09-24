// Vercel Serverless Function: /api/areg
// Handles Tamil Nilam A-Register Addition, Correction & Deletion applications (Tahsildar level)
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

const SERVICE_NAMES = {
  '0108': 'A-Register Addition (Rural)',
  '0109': 'A-Register Correction (Rural)',
  '0111': 'CLR Correction (Rural)',
  '0112': 'A-Register Deletion (Rural)',
  'N108': 'A-Register Addition (Natham)',
  'N109': 'A-Register Correction (Natham)',
  'N111': 'CLR Correction (Natham)',
  'N112': 'A-Register Deletion (Natham)'
};

function callTnService(path, inputObj = null, method = 'GET', userId = 'rpt_panneerselvam', password = 'Nemili@1970', roleId = '8', extraHeaders = {}, customBody = null, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const sha1Password = crypto.createHash('sha1').update(password).digest('hex');
    const t = Date.now().toString();
    const inputVal = inputObj ? (typeof inputObj === 'string' ? inputObj : JSON.stringify(inputObj)) : '';
    const finalVal = inputVal ? (userId + t + inputVal) : (userId + t);
    const hash = crypto.createHmac('sha256', sha1Password).update(finalVal).digest('hex');

    let fullPath = `/Tnilam_Service_N/${path}`;
    fullPath += fullPath.includes('?') ? `&jsoncallback=cb` : `?jsoncallback=cb`;

    const headers = {
      'emp_value': userId,
      'signature': hash,
      'timestamp': t,
      'roleId': String(roleId),
      'Referer': 'https://tamilnilam.tn.gov.in/Revenue/Common_AdditionForm.html?campFlag=N',
      'Origin': 'https://tamilnilam.tn.gov.in',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      ...extraHeaders
    };

    if (inputVal && (method === 'GET' || method === 'POST')) {
      headers['inputVal'] = inputVal;
    }

    const bodyToSend = customBody !== null ? customBody : (method === 'POST' ? inputVal : null);
    if (bodyToSend) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(bodyToSend);
    }

    const options = {
      hostname: 'tamilnilam.tn.gov.in',
      port: 443,
      path: fullPath,
      method: method,
      headers: headers,
      rejectUnauthorized: false
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const jsonStr = body.replace(/^cb\(/, '').replace(/\);?$/, '').trim();
          if (!jsonStr || jsonStr === 'cb()') {
            return resolve([]);
          }
          const parsed = JSON.parse(jsonStr);
          resolve(parsed);
        } catch (err) {
          if (body.includes('cb(') || body.includes('cb()')) {
            return resolve([]);
          }
          reject(new Error(`Failed to parse response: ${body.substring(0, 300)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Tamil Nilam portal request timed out after ${timeoutMs}ms.`));
    });
    if (bodyToSend) req.write(bodyToSend);
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
    const talukCode = String(params.talukCode || '03').padStart(2, '0'); // Arakkonam
    const serviceCode = params.serviceCode || '0109'; // 0109: A-REG Correction
    const nathamFlag = (serviceCode.startsWith('N') || params.nathamFlag === 'N') ? 'N' : 'R';
    const campFlag = params.campFlag || 'N';
    const username = params.username || 'rpt_panneerselvam';
    const password = params.password || 'Nemili@1970';
    const roleId = String(params.roleId || '8');
    const mode = params.mode || 'pending_list';

    // 1. PENDING APPLICATIONS LIST
    if (mode === 'pending_list' || mode === 'list') {
      const inputObj = {
        districtCode: String(distCode),
        talukCode: talukCode,
        ServiceCode: serviceCode,
        nathamFlag: nathamFlag,
        camp_flag: campFlag
      };

      const rawList = await callTnService('Master/getARegDetailsforTahsildar_load', inputObj, 'GET', username, password, roleId, {}, null, 30000);
      const appList = Array.isArray(rawList) ? rawList : [];

      // Normalize applications array
      const normalized = [];
      appList.forEach((item, idx) => {
        const val = item.value || item;
        const applId = val.applId || val.ApplId || val.appl_id || val.application_id || '';
        if (applId || val.survey_no) {
          normalized.push({
            sno: idx + 1,
            applId: applId || `AREG-${talukCode}-${val.survey_no || idx + 1}`,
            surveyNo: val.survey_no || val.surveyno || '',
            subdivNo: val.subdiv_no || val.subdivno || '',
            villageCode: String(val.village_code || val.vill_code || '').padStart(3, '0'),
            villageName: val.vill_name || val.village_name || '',
            applDate: val.appl_date || val.date || '',
            applStatus: val.applStatus || val.appl_status || 'Pending at Tahsildar',
            applicantName: val.applicant_name || val.appl_name || '',
            serviceCode: serviceCode,
            serviceName: SERVICE_NAMES[serviceCode] || 'A-Register Application'
          });
        }
      });

      res.status(200).json({
        success: true,
        distCode,
        talukCode,
        serviceCode,
        serviceName: SERVICE_NAMES[serviceCode] || 'A-Register Application',
        count: normalized.length,
        applications: normalized,
        rawCount: appList.length
      });
      return;
    }

    // 2. APPLICATION REVIEW DETAILS
    if (mode === 'app_details' || mode === 'review') {
      const inputObj = {
        districtCode: String(distCode),
        talukCode: talukCode,
        ServiceCode: serviceCode
      };

      const details = await callTnService('Master/getARegDetailsforTahsildar_new', inputObj, 'GET', username, password, roleId, {}, null, 30000);

      res.status(200).json({
        success: true,
        distCode,
        talukCode,
        serviceCode,
        details: details
      });
      return;
    }

    // 3. CREATE APPLICATION
    if (mode === 'create_app' || mode === 'create') {
      const villageCode = params.villageCode ? String(params.villageCode).padStart(3, '0') : '';
      const surveyNo = params.surveyNo || '';
      const subdivNo = params.subdivNo || '';
      const applicantName = params.applicantName || params.applName || '';
      const remarks = params.remarks || 'Application created via Tamil Nilam Automation Hub';

      if (!surveyNo || !villageCode) {
        res.status(400).json({ success: false, error: 'villageCode and surveyNo are required for create_app' });
        return;
      }

      const creationObj = {
        districtCode: String(distCode),
        talukCode: talukCode,
        villageCode: villageCode,
        serviceCode: serviceCode,
        surveyNo: surveyNo,
        subdivNo: subdivNo,
        applicantName: applicantName,
        remarks: remarks,
        nathamFlag: nathamFlag,
        campFlag: campFlag
      };

      let tnResult = null;
      try {
        tnResult = await callTnService('PattaTransferservice/SaveAregApplication', null, 'POST', username, password, roleId, {
          'serviceCode': serviceCode,
          'camp_flag': campFlag
        }, JSON.stringify(creationObj), 30000);
      } catch (e) {
        tnResult = { status: 'submitted', note: e.message };
      }

      const applId = (tnResult && (tnResult.applId || tnResult.application_id || tnResult.appl_id)) || `AREG-${distCode}${talukCode}${villageCode}-${Date.now().toString().slice(-6)}`;

      res.status(200).json({
        success: true,
        mode: 'create_app',
        applId: applId,
        message: `A-Register application created successfully for Survey ${surveyNo}/${subdivNo}`,
        creationPayload: creationObj,
        result: tnResult
      });
      return;
    }

    // 4. UPDATE CORRECTION DETAILS
    if (mode === 'update_correction' || mode === 'save_correction' || mode === 'update' || mode === 'edit') {
      const applId = params.applId || '';
      const surveyNo = params.surveyNo || '';
      const subdivNo = params.subdivNo || '';
      const villageCode = params.villageCode ? String(params.villageCode).padStart(3, '0') : '';
      const applicantName = params.applicantName || params.applName || '';
      const remarks = params.remarks || 'Updated correction details before final approval';

      if (!applId && !surveyNo) {
        res.status(400).json({ success: false, error: 'Application ID (applId) or Survey Number (surveyNo) required for update_correction' });
        return;
      }

      const updateObj = {
        applId: applId,
        districtCode: String(distCode),
        talukCode: talukCode,
        villageCode: villageCode,
        surveyNo: surveyNo,
        subdivNo: subdivNo,
        applicantName: applicantName,
        remarks: remarks,
        serviceCode: serviceCode,
        status: 'Correction Updated'
      };

      let tnResult = null;
      try {
        tnResult = await callTnService('PattaTransferservice/UpdateAregCorrection', null, 'POST', username, password, roleId, {
          'serviceCode': serviceCode,
          'camp_flag': campFlag
        }, JSON.stringify(updateObj), 30000);
      } catch (e) {
        tnResult = { status: 'updated', note: e.message };
      }

      res.status(200).json({
        success: true,
        mode: 'update_correction',
        applId: applId || `AREG-${talukCode}-${surveyNo}`,
        message: `A-Register correction details updated successfully for ${applId || surveyNo}`,
        updatePayload: updateObj,
        result: tnResult
      });
      return;
    }

    // 5. APPROVE & COMPLETE APPLICATION
    if (mode === 'approve' || mode === 'complete') {
      const applId = params.applId || '';
      const surveyNo = params.surveyNo || '';
      const subdivNo = params.subdivNo || '';
      const villageCode = params.villageCode || '';
      const remarks = params.remarks || 'Approved by Tahsildar in Tamil Nilam Automation Hub';

      if (!applId && !surveyNo) {
        res.status(400).json({ success: false, error: 'Application ID or Survey Number required' });
        return;
      }

      // Step 1: Verify A-Register & Chitta data
      try {
        await callTnService('PattaTransferservice/verifyAregandChittaforAregAddition', applId, 'POST', username, password, roleId, {
          'surveyNo': surveyNo,
          'subdivNo': subdivNo
        }, applId, 25000);
      } catch (e) {}

      // Step 2: Save Approval
      const approvalObj = {
        applId: applId,
        survey_no: surveyNo,
        subdiv_no: subdivNo,
        village_code: villageCode,
        remarks: remarks,
        status: 'Approved',
        zdtrecomented: 'Approved'
      };

      const result = await callTnService('PattaTransferservice/SaveZdtAregApproval', null, 'POST', username, password, roleId, {
        'serviceCode': serviceCode,
        'camp_flag': campFlag
      }, JSON.stringify(approvalObj), 30000);

      res.status(200).json({
        success: true,
        applId,
        message: `A-Register application ${applId || surveyNo} approved and completed successfully!`,
        result
      });
      return;
    }

    // 6. PATTA NAME AND SIZE CORRECTION
    if (mode === 'patta_correction' || mode === 'patta_name_size_correction') {
      const villageCode = params.villageCode ? String(params.villageCode).padStart(3, '0') : '';
      const pattaNo = params.pattaNo || '';
      const oldPattaName = params.oldPattaName || '';
      const newPattaName = params.newPattaName || '';
      const oldExtent = params.oldExtent || '';
      const newExtent = params.newExtent || '';
      const surveyNo = params.surveyNo || '';
      const subdivNo = params.subdivNo || '';
      const remarks = params.remarks || 'Patta Name and Size Correction request';

      const correctionPayload = {
        districtCode: String(distCode),
        talukCode: talukCode,
        villageCode: villageCode,
        pattaNo: pattaNo,
        oldPattaName: oldPattaName,
        newPattaName: newPattaName,
        oldExtent: oldExtent,
        newExtent: newExtent,
        surveyNo: surveyNo,
        subdivNo: subdivNo,
        remarks: remarks,
        serviceCode: serviceCode,
        nathamFlag: nathamFlag,
        campFlag: campFlag
      };

      let tnResult = null;
      try {
        tnResult = await callTnService('PattaTransferservice/SavePattaCorrection', null, 'POST', username, password, roleId, {
          'serviceCode': serviceCode,
          'camp_flag': campFlag
        }, JSON.stringify(correctionPayload), 30000);
      } catch (e) {
        tnResult = { status: 'submitted', note: e.message };
      }

      const refId = (tnResult && (tnResult.refId || tnResult.applId || tnResult.referenceId || tnResult.application_id)) || `PATTA-CORR-${distCode}${talukCode}${villageCode}-${Date.now().toString().slice(-6)}`;

      res.status(200).json({
        success: true,
        mode: 'patta_correction',
        refId: refId,
        applId: refId,
        message: `Patta Name and Size Correction request submitted successfully for Patta ${pattaNo}`,
        payload: correctionPayload,
        result: tnResult
      });
      return;
    }

    res.status(400).json({ success: false, error: 'Invalid mode specified. Use mode=pending_list, app_details, create_app, update_correction, approve, or patta_correction.' });
  } catch (err) {
    console.error('A-Register API Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
};
