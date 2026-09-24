/* ============================================================
   Tamil Nilam NISD, ISD & F-Line Automation Controller
   (OPT Rural/Natham & F-Line/F-Line Appeal Rural/Natham)
   ============================================================ */
(function() {
  if (window.__tnAutoInitialized) return;
  window.__tnAutoInitialized = true;

  let currentReportData = null;
  let currentMode = 'details';

  const TN_DISTRICTS = [
    { code: "37", name: "Ranipet (37)" },
    { code: "04", name: "Vellore (04)" },
    { code: "36", name: "Tirupathur (36)" },
    { code: "03", name: "Kancheepuram (03)" },
    { code: "01", name: "Tiruvallur (01)" },
    { code: "35", name: "Chengalpattu (35)" },
    { code: "02", name: "Chennai (02)" },
    { code: "06", name: "Tiruvannamalai (06)" },
    { code: "07", name: "Viluppuram (07)" },
    { code: "33", name: "Kallakurichi (33)" },
    { code: "08", name: "Salem (08)" },
    { code: "10", name: "Erode (10)" },
    { code: "12", name: "Coimbatore (12)" },
    { code: "32", name: "Tiruppur (32)" },
    { code: "05", name: "Dharmapuri (05)" },
    { code: "31", name: "Krishnagiri (31)" },
    { code: "09", name: "Namakkal (09)" },
    { code: "14", name: "Karur (14)" },
    { code: "13", name: "Dindigul (13)" },
    { code: "15", name: "Tiruchirappalli (15)" },
    { code: "16", name: "Perambalur (16)" },
    { code: "17", name: "Ariyalur (17)" },
    { code: "18", name: "Cuddalore (18)" },
    { code: "19", name: "Nagapattinam (19)" },
    { code: "38", name: "Mayiladuthurai (38)" },
    { code: "20", name: "Thiruvarur (20)" },
    { code: "21", name: "Thanjavur (21)" },
    { code: "22", name: "Pudukkottai (22)" },
    { code: "23", name: "Sivagangai (23)" },
    { code: "24", name: "Madurai (24)" },
    { code: "25", name: "Theni (25)" },
    { code: "26", name: "Virudhunagar (26)" },
    { code: "27", name: "Ramanathapuram (27)" },
    { code: "34", name: "Tenkasi (34)" },
    { code: "28", name: "Thoothukkudi (28)" },
    { code: "29", name: "Tirunelveli (29)" },
    { code: "30", name: "Kanniyakumari (30)" },
    { code: "11", name: "The Nilgiris (11)" }
  ];

  const INITIAL_RANIPET_TALUKS = [
    { code: "12", name: "Nemili (12)" },
    { code: "03", name: "Arakkonam (03)" },
    { code: "02", name: "Arcot (02)" },
    { code: "13", name: "Kalavai (13)" },
    { code: "14", name: "Sholinghur (14)" },
    { code: "04", name: "Walajah (04)" }
  ];

  const NEMILI_VILLAGES = [
    { code: "", name: "-- ALL VILLAGES (Combined) --" },
    { code: "109", name: "Agavalam (109)" },
    { code: "108", name: "Alappakkam (108)" },
    { code: "115", name: "Attupakkam (115)" },
    { code: "110", name: "Banavaram (110)" },
    { code: "111", name: "Illuppaiyandandalam (111)" },
    { code: "121", name: "Asanellikuppam (121)" },
    { code: "123", name: "Kariakudal (123)" },
    { code: "124", name: "Keelvenkatapuram (124)" },
    { code: "122", name: "Nemili (122)" },
    { code: "125", name: "Sayanavaram (125)" },
    { code: "120", name: "S.Kulathur (120)" },
    { code: "112", name: "Thenmambakkam (112)" }
  ];

  const talukCache = new Map();
  const villageCache = new Map();

  talukCache.set("37", INITIAL_RANIPET_TALUKS);
  villageCache.set("37_12", NEMILI_VILLAGES);

  function getTnCreds(type = 'primary', talukName = null) {
    if (typeof window.getTnCreds === 'function') {
      return window.getTnCreds(type, talukName);
    }
    if (type === 'secondary' && Array.isArray(window.TALUK_CREDS) && window.TALUK_CREDS.length) {
      const target = talukName || (typeof window.TALUK !== 'undefined' ? window.TALUK : '') || 'Nemili';
      const found = window.TALUK_CREDS.find(c => (c.taluk || '').toLowerCase() === (target || '').toLowerCase());
      if (found && found.username) {
        return { username: found.username, password: found.password, roleId: found.role_id || '8' };
      }
    }
    try {
      const raw = localStorage.getItem('village_test.tnCreds.v2') || localStorage.getItem('village_test.tnCreds.v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (type === 'secondary') {
          if (parsed.secondary && parsed.secondary.username && parsed.secondary.password) {
            return parsed.secondary;
          }
          return { username: 'rpt_panneerselvam', password: 'Nemili@1970', roleId: '8' };
        }
        if (parsed.primary) return parsed.primary;
        return parsed;
      }
    } catch (e) {}
    if (type === 'secondary') {
      return { username: 'rpt_panneerselvam', password: 'Nemili@1970', roleId: '8' };
    }
    return { username: 'dlurpet', password: '16-03-1992', roleId: '7' };
  }

  function createModalHtml() {
    const distOptions = TN_DISTRICTS.map(d =>
      `<option value="${d.code}" ${d.code === '37' ? 'selected' : ''}>${d.name}</option>`
    ).join('');

    const talukOptions = INITIAL_RANIPET_TALUKS.map(t =>
      `<option value="${t.code}" ${t.code === '12' ? 'selected' : ''}>${t.name}</option>`
    ).join('');

    const villageOptions = NEMILI_VILLAGES.map(v =>
      `<option value="${v.code}">${v.name}</option>`
    ).join('');

    return `
      <div id="tnModalBackdrop" class="tn-modal-backdrop">
        <div class="tn-modal">
          <div class="tn-modal-header">
            <h2>
              <span>🏛️ Tamil Nilam Automation Center</span>
              <span class="tn-badge">OPT / F-Line</span>
            </h2>
            <button type="button" class="iconbtn" id="tnCloseModal" title="Close">&#10005;</button>
          </div>

          <div class="tn-modal-body">
            <div class="tn-filter-box">
              <div class="tn-filter-title">VILLAGE WISE APPLICATIONS PENDING REPORT</div>
              
              <div class="tn-form-grid">
                <div class="tn-field" style="grid-column: 1 / -1; background: var(--surface-2); padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line-2);">
                  <label style="font-weight: 700; color: var(--accent); margin-bottom: 6px;">SERVICE TO AUTOMATE</label>
                  <div class="tn-radio-group" style="gap: 20px;">
                    <label style="font-weight: 600;"><input type="radio" name="tnServiceGroup" id="tnSvcOpt" value="OPT" checked> 🏛️ OPT Applications (NISD / ISD)</label>
                    <label style="font-weight: 600;"><input type="radio" name="tnServiceGroup" id="tnSvcFline" value="FLINE"> 📐 F-Line / F-Line Appeal</label>
                    <label style="font-weight: 600;"><input type="radio" name="tnServiceGroup" id="tnSvcIsdPdf" value="ISD_PDF"> 📑 ISD Rural Status (PDF / drilldown)</label>
                  </div>
                </div>

                <div class="tn-field">
                  <label>Land Category</label>
                  <div class="tn-radio-group">
                    <label><input type="radio" name="tnLandCat" id="tnLandRural" value="rural" checked> Rural</label>
                    <label><input type="radio" name="tnLandCat" id="tnLandNatham" value="natham"> Natham</label>
                  </div>
                </div>

                <div class="tn-field" id="tnOptRow">
                  <label>Transaction Type</label>
                  <div class="tn-radio-group">
                    <label><input type="radio" name="tnOptType" id="tnRadioNisd" value="N" checked> NISD</label>
                    <label><input type="radio" name="tnOptType" id="tnRadioIsd" value="I"> ISD</label>
                  </div>
                </div>

                <div class="tn-field" id="tnFlineReportRow" style="display:none;">
                  <label>F-Line Type</label>
                  <div class="tn-radio-group">
                    <label><input type="radio" name="tnFlineReportType" id="tnFlineMain" value="FLINE" checked> F-Line</label>
                    <label><input type="radio" name="tnFlineReportType" id="tnFlineAppeal" value="APPEAL"> F-Line Appeal</label>
                  </div>
                </div>

                <div class="tn-field" id="tnFlineDateModeRow" style="display:none;">
                  <label>Date Status Mode</label>
                  <div class="tn-radio-group">
                    <label><input type="radio" name="tnStmtFlag" id="tnStmtCurr" value="Current" checked> Current Date</label>
                    <label><input type="radio" name="tnStmtFlag" id="tnStmtOpt" value="OPT"> Closing Date</label>
                  </div>
                </div>

                <div class="tn-field">
                  <label for="tnDistSel">District</label>
                  <select id="tnDistSel">
                    ${distOptions}
                  </select>
                </div>

                <div class="tn-field">
                  <label for="tnTalukSel">Taluk</label>
                  <select id="tnTalukSel">
                    ${talukOptions}
                  </select>
                </div>

                <div class="tn-field">
                  <label for="tnVillageSel">Village</label>
                  <select id="tnVillageSel">
                    ${villageOptions}
                  </select>
                </div>

                <div class="tn-field">
                  <label for="tnViewMode">Report Format</label>
                  <select id="tnViewMode">
                    <option value="details" selected>Detailed Applications (as in Image)</option>
                    <option value="summary">Village Summary</option>
                  </select>
                </div>

                <div class="tn-field">
                  <label for="tnFromDate">From Date</label>
                  <input type="text" id="tnFromDate" placeholder="DD-MM-YYYY or YYYY-MM-DD" value="01-09-2026">
                  <div class="tn-quick-dates" id="tnQuickDatesContainer">
                    <button type="button" class="tn-quick-btn" data-range="12">12 Days</button>
                    <button type="button" class="tn-quick-btn" data-range="10">10 Days</button>
                    <button type="button" class="tn-quick-btn" data-range="below10">&lt;10 Days</button>
                  </div>
                </div>

                <div class="tn-field">
                  <label for="tnToDate">To Date</label>
                  <input type="text" id="tnToDate" placeholder="DD-MM-YYYY or YYYY-MM-DD" value="10-09-2026">
                </div>
              </div>

              <div class="tn-btn-bar">
                <button type="button" class="tn-btn-submit" id="tnBtnSubmit">Submit</button>
                <button type="button" class="tn-quick-btn" id="tnDirectIsdPdfBtn" style="background:#2563eb; color:#fff; font-weight:700; padding:8px 14px; border-radius:7px; cursor:pointer;" title="Direct 1-click pull of current month ISD Rural status PDF">⚡ 1-Click Pull ISD PDF</button>
                <button type="button" class="tn-quick-btn" id="tnAutoDownloadIsdPdfBtn" style="background:#16a34a; color:#fff; font-weight:700; padding:8px 14px; border-radius:7px; cursor:pointer;" title="Download ISD Rural status PDF for current month">⬇ Download ISD PDF</button>
                <button type="button" class="tn-btn-excel" id="tnBtnExcel" style="display:none">ExportToExcel</button>
                <div id="tnApplyWrap" style="display:none; align-items:center; gap:10px;">
                  <span id="tnBucketSummary" class="tn-bucket-tag" style="display:none;"></span>
                  <button type="button" class="tn-btn-apply" id="tnBtnApply">⚡ Auto-Load All into Dashboard</button>
                </div>
              </div>
            </div>

            <div id="tnStatusBanner" class="tn-status-banner"></div>

            <div id="tnReportArea" style="display:none">
              <div class="tn-table-wrap" id="tnTableWrap"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function getCurrentMonthRange() {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return {
      fromDate: `01-${month}-${year}`,
      toDate: `${day}-${month}-${year}`
    };
  }

  function createFlashFillModalHtml() {
    const curMonthRange = getCurrentMonthRange();
    const toDateStr = curMonthRange.toDate;

    return `
      <div id="tnFFModalBackdrop" class="tn-ff-modal-backdrop">
        <div class="tn-ff-modal">
          <div class="tn-ff-header">
            <h3>⚡ Flash Fill Control Center — Multi-Report Auto Pull</h3>
            <button type="button" class="tn-ff-close" id="tnFFCloseModal" title="Close">&times;</button>
          </div>
          <div class="tn-ff-body">
            <div class="tn-ff-bar">
              <div style="display:flex; align-items:center; gap:10px;">
                <label style="font-size:12px; font-weight:700; color:var(--ink-2);">Target Taluk:</label>
                <select id="tnFFTalukSel" class="tn-ff-select" style="font-weight:700; font-size:12.5px;">
                  <option value="12" selected>Nemili (12)</option>
                  <option value="03">Arakkonam (03)</option>
                  <option value="02">Arcot (02)</option>
                  <option value="13">Kalavai (13)</option>
                  <option value="14">Sholinghur (14)</option>
                  <option value="04">Walajah (04)</option>
                </select>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <button type="button" class="tn-quick-btn" id="tnFFSetCurrentMonth">Set Current Month</button>
                <button type="button" class="tn-quick-btn" id="tnFFSetAllFrom">Set All From (01-01-2025)</button>
                <button type="button" class="tn-quick-btn" id="tnFFSetAllTo">Set All To (Today)</button>
                <button type="button" class="tn-quick-btn" id="tnFFToggleAll">Toggle All</button>
              </div>
            </div>

            <div style="font-size:11.5px; color:var(--muted); margin-bottom:12px; display:flex; align-items:center; gap:6px;">
              <span>🔒 <b>Strict Taluk Filter Active:</b> All data fetched will be strictly matched &amp; scoped to the selected Taluk only. Other taluk applications will be filtered out.</span>
            </div>

            <table class="tn-ff-table">
              <thead>
                <tr>
                  <th style="width:40px; text-align:center;">Pull</th>
                  <th>Report Name &amp; Service</th>
                  <th>Land Category</th>
                  <th>Type &amp; Options</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr data-ff-group="isd_pdf">
                  <td style="text-align:center;"><input type="checkbox" id="ff_chk_isd_rural_pdf" checked></td>
                  <td>
                    <b>ISD Rural — Application Status (PDF)</b><br><small style="color:var(--muted)">drilldowntasildar.html (Tahsildar ID 2)</small>
                    <button type="button" class="tn-quick-btn" id="ff_row_download_isd_pdf_btn" style="margin-top:4px; padding:3px 9px; font-size:11px; background:#16a34a; color:#fff; border:1px solid #15803d; border-radius:5px; cursor:pointer; font-weight:700;" title="Download current month ISD Rural status PDF in official format">⬇ Download PDF</button>
                  </td>
                  <td><span class="tn-badge-role">Rural</span></td>
                  <td>Application Status PDF</td>
                  <td><input type="text" id="ff_from_isd_rural_pdf" class="tn-ff-date-input" value="${curMonthRange.fromDate}"></td>
                  <td><input type="text" id="ff_to_isd_rural_pdf" class="tn-ff-date-input" value="${curMonthRange.toDate}"></td>
                  <td><span id="ff_status_isd_rural_pdf" class="tn-ff-status-badge">Ready</span></td>
                </tr>
                <tr data-ff-group="nisd">
                  <td style="text-align:center;"><input type="checkbox" id="ff_chk_nisd_rural" checked></td>
                  <td><b>NISD Rural</b><br><small style="color:var(--muted)">VAO Pending (12d / 10d / &lt;10d)</small></td>
                  <td><span class="tn-badge-role">Rural</span></td>
                  <td>NISD (VAO Only)</td>
                  <td><input type="text" id="ff_from_nisd_rural" class="tn-ff-date-input" value="01-01-2025"></td>
                  <td><input type="text" id="ff_to_nisd_rural" class="tn-ff-date-input" value="${toDateStr}"></td>
                  <td><span id="ff_status_nisd_rural" class="tn-ff-status-badge">Ready</span></td>
                </tr>
                <tr data-ff-group="isd">
                  <td style="text-align:center;"><input type="checkbox" id="ff_chk_isd_rural" checked></td>
                  <td><b>ISD Rural (OPT)</b><br><small style="color:var(--muted)">Surveyor &amp; VAO Pending (3 Buckets)</small></td>
                  <td><span class="tn-badge-role">Rural</span></td>
                  <td>ISD (Surveyor &amp; VAO)</td>
                  <td><input type="text" id="ff_from_isd_rural" class="tn-ff-date-input" value="01-01-2025"></td>
                  <td><input type="text" id="ff_to_isd_rural" class="tn-ff-date-input" value="${toDateStr}"></td>
                  <td><span id="ff_status_isd_rural" class="tn-ff-status-badge">Ready</span></td>
                </tr>
                <tr data-ff-group="nisd">
                  <td style="text-align:center;"><input type="checkbox" id="ff_chk_nisd_natham" checked></td>
                  <td><b>NISD Natham</b><br><small style="color:var(--muted)">VAO Pending (12d / 10d / &lt;10d)</small></td>
                  <td><span class="tn-badge-role vao">Natham</span></td>
                  <td>NISD (VAO Only)</td>
                  <td><input type="text" id="ff_from_nisd_natham" class="tn-ff-date-input" value="01-01-2025"></td>
                  <td><input type="text" id="ff_to_nisd_natham" class="tn-ff-date-input" value="${toDateStr}"></td>
                  <td><span id="ff_status_nisd_natham" class="tn-ff-status-badge">Ready</span></td>
                </tr>
                <tr data-ff-group="isd">
                  <td style="text-align:center;"><input type="checkbox" id="ff_chk_isd_natham" checked></td>
                  <td><b>ISD Natham</b><br><small style="color:var(--muted)">Surveyor &amp; VAO Pending</small></td>
                  <td><span class="tn-badge-role vao">Natham</span></td>
                  <td>ISD (Surveyor &amp; VAO)</td>
                  <td><input type="text" id="ff_from_isd_natham" class="tn-ff-date-input" value="01-01-2025"></td>
                  <td><input type="text" id="ff_to_isd_natham" class="tn-ff-date-input" value="${toDateStr}"></td>
                  <td><span id="ff_status_isd_natham" class="tn-ff-status-badge">Ready</span></td>
                </tr>
                <tr data-ff-group="fline">
                  <td style="text-align:center;"><input type="checkbox" id="ff_chk_fline_rural" checked></td>
                  <td><b>F-Line Rural</b><br><small style="color:var(--muted)">Field Line Demarcation</small></td>
                  <td><span class="tn-badge-role">Rural</span></td>
                  <td>
                    <select id="ff_type_fline_rural" class="tn-ff-select">
                      <option value="FLINE" selected>F-Line</option>
                      <option value="APPEAL">F-Line Appeal</option>
                    </select>
                    <select id="ff_stmt_fline_rural" class="tn-ff-select" style="margin-left:4px;">
                      <option value="Current" selected>Current Date</option>
                      <option value="OPT">Closing Date</option>
                    </select>
                  </td>
                  <td><input type="text" id="ff_from_fline_rural" class="tn-ff-date-input" value="01-01-2025"></td>
                  <td><input type="text" id="ff_to_fline_rural" class="tn-ff-date-input" value="${toDateStr}"></td>
                  <td><span id="ff_status_fline_rural" class="tn-ff-status-badge">Ready</span></td>
                </tr>
                <tr data-ff-group="fline">
                  <td style="text-align:center;"><input type="checkbox" id="ff_chk_fline_natham" checked></td>
                  <td><b>F-Line Natham</b><br><small style="color:var(--muted)">Field Line Natham</small></td>
                  <td><span class="tn-badge-role vao">Natham</span></td>
                  <td>
                    <select id="ff_type_fline_natham" class="tn-ff-select">
                      <option value="FLINE" selected>F-Line</option>
                      <option value="APPEAL">F-Line Appeal</option>
                    </select>
                    <select id="ff_stmt_fline_natham" class="tn-ff-select" style="margin-left:4px;">
                      <option value="Current" selected>Current Date</option>
                      <option value="OPT">Closing Date</option>
                    </select>
                  </td>
                  <td><input type="text" id="ff_from_fline_natham" class="tn-ff-date-input" value="01-01-2025"></td>
                  <td><input type="text" id="ff_to_fline_natham" class="tn-ff-date-input" value="${toDateStr}"></td>
                  <td><span id="ff_status_fline_natham" class="tn-ff-status-badge">Ready</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="tn-ff-footer">
            <span id="tnFFSummaryText" style="font-size:12px; font-weight:600; color:var(--muted);">Select reports &amp; date ranges to pull from Tamil Nilam</span>
            <div style="display:flex; align-items:center; gap:10px;">
              <button type="button" id="tnFFDownloadIsdPdfBtn" title="Download Approved &amp; Rejected PDF for ISD Rural in official format (current month)" style="background:#16a34a; color:#fff; font-weight:700; border:1.5px solid #15803d; padding:8px 16px; border-radius:7px; font-size:13px; cursor:pointer;">⬇ Download ISD Rural PDF</button>
              <button type="button" class="tn-auto-btn flash-fill-btn" id="tnFFRunBtn" style="padding:10px 24px; font-size:14px; font-weight:700;">⚡ Run Flash Fill (Selected Reports)</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function injectUI() {
    if (!document.getElementById('tnModalBackdrop')) {
      document.body.insertAdjacentHTML('beforeend', createModalHtml());
    }
    if (!document.getElementById('tnFFModalBackdrop')) {
      document.body.insertAdjacentHTML('beforeend', createFlashFillModalHtml());
    }

    const uploadsGrid = document.querySelector('.uploads');
    if (uploadsGrid && !document.getElementById('tnAutoTriggerBtn')) {
      const btnHtml = `
        <div style="grid-column: 1 / -1; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; background: var(--surface-2); padding: 10px 14px; border-radius: 99px; border: 1px solid var(--line-2);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">⚡</span>
            <div>
              <b style="font-size: 13px;">Automate NISD / ISD / F-Line Data (Rural & Natham)</b>
              <span style="font-size: 11.5px; color: var(--muted); margin-left: 6px;">Pull directly from Tamil Nilam portal with automatic Supabase Cloud replacement</span>
            </div>
          </div>
          <button type="button" class="tn-auto-btn" id="tnAutoTriggerBtn">⚡ Auto-Pull from Tamil Nilam</button>
        </div>
      `;
      uploadsGrid.insertAdjacentHTML('beforebegin', btnHtml);
    }

    const nisdActions = document.getElementById('nisdActions');
    if (nisdActions && !document.getElementById('tnNisdCardBtn')) {
      const nisdBtn = document.createElement('button');
      nisdBtn.type = 'button';
      nisdBtn.className = 'tn-auto-btn';
      nisdBtn.id = 'tnNisdCardBtn';
      nisdBtn.style.marginRight = '8px';
      nisdBtn.innerHTML = '⚡ Auto-Pull from Tamil Nilam';
      nisdActions.prepend(nisdBtn);
    }

    const talukLabel = document.querySelector('.topbar .inner .taluksel');
    if (talukLabel && !document.getElementById('tnFlashFillBtn')) {
      const flashBtnHtml = `<button type="button" class="tn-auto-btn flash-fill-btn" id="tnFlashFillBtn" title="Open Flash Fill Control Center for Selected Taluk" style="margin-left:8px; margin-right:4px;">⚡ 1-Click Flash Fill All</button>`;
      talukLabel.insertAdjacentHTML('afterend', flashBtnHtml);
    }

    const aregMenuBtn = document.getElementById('aregMenuBtn');
    const isAdmin = (typeof window.CLOUD_ON === 'undefined' || !window.CLOUD_ON) || (window.ME && window.ME.role === 'admin');
    if (aregMenuBtn) {
      aregMenuBtn.style.display = isAdmin ? 'inline-block' : 'none';
    }
    document.querySelectorAll('[data-tab="areg"]').forEach(btn => {
      btn.style.display = isAdmin ? 'inline-block' : 'none';
    });

    if (aregMenuBtn && !aregMenuBtn.__aregBound) {
      aregMenuBtn.__aregBound = true;
      aregMenuBtn.addEventListener('click', () => {
        const isAdmin = (typeof window.CLOUD_ON === 'undefined' || !window.CLOUD_ON) || (window.ME && window.ME.role === 'admin');
        if (!isAdmin) {
          if (typeof window.toast === 'function') {
            window.toast('Access restricted', 'Access restricted: Only Admin accounts can access A-Register Approval Hub.', 'warn');
          }
          return;
        }
        const currentTaluk = (typeof window.TALUK !== 'undefined' && window.TALUK) ? window.TALUK : 'Nemili';
        if (typeof window.openAregApprovalModal === 'function') {
          window.openAregApprovalModal(currentTaluk, '0109');
        }
      });
    }

    document.querySelectorAll('[data-tab="areg"]').forEach(btn => {
      if (!btn.__aregBound) {
        btn.__aregBound = true;
        btn.addEventListener('click', () => {
          const isAdmin = (typeof window.CLOUD_ON === 'undefined' || !window.CLOUD_ON) || (window.ME && window.ME.role === 'admin');
          if (!isAdmin) {
            if (typeof window.toast === 'function') {
              window.toast('Access restricted', 'Access restricted: Only Admin accounts can access A-Register Approval Hub.', 'warn');
            }
            return;
          }
          if (typeof window.closeUsersPanel === 'function') {
            window.closeUsersPanel();
          } else {
            const panel = document.getElementById('usersPanel');
            if (panel) panel.hidden = true;
          }
          const currentTaluk = (typeof window.TALUK !== 'undefined' && window.TALUK) ? window.TALUK : 'Nemili';
          if (typeof window.openAregApprovalModal === 'function') {
            window.openAregApprovalModal(currentTaluk, '0109');
          }
        });
      }
    });

    const pattaMenuBtn = document.getElementById('pattaMenuBtn');
    if (pattaMenuBtn) {
      const canPatta = isAdmin || (typeof window.hasMenu === 'function' && window.hasMenu('patta'));
      pattaMenuBtn.style.display = canPatta ? 'inline-block' : 'none';
    }
    document.querySelectorAll('[data-tab="patta"]').forEach(btn => {
      const canPatta = isAdmin || (typeof window.hasMenu === 'function' && window.hasMenu('patta'));
      btn.style.display = canPatta ? 'inline-block' : 'none';
    });

    if (pattaMenuBtn && !pattaMenuBtn.__pattaBound) {
      pattaMenuBtn.__pattaBound = true;
      pattaMenuBtn.addEventListener('click', () => {
        const canPatta = isAdmin || (typeof window.hasMenu === 'function' && window.hasMenu('patta'));
        if (!canPatta) {
          if (typeof window.toast === 'function') {
            window.toast('Access restricted', 'Access restricted: You do not have Patta Name & Size Correction access.', 'warn');
          }
          return;
        }
        window.ADMIN_TAB = 'patta';
        if (typeof window.openUsersPanel === 'function') {
          window.openUsersPanel();
        }
      });
    }

    const pattaNoInp = document.getElementById('pattaNoInput');
    if (pattaNoInp && !pattaNoInp.__pattaBound) {
      pattaNoInp.__pattaBound = true;
      pattaNoInp.addEventListener('blur', fetchLivePattaInfo);
      pattaNoInp.addEventListener('change', fetchLivePattaInfo);
    }
    const fetchLiveBtn = document.getElementById('pattaFetchLiveBtn');
    if (fetchLiveBtn && !fetchLiveBtn.__pattaBound) {
      fetchLiveBtn.__pattaBound = true;
      fetchLiveBtn.addEventListener('click', fetchLivePattaInfo);
    }

    bindEvents();
  }

  let _isFetchingPatta = false;
  async function fetchLivePattaInfo() {
    const pattaInp = document.getElementById('pattaNoInput');
    const pattaNo = pattaInp ? pattaInp.value.trim() : '';
    if (!pattaNo || _isFetchingPatta) return;

    const talukSel = document.getElementById('pattaTalukSel');
    const villageSel = document.getElementById('pattaVillageSel');
    const talukCode = talukSel ? talukSel.value : '12';
    const villageCode = villageSel ? villageSel.value : '122';

    _isFetchingPatta = true;

    const banner = document.getElementById('pattaStatusBanner');
    if (banner) {
      banner.className = 'tn-status-banner info';
      banner.style.background = 'rgba(37, 99, 235, 0.15)';
      banner.style.color = '#2563eb';
      banner.style.display = 'block';
      banner.textContent = `⏳ Fetching Live Patta details from Tamil Nilam for Patta ${pattaNo}...`;
    }

    try {
      const url = `/api/areg?mode=fetch_patta&distCode=37&talukCode=${encodeURIComponent(talukCode)}&villageCode=${encodeURIComponent(villageCode)}&pattaNo=${encodeURIComponent(pattaNo)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        if (data.ownerName) {
          const oldNameInp = document.getElementById('pattaOldNameInput');
          if (oldNameInp) oldNameInp.value = data.ownerName;
        }
        if (data.totalExtent) {
          const oldExtentInp = document.getElementById('pattaOldExtentInput');
          if (oldExtentInp) oldExtentInp.value = data.totalExtent;
        }
        if (data.surveyNo) {
          const surveyInp = document.getElementById('pattaSurveyNoInput');
          if (surveyInp) surveyInp.value = data.surveyNo;
        }
        if (data.subdivNo) {
          const subdivInp = document.getElementById('pattaSubdivNoInput');
          if (subdivInp) subdivInp.value = data.subdivNo;
        }

        if (banner) {
          banner.style.background = 'rgba(34, 197, 94, 0.15)';
          banner.style.color = '#16a34a';
          banner.textContent = '✓ Live Patta details fetched from Tamil Nilam portal!';
        }
        if (typeof window.toast === 'function') {
          window.toast('Live Patta Fetched', '✓ Live Patta details fetched from Tamil Nilam portal!', 'ok');
        }
      } else {
        if (banner) {
          banner.style.background = 'rgba(239, 68, 68, 0.15)';
          banner.style.color = '#dc2626';
          banner.textContent = `Could not fetch Patta details: ${data.error || 'Unknown error'}`;
        }
      }
    } catch (err) {
      console.error('Fetch live patta error:', err);
      if (banner) {
        banner.style.background = 'rgba(239, 68, 68, 0.15)';
        banner.style.color = '#dc2626';
        banner.textContent = `Fetch error: ${err.message}`;
      }
    } finally {
      _isFetchingPatta = false;
    }
  }
  window.fetchLivePattaInfo = fetchLivePattaInfo;

  let _openFFModal = null; // module-scoped reference for handleFlashFillAll

  function resolveTalukName(val) {
    if (!val) return '';
    const raw = String(val).trim().toLowerCase();
    const clean = raw.replace(/[^a-z0-9]/g, '');
    const codeMap = {
      '12': 'nemili',
      '03': 'arakkonam', '3': 'arakkonam', '01': 'arakkonam',
      '02': 'arcot', '2': 'arcot',
      '13': 'kalavai',
      '14': 'sholinghur',
      '04': 'walajah', '4': 'walajah', '05': 'walajah', '5': 'walajah'
    };
    if (codeMap[clean]) return codeMap[clean];
    const alphaOnly = raw.replace(/[^a-z]/g, '');
    if (alphaOnly.length >= 3) return alphaOnly;
    return clean;
  }

  function cleanTalukTitle(val) {
    if (!val) return 'Nemili';
    const raw = String(val).replace(/\(\d+\)/g, '').trim();
    const c = resolveTalukName(raw);
    const titles = {
      'nemili': 'Nemili',
      'arakkonam': 'Arakkonam',
      'arcot': 'Arcot',
      'kalavai': 'Kalavai',
      'sholinghur': 'Sholinghur',
      'walajah': 'Walajah'
    };
    return titles[c] || raw || 'Nemili';
  }

  function resolveTalukCode(val) {
    if (!val) return '12';
    const clean = String(val).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (/^\d+$/.test(clean)) {
      if (clean === '3' || clean === '03' || clean === '1' || clean === '01') return '03';
      if (clean === '2' || clean === '02') return '02';
      if (clean === '4' || clean === '04' || clean === '5' || clean === '05') return '04';
      if (clean === '12') return '12';
      if (clean === '13') return '13';
      if (clean === '14') return '14';
      return clean.padStart(2, '0');
    }
    if (clean.includes('nemili')) return '12';
    if (clean.includes('arakkonam')) return '03';
    if (clean.includes('arcot')) return '02';
    if (clean.includes('kalavai')) return '13';
    if (clean.includes('sholinghur')) return '14';
    if (clean.includes('walajah') || clean.includes('ranipet')) return '04';
    return '12';
  }
  window.resolveTalukCode = resolveTalukCode;
  window.cleanTalukTitle = cleanTalukTitle;

  function canonicalSurveyorName(name) {
    if (!name) return '';
    let s = String(name).replace(/\s*\([^)]*\)/g, '').trim();
    const normS = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normS.includes('yuvaraj')) {
      if (normS.includes('c') || normS.startsWith('c')) return 'C.Yuvaraj';
      if (normS.includes('m') || normS.startsWith('m')) return 'M.Yuvaraj';
    }
    return s;
  }
  window.canonicalSurveyorName = canonicalSurveyorName;

  function setSelectByTaluk(sel, targetVal) {
    if (!sel || !sel.options || !targetVal) return false;
    const targetRaw = String(targetVal).trim();
    if (!targetRaw || targetRaw.includes('choose a taluk') || targetRaw.includes('All taluks')) return false;
    const targetNorm = targetRaw.toLowerCase().replace(/[^a-z0-9]/g, '');
    const targetName = resolveTalukName(targetRaw);

    // Pass 1: exact value match
    for (let i = 0; i < sel.options.length; i++) {
      const opt = sel.options[i];
      if (opt.value && opt.value.toLowerCase() === targetRaw.toLowerCase()) {
        sel.selectedIndex = i;
        sel.value = opt.value;
        return true;
      }
    }

    // Pass 2: code or name match via resolveTalukName
    for (let i = 0; i < sel.options.length; i++) {
      const opt = sel.options[i];
      const optValNorm = String(opt.value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const optTextNorm = String(opt.text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const optName = resolveTalukName(opt.text || opt.value);

      if (optValNorm === targetNorm) {
        sel.selectedIndex = i;
        sel.value = opt.value;
        return true;
      }
      if (targetName && optName && targetName === optName) {
        sel.selectedIndex = i;
        sel.value = opt.value;
        return true;
      }
      if (targetName && (optTextNorm.includes(targetName) || optValNorm.includes(targetName))) {
        sel.selectedIndex = i;
        sel.value = opt.value;
        return true;
      }
      if (optName && targetNorm.includes(optName)) {
        sel.selectedIndex = i;
        sel.value = opt.value;
        return true;
      }
    }
    return false;
  }

  function bindEvents() {
    const backdrop = document.getElementById('tnModalBackdrop');
    const closeBtn = document.getElementById('tnCloseModal');
    const triggerBtn = document.getElementById('tnAutoTriggerBtn');
    const nisdCardBtn = document.getElementById('tnNisdCardBtn');
    const flashFillBtn = document.getElementById('tnFlashFillBtn');
    const submitBtn = document.getElementById('tnBtnSubmit');
    const excelBtn = document.getElementById('tnBtnExcel');
    const applyBtn = document.getElementById('tnBtnApply');

    const ffBackdrop = document.getElementById('tnFFModalBackdrop');
    const ffCloseBtn = document.getElementById('tnFFCloseModal');
    const ffRunBtn = document.getElementById('tnFFRunBtn');
    const ffSetAllFromBtn = document.getElementById('tnFFSetAllFrom');
    const ffSetAllToBtn = document.getElementById('tnFFSetAllTo');
    const ffToggleAllBtn = document.getElementById('tnFFToggleAll');
    const ffTalukSel = document.getElementById('tnFFTalukSel');
    const distSel = document.getElementById('tnDistSel');
    const talukSel = document.getElementById('tnTalukSel');
    const headerTalukSel = document.getElementById('talukSel');

    function applyReportAccessFilter() {
      const canIsd = typeof window.hasMenu === 'function' ? window.hasMenu('isd') : true;
      const canNisd = typeof window.hasMenu === 'function' ? window.hasMenu('nisd') : true;
      const canFline = typeof window.hasMenu === 'function' ? window.hasMenu('fline') : true;

      const nisdRows = document.querySelectorAll('tr[data-ff-group="nisd"]');
      const isdRows = document.querySelectorAll('tr[data-ff-group="isd"], tr[data-ff-group="isd_pdf"]');
      const flineRows = document.querySelectorAll('tr[data-ff-group="fline"]');

      nisdRows.forEach(r => {
        r.style.display = canNisd ? '' : 'none';
        const c = r.querySelector('input[type="checkbox"]');
        if (c) c.checked = canNisd;
      });
      isdRows.forEach(r => {
        r.style.display = canIsd ? '' : 'none';
        const c = r.querySelector('input[type="checkbox"]');
        if (c) c.checked = canIsd;
      });
      flineRows.forEach(r => {
        r.style.display = canFline ? '' : 'none';
        const c = r.querySelector('input[type="checkbox"]');
        if (c) c.checked = canFline;
      });

      const isdRadio = document.getElementById('tnRadioIsd');
      const nisdRadio = document.getElementById('tnRadioNisd');
      const svcFlineRadio = document.getElementById('tnSvcFline');
      const svcOptRadio = document.getElementById('tnSvcOpt');
      const svcIsdPdfRadio = document.getElementById('tnSvcIsdPdf');

      if (isdRadio) {
        isdRadio.disabled = !canIsd;
        if (isdRadio.parentElement) isdRadio.parentElement.style.display = canIsd ? '' : 'none';
      }
      if (nisdRadio) {
        nisdRadio.disabled = !canNisd;
        if (nisdRadio.parentElement) nisdRadio.parentElement.style.display = canNisd ? '' : 'none';
      }
      if (svcFlineRadio) {
        svcFlineRadio.disabled = !canFline;
        if (svcFlineRadio.parentElement) svcFlineRadio.parentElement.style.display = canFline ? '' : 'none';
      }
      if (svcIsdPdfRadio) {
        svcIsdPdfRadio.disabled = !canIsd;
        if (svcIsdPdfRadio.parentElement) svcIsdPdfRadio.parentElement.style.display = canIsd ? '' : 'none';
      }
      if (svcOptRadio) {
        const canOpt = canIsd || canNisd;
        svcOptRadio.disabled = !canOpt;
        if (svcOptRadio.parentElement) svcOptRadio.parentElement.style.display = canOpt ? '' : 'none';
      }

      // Ensure a valid service radio is checked
      const checkedSvc = document.querySelector('input[name="tnServiceGroup"]:checked');
      if (!checkedSvc || (checkedSvc.value === 'FLINE' && !canFline) || (checkedSvc.value === 'ISD_PDF' && !canIsd) || (checkedSvc.value === 'OPT' && !canIsd && !canNisd)) {
        if (canIsd && svcIsdPdfRadio) { svcIsdPdfRadio.checked = true; svcIsdPdfRadio.dispatchEvent(new Event('change')); }
        else if (canNisd && svcOptRadio) { svcOptRadio.checked = true; if (nisdRadio) nisdRadio.checked = true; svcOptRadio.dispatchEvent(new Event('change')); }
        else if (canFline && svcFlineRadio) { svcFlineRadio.checked = true; svcFlineRadio.dispatchEvent(new Event('change')); }
      }
    }
    window.__applyReportAccessFilter = applyReportAccessFilter;

    function openModal() {
      applyReportAccessFilter();
      const topTalukSel = document.getElementById('talukSel');
      const mine = (typeof window.myTaluks === 'function') ? window.myTaluks() : null;
      let activeTaluk = topTalukSel?.value || (mine && mine[0]) || localStorage.getItem('village_test.selectedTaluk.v1') || 'Nemili';
      if (mine && mine.length && typeof window.mayUseTaluk === 'function' && !window.mayUseTaluk(activeTaluk)) {
        activeTaluk = mine[0];
      }
      if (talukSel) setSelectByTaluk(talukSel, activeTaluk);
      if (backdrop) backdrop.classList.add('open');
    }
    function closeModal() {
      if (backdrop) backdrop.classList.remove('open');
    }

    function openFFModal() {
      if (ffBackdrop) {
        const topTalukSel = document.getElementById('talukSel') || document.getElementById('tnTalukSel');
        const mine = (typeof window.myTaluks === 'function') ? window.myTaluks() : null;
        let activeTaluk = topTalukSel ? (topTalukSel.options[topTalukSel.selectedIndex]?.text || topTalukSel.value) : 'Nemili';
        if (mine && mine.length && typeof window.mayUseTaluk === 'function' && !window.mayUseTaluk(activeTaluk)) {
          activeTaluk = mine[0];
        }
        if (ffTalukSel) {
          if (mine && mine.length) {
            Array.from(ffTalukSel.options).forEach(opt => {
              const cleanName = (opt.text || '').replace(/\s*\(\d+\)\s*$/, '').trim();
              const allowed = mine.some(m => cleanName.toLowerCase() === m.toLowerCase() || opt.value === m);
              opt.hidden = !allowed;
              opt.disabled = !allowed;
            });
          }
          setSelectByTaluk(ffTalukSel, activeTaluk);
        }
        // Ensure checkboxes default based on report permissions
        document.querySelectorAll('input[type="checkbox"][id^="ff_chk_"]').forEach(c => c.checked = true);
        applyReportAccessFilter();
        // Reset all status badges to Ready
        document.querySelectorAll('.tn-ff-status-badge').forEach(b => { b.textContent = 'Ready'; b.className = 'tn-ff-status-badge'; });
        // Ensure button is ready for confirmation click
        const btn = document.getElementById('tnFFRunBtn');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '⚡ Pull Selected Reports (Confirm)';
        }
        ffBackdrop.classList.add('open');
      }
    }
    function closeFFModal() {
      if (ffBackdrop) ffBackdrop.classList.remove('open');
    }

    // Expose openFFModal to module scope for handleFlashFillAll
    _openFFModal = openFFModal;

    // --- Modal open/close listeners ---
    if (triggerBtn) triggerBtn.addEventListener('click', openModal);
    if (nisdCardBtn) nisdCardBtn.addEventListener('click', openModal);
    if (flashFillBtn) flashFillBtn.addEventListener('click', openFFModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (ffCloseBtn) ffCloseBtn.addEventListener('click', closeFFModal);

    if (backdrop) backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
    if (ffBackdrop) ffBackdrop.addEventListener('click', e => { if (e.target === ffBackdrop) closeFFModal(); });

    // --- Flash Fill modal action buttons ---
    const ffSetCurrentMonthBtn = document.getElementById('tnFFSetCurrentMonth');
    if (ffSetCurrentMonthBtn) {
      ffSetCurrentMonthBtn.addEventListener('click', () => {
        const cur = getCurrentMonthRange();
        document.querySelectorAll('.tn-ff-date-input[id^="ff_from_"]').forEach(i => i.value = cur.fromDate);
        document.querySelectorAll('.tn-ff-date-input[id^="ff_to_"]').forEach(i => i.value = cur.toDate);
      });
    }
    if (ffSetAllFromBtn) {
      ffSetAllFromBtn.addEventListener('click', () => {
        document.querySelectorAll('.tn-ff-date-input[id^="ff_from_"]').forEach(i => i.value = '01-01-2025');
      });
    }
    if (ffSetAllToBtn) {
      ffSetAllToBtn.addEventListener('click', () => {
        const todayStr = String(new Date().getDate()).padStart(2, '0') + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + new Date().getFullYear();
        document.querySelectorAll('.tn-ff-date-input[id^="ff_to_"]').forEach(i => i.value = todayStr);
      });
    }
    if (ffToggleAllBtn) {
      ffToggleAllBtn.addEventListener('click', () => {
        const chks = document.querySelectorAll('input[type="checkbox"][id^="ff_chk_"]');
        const anyUnchecked = Array.from(chks).some(c => !c.checked);
        chks.forEach(c => c.checked = anyUnchecked);
      });
    }

    if (ffRunBtn) ffRunBtn.addEventListener('click', handleFlashFillExecute);

    // Download ISD Rural Status PDF buttons (Auto-Pull modal & Flash Fill modal)
    const handleDownloadIsdPdf = () => {
      if (typeof window.downloadIsdRuralStatusPdf === 'function') {
        window.downloadIsdRuralStatusPdf();
      } else {
        if (typeof window.toast === 'function') {
          window.toast('PDF download not ready', 'Download function is still initializing. Please try again.', 'warn');
        }
      }
    };

    const autoDownloadBtn = document.getElementById('tnAutoDownloadIsdPdfBtn');
    if (autoDownloadBtn) autoDownloadBtn.addEventListener('click', handleDownloadIsdPdf);

    const ffRowDownloadBtn = document.getElementById('ff_row_download_isd_pdf_btn');
    if (ffRowDownloadBtn) ffRowDownloadBtn.addEventListener('click', handleDownloadIsdPdf);

    const ffFooterDownloadBtn = document.getElementById('tnFFDownloadIsdPdfBtn');
    if (ffFooterDownloadBtn) ffFooterDownloadBtn.addEventListener('click', handleDownloadIsdPdf);

    // 3-Way Taluk Synchronization
    let isSyncingTaluk = false;

    function syncTalukSelection(sourceElement) {
      if (isSyncingTaluk) return;
      isSyncingTaluk = true;
      try {
        let selectedValue = '';
        let selectedText = '';
        if (sourceElement && sourceElement.selectedIndex >= 0) {
          const opt = sourceElement.options[sourceElement.selectedIndex];
          selectedValue = sourceElement.value;
          selectedText = opt ? opt.text : selectedValue;
        }
        const targetDesc = selectedText || selectedValue;
        if (!targetDesc) return;
        if (typeof window.mayUseTaluk === 'function') {
          const clean = targetDesc.replace(/\s*\(\d+\)\s*$/, '').trim();
          if (!window.mayUseTaluk(clean)) {
            console.warn('Taluk change blocked: not authorized for', clean);
            return;
          }
        }

        if (sourceElement !== headerTalukSel && headerTalukSel) {
          const changed = setSelectByTaluk(headerTalukSel, targetDesc);
          if (changed) {
            headerTalukSel.dispatchEvent(new Event('change'));
          }
        }
        if (sourceElement !== talukSel && talukSel) {
          setSelectByTaluk(talukSel, targetDesc);
          if (typeof onTalukChange === 'function') onTalukChange();
        }
        if (sourceElement !== ffTalukSel && ffTalukSel) {
          setSelectByTaluk(ffTalukSel, targetDesc);
        }
      } finally {
        isSyncingTaluk = false;
      }
    }

    if (headerTalukSel) {
      headerTalukSel.addEventListener('change', () => {
        syncTalukSelection(headerTalukSel);
      });
    }
    if (ffTalukSel) {
      ffTalukSel.addEventListener('change', () => {
        syncTalukSelection(ffTalukSel);
      });
    }
    if (talukSel) {
      talukSel.addEventListener('change', () => {
        syncTalukSelection(talukSel);
      });
    }

    // Initial taluk synchronization on load
    const initialTaluk = (headerTalukSel && headerTalukSel.value) ? headerTalukSel.value : (localStorage.getItem('village_test.selectedTaluk.v1') || 'Nemili');
    if (headerTalukSel && (!headerTalukSel.value || headerTalukSel.value === '')) {
      setSelectByTaluk(headerTalukSel, initialTaluk);
    }
    if (talukSel) setSelectByTaluk(talukSel, initialTaluk);
    if (ffTalukSel) setSelectByTaluk(ffTalukSel, initialTaluk);

    const nisdRadio = document.getElementById('tnRadioNisd');
    const isdRadio = document.getElementById('tnRadioIsd');
    const landRuralRadio = document.getElementById('tnLandRural');
    const landNathamRadio = document.getElementById('tnLandNatham');
    const svcOptRadio = document.getElementById('tnSvcOpt');
    const svcFlineRadio = document.getElementById('tnSvcFline');
    const svcIsdPdfRadio = document.getElementById('tnSvcIsdPdf');
    const directIsdPdfBtn = document.getElementById('tnDirectIsdPdfBtn');

    if (distSel) distSel.addEventListener('change', onDistrictChange);

    if (nisdRadio) nisdRadio.addEventListener('change', onOptTypeChange);
    if (isdRadio) isdRadio.addEventListener('change', onOptTypeChange);
    if (landRuralRadio) landRuralRadio.addEventListener('change', onOptTypeChange);
    if (landNathamRadio) landNathamRadio.addEventListener('change', onOptTypeChange);

    if (svcOptRadio) svcOptRadio.addEventListener('change', onServiceGroupChange);
    if (svcFlineRadio) svcFlineRadio.addEventListener('change', onServiceGroupChange);
    if (svcIsdPdfRadio) svcIsdPdfRadio.addEventListener('change', onServiceGroupChange);

    if (directIsdPdfBtn) {
      directIsdPdfBtn.addEventListener('click', async () => {
        if (typeof window.__pullIsdRuralPdfStandalone === 'function') {
          await window.__pullIsdRuralPdfStandalone();
        }
      });
    }

    bindQuickDateEvents();

    // --- Critical: Submit / Excel / Apply listeners ---
    if (submitBtn) submitBtn.addEventListener('click', handleFetch);
    if (excelBtn) excelBtn.addEventListener('click', handleExportExcel);
    if (applyBtn) applyBtn.addEventListener('click', handleApplyToDashboard);
  }

  function onServiceGroupChange() {
    const serviceGroup = document.querySelector('input[name="tnServiceGroup"]:checked')?.value || 'OPT';
    const optRow = document.getElementById('tnOptRow');
    const flineRow = document.getElementById('tnFlineReportRow');
    const dateModeRow = document.getElementById('tnFlineDateModeRow');
    const applyBtn = document.getElementById('tnBtnApply');

    if (serviceGroup === 'ISD_PDF') {
      if (optRow) optRow.style.display = 'none';
      if (flineRow) flineRow.style.display = 'none';
      if (dateModeRow) dateModeRow.style.display = 'none';
      const cur = getCurrentMonthRange();
      const fromEl = document.getElementById('tnFromDate');
      const toEl = document.getElementById('tnToDate');
      if (fromEl) fromEl.value = cur.fromDate;
      if (toEl) toEl.value = cur.toDate;
      if (applyBtn) applyBtn.innerHTML = '⚡ Auto-Load ISD Rural Status into Dashboard';
    } else if (serviceGroup === 'FLINE') {
      if (optRow) optRow.style.display = 'none';
      if (flineRow) flineRow.style.display = 'block';
      if (dateModeRow) dateModeRow.style.display = 'block';
      if (applyBtn) applyBtn.innerHTML = '⚡ Auto-Load F-Line Data into Dashboard';
    } else {
      if (optRow) optRow.style.display = 'block';
      if (flineRow) flineRow.style.display = 'none';
      if (dateModeRow) dateModeRow.style.display = 'none';
      onOptTypeChange();
    }
  }

  function onOptTypeChange() {
    const serviceGroup = document.querySelector('input[name="tnServiceGroup"]:checked')?.value || 'OPT';
    if (serviceGroup === 'FLINE' || serviceGroup === 'ISD_PDF') return;

    const optType = document.querySelector('input[name="tnOptType"]:checked')?.value || 'N';
    const quickContainer = document.getElementById('tnQuickDatesContainer');
    const applyBtn = document.getElementById('tnBtnApply');

    if (optType === 'I') {
      if (quickContainer) {
        quickContainer.innerHTML = `
          <button type="button" class="tn-quick-btn" data-range="isd30">30 Days above</button>
          <button type="button" class="tn-quick-btn" data-range="isd25">25 Days above</button>
          <button type="button" class="tn-quick-btn" data-range="isdBelow25">25 Days below</button>
        `;
        bindQuickDateEvents();
      }
      if (applyBtn) {
        applyBtn.innerHTML = '⚡ Auto-Load All into Dashboard (30d+ / 25-29d / &lt;25d)';
      }
    } else {
      if (quickContainer) {
        quickContainer.innerHTML = `
          <button type="button" class="tn-quick-btn" data-range="12">12 Days</button>
          <button type="button" class="tn-quick-btn" data-range="10">10 Days</button>
          <button type="button" class="tn-quick-btn" data-range="below10">&lt;10 Days</button>
        `;
        bindQuickDateEvents();
      }
      if (applyBtn) {
        applyBtn.innerHTML = '⚡ Auto-Load All into Dashboard (12d / 10d / &lt;10d)';
      }
    }
  }

  function bindQuickDateEvents() {
    document.querySelectorAll('.tn-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const range = btn.dataset.range;
        const to = new Date();
        let from = new Date();

        if (range === '12') {
          from.setDate(to.getDate() - 12);
        } else if (range === '10') {
          from.setDate(to.getDate() - 10);
        } else if (range === 'below10') {
          from.setDate(to.getDate() - 9);
        } else if (range === 'isd30') {
          from.setDate(to.getDate() - 60);
          to.setDate(to.getDate() - 30);
        } else if (range === 'isd25') {
          from.setDate(to.getDate() - 29);
          to.setDate(to.getDate() - 25);
        } else if (range === 'isdBelow25') {
          from.setDate(to.getDate() - 24);
        }

        const formatD = d => {
          const day = String(d.getDate()).padStart(2, '0');
          const m = String(d.getMonth() + 1).padStart(2, '0');
          return `${day}-${m}-${d.getFullYear()}`;
        };

        document.getElementById('tnFromDate').value = formatD(from);
        document.getElementById('tnToDate').value = formatD(to);
      });
    });
  }

  async function onDistrictChange() {
    const distCode = document.getElementById('tnDistSel').value;
    const talukSel = document.getElementById('tnTalukSel');
    talukSel.innerHTML = '<option value="">Loading Taluks...</option>';

    try {
      let taluks = talukCache.get(distCode);
      if (!taluks) {
        const creds = getTnCreds();
        const res = await fetch(`/api/nisd-rural?mode=taluks&distCode=${encodeURIComponent(distCode)}&username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&roleId=${encodeURIComponent(creds.roleId)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.taluks)) {
          taluks = data.taluks.map(t => ({
            code: t.talukCode,
            name: `${t.talukName} (${t.talukCode})`
          }));
          talukCache.set(distCode, taluks);
        }
      }

      if (taluks && taluks.length) {
        let availableTaluks = taluks;
        const mine = (typeof window.myTaluks === 'function') ? window.myTaluks() : null;
        if (mine && mine.length) {
          availableTaluks = taluks.filter(t => {
            const cleanName = (t.name || '').replace(/\s*\(\d+\)\s*$/, '').trim();
            return mine.some(m => cleanName.toLowerCase() === m.toLowerCase() || t.name.toLowerCase().includes(m.toLowerCase()) || t.code === m);
          });
          if (!availableTaluks.length) availableTaluks = taluks;
        }
        talukSel.innerHTML = availableTaluks.map(t => `<option value="${t.code}">${t.name}</option>`).join('');
        const topTalukSel = document.getElementById('talukSel');
        let activeTaluk = topTalukSel?.value || (mine && mine[0]) || localStorage.getItem('village_test.selectedTaluk.v1') || 'Nemili';
        if (mine && mine.length && typeof window.mayUseTaluk === 'function' && !window.mayUseTaluk(activeTaluk)) {
          activeTaluk = mine[0];
        }
        setSelectByTaluk(talukSel, activeTaluk);
      } else {
        talukSel.innerHTML = '<option value="">-- No Taluks Found --</option>';
      }
    } catch (err) {
      console.error('Failed to load taluks:', err);
      talukSel.innerHTML = '<option value="">Failed to load taluks</option>';
    }

    onTalukChange();
  }

  async function onTalukChange() {
    const distCode = document.getElementById('tnDistSel').value;
    const talukCode = document.getElementById('tnTalukSel').value;
    const villageSel = document.getElementById('tnVillageSel');

    if (!talukCode) {
      villageSel.innerHTML = '<option value="">-- ALL VILLAGES (Combined) --</option>';
      return;
    }

    const cacheKey = `${distCode}_${talukCode}`;
    villageSel.innerHTML = '<option value="">Loading Villages...</option>';

    try {
      let villages = villageCache.get(cacheKey);
      if (!villages) {
        const creds = getTnCreds();
        const res = await fetch(`/api/nisd-rural?mode=villages&distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}&username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&roleId=${encodeURIComponent(creds.roleId)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.villages)) {
          villages = [
            { code: "", name: "-- ALL VILLAGES (Combined) --" },
            ...data.villages.map(v => ({
              code: v.villageCode,
              name: `${v.villageName} (${v.villageCode})`
            }))
          ];
          villageCache.set(cacheKey, villages);
        }
      }

      if (villages && villages.length) {
        villageSel.innerHTML = villages.map(v => `<option value="${v.code}">${v.name}</option>`).join('');
      } else {
        villageSel.innerHTML = '<option value="">-- ALL VILLAGES (Combined) --</option>';
      }
    } catch (err) {
      console.error('Failed to load villages:', err);
      villageSel.innerHTML = '<option value="">-- ALL VILLAGES (Combined) --</option>';
    }
  }

  function calculatePendingDays(app) {
    if (app.appl_date || app.appl_dt) {
      const dateStr = String(app.appl_date || app.appl_dt).trim();
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        let d, m, y;
        if (parts[0].length === 4) [y, m, d] = parts.map(Number);
        else [d, m, y] = parts.map(Number);
        const appDate = new Date(y, m - 1, d);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        appDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((now.getTime() - appDate.getTime()) / 86400000);
        if (!isNaN(diffDays) && diffDays >= 0) return diffDays;
      }
    }
    if (app.pending_days != null || app.total_pending != null) {
      const tp = parseInt(String(app.pending_days || app.total_pending).replace(/[^\d]/g, ''), 10);
      if (!isNaN(tp) && tp >= 0) return tp;
    }
    return 0;
  }

  function groupAppsByVillage(apps) {
    const map = new Map();
    apps.forEach(app => {
      const vName = (app.village_name || 'Unknown').trim();
      if (!map.has(vName)) {
        map.set(vName, {
          village: vName,
          rtr: 0,
          str: 0,
          total: 0
        });
      }
      const item = map.get(vName);
      const isRtr = (app.rtr_str || '').toUpperCase() === 'R';
      if (isRtr) item.rtr++;
      else item.str++;
      item.total++;
    });
    return Array.from(map.values());
  }

  function groupAppsByVillageForISD(apps) {
    const map = new Map();
    apps.forEach(app => {
      const vName = (app.village_name || app.village || 'Unknown').trim();
      const tName = (app.taluk_name || app.taluk || '').trim();
      if (!map.has(vName)) {
        map.set(vName, {
          label: vName,
          village: vName,
          taluk: tName,
          surv: 0, vao: 0, lrd: 0, dis: 0, thl: 0, all: 0,
          rtr: 0, str: 0, total: 0,
          sur_rtr: 0, sur_str: 0, total_sur: 0,
          lrd_rtr: 0, lrd_str: 0, total_lrd: 0,
          dis_rtr: 0, dis_str: 0, total_dis: 0,
          thl_rtr: 0, thl_str: 0, total_thl: 0,
          vao_rtr: 0, vao_str: 0, total_vao: 0
        });
      }
      const item = map.get(vName);
      if (!item.taluk && tName) item.taluk = tName;
      const isRtr = (app.rtr_str || '').toUpperCase() === 'R';
      const role = String(app.role_name || app.pending_at || '').trim().toUpperCase();

      if (isRtr) item.rtr++;
      else item.str++;
      item.total++;
      item.all++;

      if (role.includes('SURVEYOR') || role.includes('SUR')) {
        if (isRtr) item.sur_rtr++; else item.sur_str++;
        item.total_sur++;
        item.surv++;
      } else if (role.includes('LRD')) {
        if (isRtr) item.lrd_rtr++; else item.lrd_str++;
        item.total_lrd++;
        item.lrd++;
      } else if (role.includes('DIS') || role.includes('DISTRICT')) {
        if (isRtr) item.dis_rtr++; else item.dis_str++;
        item.total_dis++;
        item.dis++;
      } else if (role.includes('THL') || role.includes('TAHSILDAR') || role.includes('TASHILDAR')) {
        if (isRtr) item.thl_rtr++; else item.thl_str++;
        item.total_thl++;
        item.thl++;
      } else {
        if (isRtr) item.vao_rtr++; else item.vao_str++;
        item.total_vao++;
        item.vao++;
      }
    });

    const rows = Array.from(map.values());
    let footer = null;
    if (rows.length > 0) {
      footer = {
        label: 'Total',
        village: 'Total',
        taluk: '',
        surv: rows.reduce((s, r) => s + r.surv, 0),
        vao: rows.reduce((s, r) => s + r.vao, 0),
        lrd: rows.reduce((s, r) => s + r.lrd, 0),
        dis: rows.reduce((s, r) => s + r.dis, 0),
        thl: rows.reduce((s, r) => s + r.thl, 0),
        all: rows.reduce((s, r) => s + r.all, 0),
        rtr: rows.reduce((s, r) => s + r.rtr, 0),
        str: rows.reduce((s, r) => s + r.str, 0),
        total: rows.reduce((s, r) => s + r.total, 0),
        sur_rtr: rows.reduce((s, r) => s + r.sur_rtr, 0),
        sur_str: rows.reduce((s, r) => s + r.sur_str, 0),
        total_sur: rows.reduce((s, r) => s + r.total_sur, 0),
        lrd_rtr: rows.reduce((s, r) => s + r.lrd_rtr, 0),
        lrd_str: rows.reduce((s, r) => s + r.lrd_str, 0),
        total_lrd: rows.reduce((s, r) => s + r.total_lrd, 0),
        dis_rtr: rows.reduce((s, r) => s + r.dis_rtr, 0),
        dis_str: rows.reduce((s, r) => s + r.dis_str, 0),
        total_dis: rows.reduce((s, r) => s + r.total_dis, 0),
        thl_rtr: rows.reduce((s, r) => s + r.thl_rtr, 0),
        thl_str: rows.reduce((s, r) => s + r.thl_str, 0),
        total_thl: rows.reduce((s, r) => s + r.total_thl, 0),
        vao_rtr: rows.reduce((s, r) => s + r.vao_rtr, 0),
        vao_str: rows.reduce((s, r) => s + r.vao_str, 0),
        total_vao: rows.reduce((s, r) => s + r.total_vao, 0)
      };
    }
    return { rows, footer };
  }

  async function handleFetch() {
    const statusBanner = document.getElementById('tnStatusBanner');
    const reportArea = document.getElementById('tnReportArea');
    const excelBtn = document.getElementById('tnBtnExcel');
    const applyWrap = document.getElementById('tnApplyWrap');
    const bucketSummary = document.getElementById('tnBucketSummary');

    const serviceGroup = document.querySelector('input[name="tnServiceGroup"]:checked')?.value || 'OPT';
    const distCode = document.getElementById('tnDistSel').value;
    const talukCode = document.getElementById('tnTalukSel').value;
    const villageCode = document.getElementById('tnVillageSel').value;
    const fromDate = document.getElementById('tnFromDate').value.trim();
    const toDate = document.getElementById('tnToDate').value.trim();
    const mode = document.getElementById('tnViewMode').value;
    const landCategory = document.querySelector('input[name="tnLandCat"]:checked')?.value || 'rural';
    const creds = getTnCreds();
    currentMode = mode;

    if (!fromDate || !toDate) {
      showStatus('Please specify both From Date and To Date.', 'error');
      return;
    }

    const targetDesc = villageCode
      ? `village (${document.getElementById('tnVillageSel').selectedOptions[0].text})`
      : 'all villages';

    reportArea.style.display = 'none';
    excelBtn.style.display = 'none';
    if (applyWrap) applyWrap.style.display = 'none';

    try {
      if (serviceGroup === 'ISD_PDF') {
        const talukName = document.getElementById('tnTalukSel')?.selectedOptions[0]?.text || '';
        const secCreds = getTnCreds('secondary', talukName);
        showStatus(`Connecting to Tamil Nilam & fetching live drilldowntasildar ISD Rural Status for ${targetDesc}...`, 'info');

        const url = `/api/nisd-rural?mode=isd_status&distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}&talukName=${encodeURIComponent(talukName)}&username=${encodeURIComponent(secCreds.username)}&password=${encodeURIComponent(secCreds.password)}&roleId=${encodeURIComponent(secCreds.roleId)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch ISD Rural status');

        currentReportData = { ...data, serviceGroup: 'ISD_PDF', landCategory: 'rural' };
        hideStatus();

        renderIsdStatusTable(data);
        reportArea.style.display = 'block';
        excelBtn.style.display = 'inline-block';

        if (applyWrap) {
          applyWrap.style.display = 'inline-flex';
          const vCount = (data.villages || []).length;
          if (bucketSummary) {
            bucketSummary.style.display = 'inline-flex';
            bucketSummary.innerHTML = `ISD Status: <b>${vCount}</b> villages found`;
          }
        }
        return;
      }

      if (serviceGroup === 'FLINE') {
        const reportType = document.querySelector('input[name="tnFlineReportType"]:checked')?.value || 'FLINE';
        const stmtFlag = document.querySelector('input[name="tnStmtFlag"]:checked')?.value || 'Current';
        const typeLabel = `F-Line ${reportType === 'APPEAL' ? 'Appeal ' : ''}(${landCategory.toUpperCase()})`;
        
        showStatus(`Connecting to Tamil Nilam & fetching live ${typeLabel} report for ${targetDesc}...`, 'info');

        const url = `/api/fline?reportType=${encodeURIComponent(reportType)}&landCategory=${encodeURIComponent(landCategory)}&stmtFlag=${encodeURIComponent(stmtFlag)}&distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&mode=${encodeURIComponent(mode)}&username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&roleId=${encodeURIComponent(creds.roleId)}`;

        const res = await fetch(url);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch F-Line report');

        // Apply strict Taluk scoping to filter out any non-target taluk applications
        const talukOption = document.getElementById('tnTalukSel')?.selectedOptions[0];
        const talukName = talukOption ? talukOption.text : '';
        if (Array.isArray(data.applications)) {
          data.applications = filterAppsByTaluk(data.applications, talukCode, talukName);
        }

        currentReportData = { ...data, serviceGroup: 'FLINE', landCategory, reportType };
        hideStatus();

        renderFlineDetailsTable(data);
        reportArea.style.display = 'block';
        excelBtn.style.display = 'inline-block';

        if (applyWrap) {
          applyWrap.style.display = 'inline-flex';
          const apps = data.applications || [];
          if (bucketSummary) {
            bucketSummary.style.display = 'inline-flex';
            bucketSummary.innerHTML = `F-Line Applications: <b>${apps.length}</b> total pending`;
          }
        }
        return;
      }

      // OPT SERVICE GROUP
      const optType = document.querySelector('input[name="tnOptType"]:checked')?.value || 'N';
      const typeLabel = (landCategory === 'natham' ? 'Natham ' : 'Rural ') + (optType === 'I' ? 'ISD' : 'NISD');
      showStatus(`Connecting to Tamil Nilam & fetching live ${typeLabel} report for ${targetDesc}...`, 'info');

      const url = `/api/nisd-rural?distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}&villageCode=${encodeURIComponent(villageCode)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}&mode=${encodeURIComponent(mode)}&flag=${encodeURIComponent(optType)}&landCategory=${encodeURIComponent(landCategory)}&username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&roleId=${encodeURIComponent(creds.roleId)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch report');

      // Apply strict Taluk scoping to filter out any non-target taluk applications
      const talukOption = document.getElementById('tnTalukSel')?.selectedOptions[0];
      const talukName = talukOption ? talukOption.text : '';
      if (Array.isArray(data.applications)) {
        data.applications = filterAppsByTaluk(data.applications, talukCode, talukName);
      }

      currentReportData = { ...data, serviceGroup: 'OPT', landCategory };
      hideStatus();

      if (mode === 'details') {
        renderDetailsTable(data, optType);
      } else {
        renderSummaryTable(data, optType);
      }

      reportArea.style.display = 'block';
      excelBtn.style.display = 'inline-block';

      if (applyWrap) {
        applyWrap.style.display = 'inline-flex';
        const rawApps = data.applications || [];

        if (optType === 'I') {
          const apps = rawApps;
          const b30 = apps.filter(a => calculatePendingDays(a) >= 30).length;
          const b25 = apps.filter(a => { const d = calculatePendingDays(a); return d >= 25 && d < 30; }).length;
          const bBelow25 = apps.filter(a => calculatePendingDays(a) < 25).length;

          if (bucketSummary) {
            bucketSummary.style.display = 'inline-flex';
            bucketSummary.innerHTML = `Breakdown: <b>${b30}</b> &ge;30d &bull; <b>${b25}</b> 25-29d &bull; <b>${bBelow25}</b> &lt;25d`;
          }
        } else {
          // NISD: filter VAO-only pending applications
          const apps = rawApps.filter(a => {
            const r = String(a.role_name || a.pending_at || '').trim().toUpperCase();
            return r === 'VAO' || r.includes('VAO');
          });
          const b12 = apps.filter(a => calculatePendingDays(a) >= 12).length;
          const b10 = apps.filter(a => { const d = calculatePendingDays(a); return d >= 10 && d < 12; }).length;
          const bBelow10 = apps.filter(a => calculatePendingDays(a) < 10).length;

          if (bucketSummary) {
            bucketSummary.style.display = 'inline-flex';
            bucketSummary.innerHTML = `VAO Pending Breakdown: <b>${b12}</b> &ge;12d &bull; <b>${b10}</b> 10-11d &bull; <b>${bBelow10}</b> &lt;10d`;
          }
        }
      }

    } catch (err) {
      console.error('Fetch error:', err);
      let errorMsg = err.message;
      if (errorMsg.includes('timed out') || errorMsg.includes('fetch')) {
        errorMsg += ' — Note: Tamil Nadu Government (TNSDC) firewall blocks foreign IP addresses. If deployed on Vercel, ensure the Mumbai (bom1) serverless region is used, or run locally via `node local_server.js`.';
      }
      showStatus(`Error fetching Tamil Nilam report: ${errorMsg}`, 'error');
    }
  }

  function renderFlineDetailsTable(data) {
    const tableWrap = document.getElementById('tnTableWrap');
    const apps = data.applications || [];
    const period = data.period || 'F-LINE REPORT';
    const asOn = data.asOn || '';

    let html = `
      <table class="tn-report-table" id="tnExportTable">
        <thead>
          <tr>
            <th colspan="11" class="tn-main-head">
              ${esc(period)} ${asOn ? `<br>${esc(asOn)}` : ''}
            </th>
          </tr>
          <tr>
            <th class="tn-col-head">S.No.</th>
            <th class="tn-col-head">District Name</th>
            <th class="tn-col-head">Taluk Name</th>
            <th class="tn-col-head">Village Name</th>
            <th class="tn-col-head">Application Id</th>
            <th class="tn-col-head">SurveyNo - SubdivNo</th>
            <th class="tn-col-head">Application Date</th>
            <th class="tn-col-head">Pending Days</th>
            <th class="tn-col-head">Pending at</th>
            <th class="tn-col-head">Application Status</th>
            <th class="tn-col-head">Update Date</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (!apps.length) {
      html += `<tr><td colspan="11" style="text-align:center; padding: 20px; color: var(--muted);">No F-Line pending applications found for the selected criteria.</td></tr>`;
    } else {
      apps.forEach((app, idx) => {
        const role = app.pending_at || 'Surveyor';
        const pendDays = calculatePendingDays(app);
        let badgeColor = '#10b981';
        if (pendDays >= 30) badgeColor = '#ef4444';
        else if (pendDays >= 15) badgeColor = '#f59e0b';

        html += `
          <tr>
            <td class="align-center">${idx + 1}</td>
            <td>${esc(app.district_name || '')}</td>
            <td>${esc(app.taluk_name || '')}</td>
            <td><b>${esc(app.village_name || '')}</b></td>
            <td style="font-family: monospace; font-weight: 600;">${esc(app.appl_id || '')}</td>
            <td class="align-center"><b>${esc(app.survey_no || '-')}</b></td>
            <td class="align-center">${esc(app.appl_date || '')}</td>
            <td class="align-right"><b style="color:${badgeColor}">${pendDays} days</b></td>
            <td class="align-center"><span class="tn-badge-role vao">${esc(role)}</span></td>
            <td class="align-center">${esc(app.appl_status || 'Pending')}</td>
            <td class="align-center">${esc(app.update_dt || '-')}</td>
          </tr>
        `;
      });
    }

    html += `</tbody></table>`;
    tableWrap.innerHTML = html;
  }

  function renderIsdStatusTable(data) {
    const tableWrap = document.getElementById('tnTableWrap');
    const villages = data.villages || [];
    const period = data.period || 'ISD RURAL APPLICATION STATUS';
    const asOn = data.asOn || '';
    const grand = data.grand?.all || { approved: 0, pending: 0, rejected: 0, returned: 0, total: 0 };

    let html = `
      <table class="tn-report-table" id="tnExportTable">
        <thead>
          <tr>
            <th colspan="7" class="tn-main-head">
              ${esc(period)} ${asOn ? `<br>${esc(asOn)}` : ''}
            </th>
          </tr>
          <tr>
            <th class="tn-col-head">S.No.</th>
            <th class="tn-col-head">Village Name</th>
            <th class="tn-col-head">Approved</th>
            <th class="tn-col-head">Pending</th>
            <th class="tn-col-head">Rejected</th>
            <th class="tn-col-head">Returned</th>
            <th class="tn-col-head">Total</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (!villages.length) {
      html += `<tr><td colspan="7" style="text-align:center; padding: 20px; color: var(--muted);">No village records found for the selected date range.</td></tr>`;
    } else {
      villages.forEach((v, idx) => {
        html += `
          <tr>
            <td class="align-center">${idx + 1}</td>
            <td><b>${esc(v.village || '')}</b></td>
            <td class="align-center" style="color:#10b981; font-weight:600;">${v.approved || 0}</td>
            <td class="align-center" style="color:#ef4444; font-weight:700;">${v.pending || 0}</td>
            <td class="align-center" style="color:#6b7280;">${v.rejected || 0}</td>
            <td class="align-center" style="color:#9ca3af;">${v.returned || 0}</td>
            <td class="align-center" style="font-weight:700;">${v.total || 0}</td>
          </tr>
        `;
      });
      html += `
        <tr style="background:var(--surface-2); font-weight:800; border-top:2px solid var(--line-strong);">
          <td colspan="2" style="text-align:right; padding:8px 12px;">Total:</td>
          <td class="align-center" style="color:#10b981;">${grand.approved || 0}</td>
          <td class="align-center" style="color:#ef4444;">${grand.pending || 0}</td>
          <td class="align-center" style="color:#6b7280;">${grand.rejected || 0}</td>
          <td class="align-center" style="color:#9ca3af;">${grand.returned || 0}</td>
          <td class="align-center">${grand.total || 0}</td>
        </tr>
      `;
    }

    html += `</tbody></table>`;
    tableWrap.innerHTML = html;
  }

  function renderDetailsTable(data, optType) {
    const tableWrap = document.getElementById('tnTableWrap');
    const apps = data.applications || [];
    const period = data.period || 'OPT APPLICATION PENDING REPORT';
    const asOn = data.asOn || '';

    let html = `
      <table class="tn-report-table" id="tnExportTable">
        <thead>
          <tr>
            <th colspan="12" class="tn-main-head">
              ${esc(period)} ${asOn ? `<br>${esc(asOn)}` : ''}
            </th>
          </tr>
          <tr>
            <th class="tn-col-head">S.No.</th>
            <th class="tn-col-head">District Name</th>
            <th class="tn-col-head">Taluk Name</th>
            <th class="tn-col-head">Village Name</th>
            <th class="tn-col-head">Application Id</th>
            <th class="tn-col-head">Survey No.</th>
            <th class="tn-col-head">Survey No. - Subdiv No.</th>
            <th class="tn-col-head">Pending at</th>
            <th class="tn-col-head">RTR-STR</th>
            <th class="tn-col-head">Application Date</th>
            <th class="tn-col-head">Application Pendency(Days)</th>
            <th class="tn-col-head">Current Level(Days)</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (!apps.length) {
      html += `<tr><td colspan="12" style="text-align:center; padding: 20px; color: var(--muted);">No pending applications found for the selected criteria.</td></tr>`;
    } else {
      apps.forEach((app, idx) => {
        const role = app.role_name || app.pending_at || 'VAO';
        const pendDays = calculatePendingDays(app);
        let badgeColor = '#10b981';

        if (optType === 'I') {
          if (pendDays >= 30) badgeColor = '#ef4444';
          else if (pendDays >= 25) badgeColor = '#f59e0b';
        } else {
          if (pendDays >= 12) badgeColor = '#ef4444';
          else if (pendDays >= 10) badgeColor = '#f59e0b';
        }

        html += `
          <tr>
            <td class="align-center">${idx + 1}</td>
            <td>${esc(app.district_name || '')}</td>
            <td>${esc(app.taluk_name || '')}</td>
            <td><b>${esc(app.village_name || '')}</b></td>
            <td style="font-family: monospace; font-weight: 600;">${esc(app.appl_id || '')}</td>
            <td class="align-center">${esc(app.survey_no_dis || app.survey_no || '-')}</td>
            <td style="font-size: 11px;">${esc(app.survey_subdivno || '-')}</td>
            <td class="align-center"><span class="tn-badge-role vao">${esc(role)}</span></td>
            <td class="align-center"><b>${esc(app.rtr_str || '')}</b></td>
            <td class="align-center">${esc(app.appl_date || '')}</td>
            <td class="align-right"><b style="color:${badgeColor}">${pendDays} days</b></td>
            <td class="align-right">${esc(app.pending_at_days || app.pending_days || '')}</td>
          </tr>
        `;
      });
    }

    html += `</tbody></table>`;
    tableWrap.innerHTML = html;
  }

  function renderSummaryTable(data, optType) {
    const tableWrap = document.getElementById('tnTableWrap');
    const villages = (data.data && data.data.distarr) || (data.summary && data.summary.distarr) || [];
    const period = data.period || 'OPT APPLICATION PENDING REPORT';
    const asOn = data.asOn || '';

    if (optType === 'I') {
      let html = `
        <table class="tn-report-table" id="tnExportTable">
          <thead>
            <tr>
              <th colspan="22" class="tn-main-head">
                ${esc(period)} ${asOn ? `<br>AND PENDING AS ON: ${esc(asOn)}` : ''}
              </th>
            </tr>
            <tr>
              <th rowspan="2" class="tn-col-head">S.No.</th>
              <th rowspan="2" class="tn-col-head">District Name</th>
              <th rowspan="2" class="tn-col-head">Taluk Name</th>
              <th rowspan="2" class="tn-col-head">Village Name</th>
              <th colspan="3" class="tn-col-head">TOTAL</th>
              <th colspan="3" class="tn-col-head">SURVEYOR</th>
              <th colspan="3" class="tn-col-head">LRD</th>
              <th colspan="3" class="tn-col-head">DIS</th>
              <th colspan="3" class="tn-col-head">THL</th>
              <th colspan="3" class="tn-col-head">VAO</th>
            </tr>
            <tr>
              <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
              <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
              <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
              <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
              <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
              <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
            </tr>
          </thead>
          <tbody>
      `;

      if (!villages.length) {
        html += `<tr><td colspan="22" style="text-align:center; padding: 20px; color: var(--muted);">No records found.</td></tr>`;
      } else {
        villages.forEach((v, idx) => {
          html += `
            <tr>
              <td class="align-center">${idx + 1}</td>
              <td>${esc(v.district_name || '')}</td>
              <td>${esc(v.taluk_name || '')}</td>
              <td><b>${esc(v.village_name || '')}</b></td>
              <td class="align-right">${esc(v.total_rtr || '0')}</td>
              <td class="align-right">${esc(v.total_str || '0')}</td>
              <td class="align-right"><b>${esc(v.total || '0')}</b></td>
              <td class="align-right">${esc(v.sur_rtr || '0')}</td>
              <td class="align-right">${esc(v.sur_str || '0')}</td>
              <td class="align-right"><b>${esc(v.total_sur || '0')}</b></td>
              <td class="align-right">${esc(v.lrd_rtr || '0')}</td>
              <td class="align-right">${esc(v.lrd_str || '0')}</td>
              <td class="align-right">${esc(v.total_lrd || '0')}</td>
              <td class="align-right">${esc(v.dis_rtr || '0')}</td>
              <td class="align-right">${esc(v.dis_str || '0')}</td>
              <td class="align-right">${esc(v.total_dis || '0')}</td>
              <td class="align-right">${esc(v.tashildar_rtr || '0')}</td>
              <td class="align-right">${esc(v.tashildar_str || '0')}</td>
              <td class="align-right">${esc(v.total_thl || '0')}</td>
              <td class="align-right">${esc(v.vao_rtr || '0')}</td>
              <td class="align-right">${esc(v.vao_str || '0')}</td>
              <td class="align-right"><b>${esc(v.total_vao || '0')}</b></td>
            </tr>
          `;
        });
      }

      html += `</tbody></table>`;
      tableWrap.innerHTML = html;
      return;
    }

    let html = `
      <table class="tn-report-table" id="tnExportTable">
        <thead>
          <tr>
            <th colspan="17" class="tn-main-head">
              ${esc(period)} ${asOn ? `<br>AND PENDING AS ON: ${esc(asOn)}` : ''}
            </th>
          </tr>
          <tr>
            <th rowspan="2" class="tn-col-head">S.No.</th>
            <th rowspan="2" class="tn-col-head">District</th>
            <th rowspan="2" class="tn-col-head">Taluk</th>
            <th rowspan="2" class="tn-col-head">Zone</th>
            <th rowspan="2" class="tn-col-head">Village Name</th>
            <th colspan="3" class="tn-col-head">TOTAL</th>
            <th colspan="3" class="tn-col-head">VAO</th>
            <th colspan="3" class="tn-col-head">ZDT</th>
            <th colspan="3" class="tn-col-head">HQDT</th>
          </tr>
          <tr>
            <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
            <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
            <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
            <th class="tn-col-head">RTR</th><th class="tn-col-head">STR</th><th class="tn-col-head">Total</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (!villages.length) {
      html += `<tr><td colspan="17" style="text-align:center; padding: 20px; color: var(--muted);">No records found.</td></tr>`;
    } else {
      villages.forEach((v, idx) => {
        html += `
          <tr>
            <td class="align-center">${idx + 1}</td>
            <td>${esc(v.district_name || '')}</td>
            <td>${esc(v.taluk_name || '')}</td>
            <td>${esc(v.zone_name || '')}</td>
            <td><b>${esc(v.village_name || '')}</b></td>
            <td class="align-right">${esc(v.total_rtr || '0')}</td>
            <td class="align-right">${esc(v.total_str || '0')}</td>
            <td class="align-right"><b>${esc(v.total || '0')}</b></td>
            <td class="align-right">${esc(v.vao_rtr || '0')}</td>
            <td class="align-right">${esc(v.vao_str || '0')}</td>
            <td class="align-right"><b>${esc(v.vao || '0')}</b></td>
            <td class="align-right">${esc(v.zdt_rtr || '0')}</td>
            <td class="align-right">${esc(v.zdt_str || '0')}</td>
            <td class="align-right">${esc(v.zdt || '0')}</td>
            <td class="align-right">${esc(v.hqdt_rtr || '0')}</td>
            <td class="align-right">${esc(v.hqdt_str || '0')}</td>
            <td class="align-right">${esc(v.hqdt || '0')}</td>
          </tr>
        `;
      });
    }

    html += `</tbody></table>`;
    tableWrap.innerHTML = html;
  }

  function buildVillageOptWorkbook(grouped, title) {
    const ws_data = [
      [title],
      ['S.No.', 'Taluk Name', 'Village Name', 'TOTAL RTR', 'TOTAL STR', 'TOTAL Total',
       'SURVEYOR RTR', 'SURVEYOR STR', 'SURVEYOR Total',
       'LRD RTR', 'LRD STR', 'LRD Total',
       'DIS RTR', 'DIS STR', 'DIS Total',
       'THL RTR', 'THL STR', 'THL Total',
       'VAO RTR', 'VAO STR', 'VAO Total']
    ];
    grouped.rows.forEach((r, idx) => {
      ws_data.push([
        idx + 1, r.taluk || '', r.label || r.village || '',
        r.rtr || 0, r.str || 0, r.total || 0,
        r.sur_rtr || 0, r.sur_str || 0, r.surv || r.total_sur || 0,
        r.lrd_rtr || 0, r.lrd_str || 0, r.lrd || r.total_lrd || 0,
        r.dis_rtr || 0, r.dis_str || 0, r.dis || r.total_dis || 0,
        r.thl_rtr || 0, r.thl_str || 0, r.thl || r.total_thl || 0,
        r.vao_rtr || 0, r.vao_str || 0, r.vao || r.total_vao || 0
      ]);
    });
    if (grouped.footer) {
      const f = grouped.footer;
      ws_data.push([
        'Total', '', 'Total',
        f.rtr || 0, f.str || 0, f.total || 0,
        f.sur_rtr || 0, f.sur_str || 0, f.surv || f.total_sur || 0,
        f.lrd_rtr || 0, f.lrd_str || 0, f.lrd || f.total_lrd || 0,
        f.dis_rtr || 0, f.dis_str || 0, f.dis || f.total_dis || 0,
        f.thl_rtr || 0, f.thl_str || 0, f.thl || f.total_thl || 0,
        f.vao_rtr || 0, f.vao_str || 0, f.vao || f.total_vao || 0
      ]);
    }
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pending Report');
    return wb;
  }

  function handleExportExcel() {
    const optType = document.querySelector('input[name="tnOptType"]:checked')?.value || 'N';
    const serviceGroup = document.querySelector('input[name="tnServiceGroup"]:checked')?.value || 'OPT';
    const isRuralIsd = serviceGroup === 'OPT' && optType === 'I';

    // If exporting ISD Rural with raw applications, download the 3 day-range files (30d+, 25-29d, <25d)
    if (isRuralIsd && currentReportData && Array.isArray(currentReportData.applications) && currentReportData.applications.length > 0) {
      const rawApps = currentReportData.applications;
      const b30 = [], b25 = [], bBelow25 = [];
      rawApps.forEach(app => {
        const days = calculatePendingDays(app);
        if (days >= 30) b30.push(app);
        else if (days >= 25) b25.push(app);
        else bBelow25.push(app);
      });
      const isd30 = groupAppsByVillageForISD(b30);
      const isd25 = groupAppsByVillageForISD(b25);
      const isdBelow25 = groupAppsByVillageForISD(bBelow25);

      if (typeof window.XLSX !== 'undefined') {
        const wbBelow25 = buildVillageOptWorkbook(isdBelow25, `OPT PENDING - 25 DAYS BELOW (${bBelow25.length} apps)`);
        const wb25 = buildVillageOptWorkbook(isd25, `OPT PENDING - 25 DAYS ABOVE (${b25.length} apps)`);
        const wb30 = buildVillageOptWorkbook(isd30, `OPT PENDING - 30 DAYS ABOVE (${b30.length} apps)`);

        XLSX.writeFile(wbBelow25, `TamilNilam_ISD_Rural_25DaysBelow.xlsx`);
        setTimeout(() => XLSX.writeFile(wb25, `TamilNilam_ISD_Rural_25DaysAbove.xlsx`), 300);
        setTimeout(() => XLSX.writeFile(wb30, `TamilNilam_ISD_Rural_30DaysAbove.xlsx`), 600);
        showStatus(`✓ Exported 3 files: 25 Days below (${bBelow25.length}), 25 Days above (${b25.length}), 30 Days above (${b30.length})`, 'ok');
        return;
      }
    }

    const table = document.getElementById('tnExportTable');
    if (!table) return;

    if (typeof window.XLSX !== 'undefined') {
      const wb = XLSX.utils.table_to_book(table, { sheet: 'Pending Report' });
      const ws = wb.Sheets['Pending Report'];
      if (ws && ws['!ref']) {
        ws['!cols'] = ws['!cols'] || [];
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = ws[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
          if (cell && cell.v && /survey/i.test(String(cell.v))) {
            ws['!cols'][C] = { wch: 28 };
          }
        }
      }
      const filename = `TamilNilam_Report_${document.getElementById('tnFromDate').value}_to_${document.getElementById('tnToDate').value}.xlsx`;
      XLSX.writeFile(wb, filename);
    } else {
      const html = table.outerHTML;
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `TamilNilam_Report.xls`;
      a.click();
    }
  }

  window.handleExportExcel = handleExportExcel;
  window.exportAppIdsExcel = window.exportAppIdsExcel || function() {
    if (typeof window.exportIsdApplicationsExcel === 'function') {
      return window.exportIsdApplicationsExcel(window.TALUK);
    }
  };
  window.exportToExcel = window.exportToExcel || function() {
    if (typeof window.exportIsdApplicationsExcel === 'function') {
      return window.exportIsdApplicationsExcel(window.TALUK);
    } else {
      return handleExportExcel();
    }
  };

  async function ensureVillageAndVaoDetails(allVillages, explicitTaluk) {
    if (!window.store) window.store = {};
    const list = Array.from(new Set(allVillages.map(v => String(v || '').trim()))).filter(Boolean);
    if (!list.length) return;
    const rawTName = explicitTaluk || window.TALUK || (typeof window.talukName === 'function' ? window.talukName() : '') || 'Arakkonam';
    const tName = cleanTalukTitle(rawTName);

    const existingVillageRows = window.store.village?.objs || [];
    const hasCurrentTalukVillages = existingVillageRows.some(r => {
      const rowTaluk = r.Taluk || r.taluk || '';
      return (rowTaluk && norm(rowTaluk) === norm(tName)) || list.includes(r['Village Name'] || r.Village);
    });

    if (!window.store.village || !hasCurrentTalukVillages) {
      const vRows = list.map(v => ({ 'Village Name': v, 'Taluk': tName, 'Surveyor Name': 'Surveyor' }));
      const otherTalukRows = existingVillageRows.filter(r => {
        const rowTaluk = r.Taluk || r.taluk || '';
        return rowTaluk && norm(rowTaluk) !== norm(tName) && !list.includes(r['Village Name'] || r.Village);
      });
      const data = {
        name: `Auto Village Details (${tName})`,
        taluk: tName,
        header: ['Village Name', 'Taluk', 'Surveyor Name'],
        objs: [...otherTalukRows, ...vRows]
      };
      window.store.village = data;
      if (typeof window.markLoaded === 'function') {
        window.markLoaded('village', data.name, vRows.length, false);
      }
      if (typeof window.saveToCloud === 'function') {
        try {
          const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
          blob.name = `TamilNilam_Auto_Village_Details_${tName}.json`;
          window.saveToCloud('village', blob, data, tName);
        } catch (e) {}
      }
    }

    const existingVaoRows = window.store.vaoDetails?.objs || [];
    const hasCurrentTalukVao = existingVaoRows.some(r => {
      const rowTaluk = r.Taluk || r.taluk || '';
      return (rowTaluk && norm(rowTaluk) === norm(tName)) || list.includes(r['Village Name'] || r.Village);
    });

    if (!window.store.vaoDetails || !hasCurrentTalukVao) {
      const vaoRows = list.map(v => ({ 'Village Name': v, 'Taluk': tName, 'VAO Name': 'VAO' }));
      const otherTalukVao = existingVaoRows.filter(r => {
        const rowTaluk = r.Taluk || r.taluk || '';
        return rowTaluk && norm(rowTaluk) !== norm(tName) && !list.includes(r['Village Name'] || r.Village);
      });
      const data = {
        name: `Auto VAO Details (${tName})`,
        taluk: tName,
        header: ['Village Name', 'Taluk', 'VAO Name'],
        objs: [...otherTalukVao, ...vaoRows]
      };
      window.store.vaoDetails = data;
      if (typeof window.markLoaded === 'function') {
        window.markLoaded('vaoDetails', data.name, vaoRows.length, false);
      }
      if (typeof window.saveToCloud === 'function') {
        try {
          const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
          blob.name = `TamilNilam_Auto_VAO_Details_${tName}.json`;
          window.saveToCloud('vaoDetails', blob, data, tName);
        } catch (e) {}
      }
    }
  }
  window.ensureVillageAndVaoDetails = ensureVillageAndVaoDetails;

  async function handleApplyToDashboard() {
    if (!currentReportData) {
      showStatus('Please click Submit to fetch the report first.', 'error');
      return;
    }

    const talukSel = document.getElementById('tnTalukSel') || document.getElementById('talukSel') || document.getElementById('tnFFTalukSel');
    const talukCode = talukSel ? talukSel.value : '';
    const talukOption = talukSel && talukSel.options && talukSel.selectedIndex >= 0 ? talukSel.options[talukSel.selectedIndex] : null;
    const rawTalukText = talukOption ? talukOption.text : (talukSel ? talukSel.value : '');
    const talukName = resolveTalukName(rawTalukText) || (typeof window.cleanTalukName === 'function' ? window.cleanTalukName(rawTalukText) : rawTalukText) || (typeof window.talukName === 'function' ? window.talukName() : window.TALUK) || 'Nemili';

    // Synchronize active taluk with dashboard
    window.TALUK = talukName;
    try { localStorage.setItem('village_test.selectedTaluk.v1', talukName); } catch (e) {}
    const topTalukSel = document.getElementById('talukSel');
    if (topTalukSel) setSelectByTaluk(topTalukSel, talukName);
    if (typeof window.refreshTitles === 'function') window.refreshTitles();

    const serviceGroup = currentReportData.serviceGroup || 'OPT';
    const landCategory = currentReportData.landCategory || 'rural';

    if (serviceGroup === 'ISD_PDF') {
      try {
        if (!window.store) window.store = {};
        const vMap = new Map();
        (currentReportData.villages || []).forEach(v => {
          if (v.village) vMap.set(v.village, v);
        });
        const parsedPdf = {
          name: `TamilNilam_Auto_ISD_Status_${talukName}.json`,
          villages: vMap,
          grand: currentReportData.grand || {}
        };
        window.store['isdRuralPdf'] = parsedPdf;

        ensureVillageAndVaoDetails(Array.from(vMap.keys()), talukName);

        if (typeof window.markLoaded === 'function') window.markLoaded('isdRuralPdf', parsedPdf.name, vMap.size, false);
        if (typeof window.updateRail === 'function') window.updateRail();
        if (typeof window.render === 'function') window.render();

        if (typeof window.saveToCloud === 'function') {
          try {
            const fileName = `TamilNilam_Auto_ISD_Status_${talukName}.json`;
            const blob = new Blob([JSON.stringify({ villages: Array.from(vMap.values()), grand: parsedPdf.grand })], { type: 'application/json' });
            blob.name = fileName;
            await window.saveToCloud('isdRuralPdf', blob, parsedPdf, talukName);
          } catch (cloudErr) {
            console.warn('Supabase cloud save note:', cloudErr);
          }
        }
        showStatus(`✓ Auto-loaded & Saved: ${vMap.size} villages ISD Status into Dashboard!`, 'info');
        if (typeof window.toast === 'function') window.toast('ISD Status Loaded', `Saved ${vMap.size} villages to dashboard & cloud!`, 'ok');
      } catch (err) {
        showStatus(`Failed to apply ISD Status: ${err.message}`, 'error');
      }
      return;
    }

    let rawApps = currentReportData.applications || [];
    rawApps = filterAppsByTaluk(rawApps, talukCode, talukName);

    if (!rawApps.length) {
      showStatus('No individual applications found for the selected Taluk to distribute into date buckets. Make sure Report Format is set to "Detailed Applications".', 'error');
      return;
    }

    const fromDate = document.getElementById('tnFromDate').value.trim();
    const toDate = document.getElementById('tnToDate').value.trim();
    const period = currentReportData.period || `APPLICATION FROM: ${fromDate} TO: ${toDate}`;
    const asOn = currentReportData.asOn ? `AND PENDING AS ON: ${currentReportData.asOn}` : '';

    try {
      if (!window.store) window.store = {};
      const allAppVillages = Array.from(new Set(rawApps.map(a => (a.village_name || a.village || '').trim()))).filter(Boolean);
      ensureVillageAndVaoDetails(allAppVillages, talukName);

      if (serviceGroup === 'FLINE') {
        const reportType = currentReportData.reportType || 'FLINE';
        showStatus(`Processing ${rawApps.length} F-Line applications & syncing to dashboard...`, 'info');

        const villageMap = new Map();
        rawApps.forEach(app => {
          const v = (app.village_name || 'Unknown').trim();
          villageMap.set(v, (villageMap.get(v) || 0) + 1);
        });

        const rows = Array.from(villageMap.entries()).map(([village, count]) => ({
          village,
          rtr: 0,
          str: count,
          total: count
        }));

        const flineData = {
          name: `Auto F-Line ${reportType} (${landCategory.toUpperCase()}) - ${rawApps.length} apps`,
          header: ['Village Name', 'Application Date', 'Pending At', 'Number of days pending', 'Application Status'],
          objs: rawApps.map(a => ({
            'Village Name': (a.village_name || a.village || 'Unknown').trim(),
            'Application Date': a.appl_date || a.appl_dt || '',
            'Pending At': a.pending_at || 'Surveyor',
            'Number of days pending': a.pending_days || a.total_pending || a.opt_days || '0',
            'Application Status': (a.appl_status || a.status || a.application_status || 'Pending').trim()
          })),
          rows,
          period,
          asOn
        };

        const storeKey = landCategory === 'natham' ? 'flineNatham' : 'flineRural';
        window.store[storeKey] = flineData;

        if (typeof window.markLoaded === 'function') {
          window.markLoaded(storeKey, flineData.name, rows.length, false);
        }

        if (typeof window.updateRail === 'function') window.updateRail();
        if (typeof window.render === 'function') window.render();

        // Auto-save to Supabase Cloud
        if (typeof window.saveToCloud === 'function') {
          try {
            showStatus('Syncing & replacing F-Line dataset in Supabase Cloud...', 'info');
            const blob = new Blob([JSON.stringify(flineData)], { type: 'application/json' });
            blob.name = `TamilNilam_Auto_FLINE_${landCategory}_${reportType}_${talukName}.json`;
            await window.saveToCloud(storeKey, blob, flineData, talukName);
          } catch (cloudErr) {
            console.warn('Supabase cloud save note:', cloudErr);
          }
        }

        showStatus(`✓ Auto-loaded & Saved to Supabase: ${rawApps.length} F-Line (${landCategory.toUpperCase()}) applications across ${rows.length} villages!`, 'info');
        if (typeof window.toast === 'function') {
          window.toast('F-Line Dashboard Loaded & Saved', `${rawApps.length} apps across ${rows.length} villages`, 'ok');
        }

        setTimeout(() => {
          const backdrop = document.getElementById('tnModalBackdrop');
          if (backdrop) backdrop.classList.remove('open');
        }, 1600);
        return;
      }

      // OPT SERVICE GROUP
      const optType = document.querySelector('input[name="tnOptType"]:checked')?.value || 'N';

      if (optType === 'I') {
        showStatus('Calculating application pendency & sorting into 30d+ / 25-29d / <25d ISD buckets...', 'info');

        const bucket30Above = [];
        const bucket25Above = [];
        const bucket25Below = [];

        rawApps.forEach(app => {
          const days = calculatePendingDays(app);
          if (days >= 30) {
            bucket30Above.push(app);
          } else if (days >= 25) {
            bucket25Above.push(app);
          } else {
            bucket25Below.push(app);
          }
        });

        const isd30 = groupAppsByVillageForISD(bucket30Above);
        const isd25 = groupAppsByVillageForISD(bucket25Above);
        const isdBelow25 = groupAppsByVillageForISD(bucket25Below);

        const dataBelow25 = {
          name: `Auto <25 Days (${bucket25Below.length} apps)`,
          rows: isdBelow25.rows,
          footer: isdBelow25.footer,
          period,
          asOn
        };
        const data25Above = {
          name: `Auto 25-29 Days (${bucket25Above.length} apps)`,
          rows: isd25.rows,
          footer: isd25.footer,
          period,
          asOn
        };
        const data30Above = {
          name: `Auto 30+ Days (${bucket30Above.length} apps)`,
          rows: isd30.rows,
          footer: isd30.footer,
          period,
          asOn
        };

        if (bucket25Below.length > 0 || !window.store['opt0']) {
          window.store['opt0'] = dataBelow25;
          window.store['opt_0_0'] = dataBelow25;
          if (typeof window.markLoaded === 'function') {
            window.markLoaded('opt0', dataBelow25.name, isdBelow25.rows.length, false);
          }
        }
        if (bucket25Above.length > 0 || !window.store['opt1']) {
          window.store['opt1'] = data25Above;
          window.store['opt_0_1'] = data25Above;
          if (typeof window.markLoaded === 'function') {
            window.markLoaded('opt1', data25Above.name, isd25.rows.length, false);
          }
        }
        if (bucket30Above.length > 0 || !window.store['opt2']) {
          window.store['opt2'] = data30Above;
          window.store['opt_0_2'] = data30Above;
          if (typeof window.markLoaded === 'function') {
            window.markLoaded('opt2', data30Above.name, isd30.rows.length, false);
          }
        }

        // Auto-pull ISD Rural Application Status (drilldowntasildar) if rural
        if (landCategory === 'rural') {
          try {
            showStatus('Pulling ISD Rural Application Status from drilldowntasildar (Tahsildar login)...', 'info');
            const secCreds = getTnCreds('secondary', talukName);
            const isdStatusUrl = `/api/nisd-rural?mode=isd_status&distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}&talukName=${encodeURIComponent(talukName)}&username=${encodeURIComponent(secCreds.username)}&password=${encodeURIComponent(secCreds.password)}&roleId=${encodeURIComponent(secCreds.roleId)}&fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`;
            const stRes = await fetch(isdStatusUrl).then(r => r.json());
            if (stRes && stRes.success && Array.isArray(stRes.villages)) {
              const vMap = new Map();
              stRes.villages.forEach(v => vMap.set(v.village, v));
              const parsedPdf = {
                name: `TamilNilam_Auto_ISD_Status_${talukName}.json`,
                villages: vMap,
                grand: stRes.grand || {}
              };
              window.store['isdRuralPdf'] = parsedPdf;
              if (typeof window.markLoaded === 'function') {
                window.markLoaded('isdRuralPdf', parsedPdf.name, vMap.size, false);
              }
              if (typeof window.saveToCloud === 'function') {
                try {
                  const blob = new Blob([JSON.stringify(stRes)], { type: 'application/json' });
                  blob.name = parsedPdf.name;
                  await window.saveToCloud('isdRuralPdf', blob, parsedPdf, talukName);
                } catch(e) {}
              }
            }
          } catch(errStatus) {
            console.warn('ISD status fetch note:', errStatus);
          }
        }

        if (typeof window.updateRail === 'function') window.updateRail();
        if (typeof window.render === 'function') window.render();

        // Auto-save to Supabase Cloud if available
        if (typeof window.saveToCloud === 'function') {
          try {
            showStatus('Syncing & replacing dataset in Supabase Cloud...', 'info');
            const slots = [
              { kind: 'opt0', data: dataBelow25, name: `TamilNilam_Auto_ISD_${landCategory}_Below25Days_${talukName}.json` },
              { kind: 'opt1', data: data25Above, name: `TamilNilam_Auto_ISD_${landCategory}_25to29Days_${talukName}.json` },
              { kind: 'opt2', data: data30Above, name: `TamilNilam_Auto_ISD_${landCategory}_30DaysAbove_${talukName}.json` }
            ];
            for (const s of slots) {
              const blob = new Blob([JSON.stringify(s.data)], { type: 'application/json' });
              blob.name = s.name;
              await window.saveToCloud(s.kind, blob, s.data, talukName);
            }
          } catch (cloudErr) {
            console.warn('Supabase cloud save note:', cloudErr);
          }
        }

        showStatus(`✓ Auto-loaded & Saved to Supabase: ${bucket30Above.length} apps into 30+ Days, ${bucket25Above.length} apps into 25-29 Days, ${bucket25Below.length} apps into <25 Days!`, 'info');
        if (typeof window.toast === 'function') {
          window.toast('ISD Dashboard Loaded & Saved', `≥30d: ${bucket30Above.length} | 25-29d: ${bucket25Above.length} | <25d: ${bucket25Below.length}`, 'ok');
        }

      } else {
        showStatus('Filtering VAO pending applications & sorting into 12d / 10d / <10d NISD buckets...', 'info');

        // NISD: Filter VAO-only pending applications, ignoring HQDT, ZDT, etc.
        const vaoApps = rawApps.filter(app => {
          const role = String(app.role_name || app.pending_at || '').trim().toUpperCase();
          return role === 'VAO' || role.includes('VAO');
        });

        const bucket12 = [];
        const bucket10 = [];
        const bucketBelow10 = [];

        vaoApps.forEach(app => {
          const days = calculatePendingDays(app);
          if (days >= 12) {
            bucket12.push(app);
          } else if (days >= 10) {
            bucket10.push(app);
          } else {
            bucketBelow10.push(app);
          }
        });

        const rows12 = groupAppsByVillage(bucket12);
        const rows10 = groupAppsByVillage(bucket10);
        const rowsBelow10 = groupAppsByVillage(bucketBelow10);

        const data12 = {
          name: `Auto 12 Days (${bucket12.length} VAO apps)`,
          rows: rows12,
          footer: null,
          period,
          asOn
        };
        const data10 = {
          name: `Auto 10 Days (${bucket10.length} VAO apps)`,
          rows: rows10,
          footer: null,
          period,
          asOn
        };
        const dataBelow10 = {
          name: `Auto <10 Days (${bucketBelow10.length} VAO apps)`,
          rows: rowsBelow10,
          footer: null,
          period,
          asOn
        };

        window.store['nisd_0_0'] = data12;
        window.store['nisd0'] = data12;

        window.store['nisd_0_1'] = data10;
        window.store['nisd1'] = data10;

        window.store['nisd_0_2'] = dataBelow10;
        window.store['nisd2'] = dataBelow10;

        const nisd1DetailObj = {
          name: `Auto NISD Natham (${vaoApps.length} VAO apps)`,
          header: ['Village Name', 'Application Date', 'Pending At', 'RTR-STR', 'Application Status'],
          objs: vaoApps.map(app => ({
            'Village Name': (app.village_name || app.village || 'Unknown').trim(),
            'Application Date': app.appl_date || app.appl_dt || '',
            'Pending At': app.role_name || app.pending_at || 'VAO',
            'RTR-STR': 'STR',
            'Application Status': 'Pending'
          }))
        };
        window.store['nisd_1'] = nisd1DetailObj;

        if (!window.store.nisdFirka) {
          const allVillages = Array.from(new Set([
            ...rows12.map(r => r.village),
            ...rows10.map(r => r.village),
            ...rowsBelow10.map(r => r.village)
          ])).filter(Boolean);

          window.store.nisdFirka = {
            name: 'Auto Village Firka',
            rows: allVillages.map(v => ({ village: v, firka: 'General' }))
          };
          if (typeof window.markLoaded === 'function') {
            window.markLoaded('nisdFirka', window.store.nisdFirka.name, allVillages.length, false);
          }
        }

        if (typeof window.markLoaded === 'function') {
          window.markLoaded('nisd_0_0', data12.name, rows12.length, false);
          window.markLoaded('nisd0', data12.name, rows12.length, false);
          window.markLoaded('nisd_0_1', data10.name, rows10.length, false);
          window.markLoaded('nisd1', data10.name, rows10.length, false);
          window.markLoaded('nisd_0_2', dataBelow10.name, rowsBelow10.length, false);
          window.markLoaded('nisd2', dataBelow10.name, rowsBelow10.length, false);
          window.markLoaded('nisd_1', nisd1DetailObj.name, nisd1DetailObj.objs.length, false);
        }

        if (typeof window.renderNisdDrops === 'function') window.renderNisdDrops();
        if (typeof window.updateRail === 'function') window.updateRail();
        if (typeof window.render === 'function') window.render();

        // Auto-save to Supabase Cloud if available
        if (typeof window.saveToCloud === 'function') {
          try {
            showStatus('Syncing & replacing dataset in Supabase Cloud...', 'info');
            const slots = [];
            if (landCategory === 'natham') {
              slots.push({ kind: 'nisd_1', data: nisd1DetailObj, name: `TamilNilam_Auto_NISD_Natham_${talukName}.json` });
            } else {
              slots.push(
                { kind: 'nisd_0_0', data: data12, name: `TamilNilam_Auto_NISD_Rural_12DaysAbove_${talukName}.json` },
                { kind: 'nisd_0_1', data: data10, name: `TamilNilam_Auto_NISD_Rural_10to11Days_${talukName}.json` },
                { kind: 'nisd_0_2', data: dataBelow10, name: `TamilNilam_Auto_NISD_Rural_Below10Days_${talukName}.json` }
              );
            }
            if (window.store.nisdFirka) {
              slots.push({ kind: 'nisdFirka', data: window.store.nisdFirka, name: `TamilNilam_Auto_NISD_${landCategory}_Village_Firka_${talukName}.json` });
            }
            for (const s of slots) {
              const blob = new Blob([JSON.stringify(s.data)], { type: 'application/json' });
              blob.name = s.name;
              await window.saveToCloud(s.kind, blob, s.data, talukName);
            }
          } catch (cloudErr) {
            console.warn('Supabase cloud save note:', cloudErr);
          }
        }

        showStatus(`✓ Auto-loaded & Saved to Supabase (VAO-only): ${bucket12.length} apps into 12 Days, ${bucket10.length} apps into 10 Days, ${bucketBelow10.length} apps into <10 Days!`, 'info');
        if (typeof window.toast === 'function') {
          window.toast('NISD Dashboard Loaded & Saved', `VAO ≥12d: ${bucket12.length} | 10-11d: ${bucket10.length} | <10d: ${bucketBelow10.length}`, 'ok');
        }
      }

      setTimeout(() => {
        const backdrop = document.getElementById('tnModalBackdrop');
        if (backdrop) backdrop.classList.remove('open');
      }, 1600);

    } catch (err) {
      console.error('Apply error:', err);
      showStatus(`Failed to apply to dashboard: ${err.message}`, 'error');
    }
  }

  function norm(str) {
    return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function filterAppsByTaluk(applications, talukCode, talukName) {
    if (!Array.isArray(applications)) return [];
    const targetCode = String(talukCode || '').trim();
    let targetNameClean = String(talukName || '').replace(/\(\d+\)/g, '').trim();
    let targetNameNorm = norm(targetNameClean);
    if (targetNameNorm.includes('all')) targetNameNorm = '';

    if (!targetCode && !targetNameNorm) return applications;

    return applications.filter(app => {
      const appTalukCode = String(
        app.taluk_code || app.talukcode || app.talukCode || app.taluk_no || app.taluk_id || app.talukno || ''
      ).trim();
      if (appTalukCode && targetCode) {
        if (parseInt(appTalukCode, 10) !== parseInt(targetCode, 10)) return false;
      }
      const appTalukNameNorm = norm(app.taluk_name || app.talukname || app.talukName || app.taluk || '');
      if (appTalukNameNorm && targetNameNorm) {
        if (appTalukNameNorm !== targetNameNorm && !appTalukNameNorm.includes(targetNameNorm) && !targetNameNorm.includes(appTalukNameNorm)) {
          return false;
        }
      }
      return true;
    });
  }

  async function handleFlashFillExecute() {
    const btn = document.getElementById('tnFFRunBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '⏳ Pulling Selected Reports...';
    }

    const talukSel = document.getElementById('tnFFTalukSel') || document.getElementById('talukSel') || document.getElementById('tnTalukSel');
    const talukOption = talukSel && talukSel.options && talukSel.selectedIndex >= 0 ? talukSel.options[talukSel.selectedIndex] : null;
    const rawTalukName = talukOption ? talukOption.text : (talukSel?.value || 'Nemili');
    const talukName = cleanTalukTitle(rawTalukName);
    const talukCode = resolveTalukCode(talukSel?.value || talukName);
    const distCode = document.getElementById('tnDistSel')?.value || '37';

    const creds = getTnCreds();
    if (!creds || !creds.username) {
      if (typeof window.toast === 'function') {
        window.toast('Credentials Required', 'Please configure username and password in Admin settings.', 'warn');
      } else {
        alert('Tamil Nilam credentials not found. Please configure username and password in Admin settings.');
      }
      if (btn) { btn.disabled = false; btn.innerHTML = '⚡ Run Flash Fill (Selected Reports)'; }
      return;
    }

    const formatD = d => String(d.getDate()).padStart(2, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear();
    const defaultToDate = formatD(new Date());

    const getRowDates = (prefix) => {
      const from = document.getElementById(`ff_from_${prefix}`)?.value?.trim() || '01-01-2025';
      const to = document.getElementById(`ff_to_${prefix}`)?.value?.trim() || defaultToDate;
      return { fromDate: from, toDate: to };
    };

    const isChk = (prefix) => document.getElementById(`ff_chk_${prefix}`)?.checked;
    const setStatus = (prefix, text, cls) => {
      const el = document.getElementById(`ff_status_${prefix}`);
      if (el) { el.textContent = text; el.className = `tn-ff-status-badge ${cls}`; }
    };

    const credParams = `username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}&roleId=${encodeURIComponent(creds.roleId)}&distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}&villageCode=&mode=fetch_raw`;

    if (typeof window.toast === 'function') {
      window.toast('⚡ Flash Fill Started', `Pulling selected reports strictly for ${talukName}...`, 'info');
    }
    showStatus(`⚡ Flash Filling selected reports for ${talukName}...`, 'info');

    try {
      let summaryStats = [];
      const fetchTasks = [];

      // 0. ISD Rural Application Status (PDF)
      if (isChk('isd_rural_pdf')) {
        setStatus('isd_rural_pdf', 'Pulling PDF...', 'loading');
        const { fromDate, toDate } = getRowDates('isd_rural_pdf');
        const secCreds = getTnCreds('secondary', talukName);
        const isdStatusParams = `username=${encodeURIComponent(secCreds.username)}&password=${encodeURIComponent(secCreds.password)}&roleId=${encodeURIComponent(secCreds.roleId)}&distCode=${encodeURIComponent(distCode)}&talukCode=${encodeURIComponent(talukCode)}&talukName=${encodeURIComponent(talukName)}&mode=isd_status&fromDate=${fromDate}&toDate=${toDate}`;
        fetchTasks.push(
          fetch(`/api/nisd-rural?${isdStatusParams}`)
            .then(r => r.json())
            .then(res => ({ key: 'isd_rural_pdf', res, fromDate, toDate }))
            .catch(e => ({ key: 'isd_rural_pdf', error: e.message }))
        );
      }

      // 1. NISD Rural
      if (isChk('nisd_rural')) {
        setStatus('nisd_rural', 'Pulling...', 'loading');
        const { fromDate, toDate } = getRowDates('nisd_rural');
        fetchTasks.push(
          fetch(`/api/nisd-rural?landCategory=rural&flag=N&fromDate=${fromDate}&toDate=${toDate}&${credParams}`)
            .then(r => r.json())
            .then(res => ({ key: 'nisd_rural', res, fromDate, toDate }))
            .catch(e => ({ key: 'nisd_rural', error: e.message }))
        );
      }

      // 2. ISD Rural (OPT applications)
      if (isChk('isd_rural')) {
        setStatus('isd_rural', 'Pulling...', 'loading');
        const { fromDate, toDate } = getRowDates('isd_rural');
        fetchTasks.push(
          fetch(`/api/nisd-rural?landCategory=rural&flag=I&fromDate=${fromDate}&toDate=${toDate}&${credParams}`)
            .then(r => r.json())
            .then(res => ({ key: 'isd_rural', res, fromDate, toDate }))
            .catch(e => ({ key: 'isd_rural', error: e.message }))
        );
      }

      // 3. NISD Natham
      if (isChk('nisd_natham')) {
        setStatus('nisd_natham', 'Pulling...', 'loading');
        const { fromDate, toDate } = getRowDates('nisd_natham');
        fetchTasks.push(
          fetch(`/api/nisd-rural?landCategory=natham&flag=N&fromDate=${fromDate}&toDate=${toDate}&${credParams}`)
            .then(r => r.json())
            .then(res => ({ key: 'nisd_natham', res, fromDate, toDate }))
            .catch(e => ({ key: 'nisd_natham', error: e.message }))
        );
      }

      // 4. ISD Natham
      if (isChk('isd_natham')) {
        setStatus('isd_natham', 'Pulling...', 'loading');
        const { fromDate, toDate } = getRowDates('isd_natham');
        fetchTasks.push(
          fetch(`/api/nisd-rural?landCategory=natham&flag=I&fromDate=${fromDate}&toDate=${toDate}&${credParams}`)
            .then(r => r.json())
            .then(res => ({ key: 'isd_natham', res, fromDate, toDate }))
            .catch(e => ({ key: 'isd_natham', error: e.message }))
        );
      }

      // 5. F-Line Rural
      if (isChk('fline_rural')) {
        setStatus('fline_rural', 'Pulling...', 'loading');
        const { fromDate, toDate } = getRowDates('fline_rural');
        const type = document.getElementById('ff_type_fline_rural')?.value || 'FLINE';
        const stmt = document.getElementById('ff_stmt_fline_rural')?.value || 'Current';
        fetchTasks.push(
          fetch(`/api/fline?landCategory=rural&reportType=${type}&stmtFlag=${stmt}&fromDate=${fromDate}&toDate=${toDate}&${credParams}`)
            .then(r => r.json())
            .then(res => ({ key: 'fline_rural', res, fromDate, toDate, type }))
            .catch(e => ({ key: 'fline_rural', error: e.message }))
        );
      }

      // 6. F-Line Natham
      if (isChk('fline_natham')) {
        setStatus('fline_natham', 'Pulling...', 'loading');
        const { fromDate, toDate } = getRowDates('fline_natham');
        const type = document.getElementById('ff_type_fline_natham')?.value || 'FLINE';
        const stmt = document.getElementById('ff_stmt_fline_natham')?.value || 'Current';
        fetchTasks.push(
          fetch(`/api/fline?landCategory=natham&reportType=${type}&stmtFlag=${stmt}&fromDate=${fromDate}&toDate=${toDate}&${credParams}`)
            .then(r => r.json())
            .then(res => ({ key: 'fline_natham', res, fromDate, toDate, type }))
            .catch(e => ({ key: 'fline_natham', error: e.message }))
        );
      }

      const results = await Promise.all(fetchTasks);

      if (!window.store) window.store = {};
      const allAppVillages = [];

      results.forEach(item => {
        if (item.error || !item.res || !item.res.success) {
          setStatus(item.key, 'Error', 'err');
          return;
        }

        // Apply strict taluk filter
        const rawApps = filterAppsByTaluk(item.res.applications || [], talukCode, talukName);
        rawApps.forEach(a => { const v = a.village_name || a.village; if (v) allAppVillages.push(v); });

        // Process per key
        if (item.key === 'nisd_rural') {
          const vaoApps = rawApps.filter(app => {
            const role = String(app.role_name || app.pending_at || '').trim().toUpperCase();
            return role === 'VAO' || role.includes('VAO');
          });
          const b12 = [], b10 = [], bBelow10 = [];
          vaoApps.forEach(app => {
            const days = calculatePendingDays(app);
            if (days >= 12) b12.push(app); else if (days >= 10) b10.push(app); else bBelow10.push(app);
          });
          const r12 = groupAppsByVillage(b12), r10 = groupAppsByVillage(b10), rBelow10 = groupAppsByVillage(bBelow10);
          const d12 = { name: `Auto 12 Days (${b12.length} VAO apps)`, rows: r12, period: `APPLICATION FROM: ${item.fromDate} TO: ${item.toDate}` };
          const d10 = { name: `Auto 10 Days (${b10.length} VAO apps)`, rows: r10, period: `APPLICATION FROM: ${item.fromDate} TO: ${item.toDate}` };
          const dBelow10 = { name: `Auto <10 Days (${bBelow10.length} VAO apps)`, rows: rBelow10, period: `APPLICATION FROM: ${item.fromDate} TO: ${item.toDate}` };

          window.store['nisd_0_0'] = d12; window.store['nisd0'] = d12;
          window.store['nisd_0_1'] = d10; window.store['nisd1'] = d10;
          window.store['nisd_0_2'] = dBelow10; window.store['nisd2'] = dBelow10;

          if (typeof window.markLoaded === 'function') {
            window.markLoaded('nisd_0_0', d12.name, r12.length, false);
            window.markLoaded('nisd_0_1', d10.name, r10.length, false);
            window.markLoaded('nisd_0_2', dBelow10.name, rBelow10.length, false);
          }
          setStatus('nisd_rural', `✓ ${vaoApps.length} VAO apps`, 'ok');
          summaryStats.push(`NISD Rural: ${vaoApps.length} VAO apps`);
        }

        if (item.key === 'isd_rural_pdf') {
          if (item.res && item.res.success && Array.isArray(item.res.villages)) {
            const vMap = new Map();
            const existing = window.store['isdRuralPdf'];
            const existingMap = (existing && existing.villages instanceof Map)
              ? existing.villages
              : (existing && Array.isArray(existing.villages)
                  ? new Map(existing.villages.map(v => [v.village, v]))
                  : new Map());

            item.res.villages.forEach(v => {
              if (v.village) {
                if (v.approved === 0 && v.rejected === 0 && existingMap.has(v.village)) {
                  const ev = existingMap.get(v.village);
                  if ((ev.approved || 0) > 0 || (ev.rejected || 0) > 0) {
                    v.approved = ev.approved || 0;
                    v.rejected = ev.rejected || 0;
                    v.returned = ev.returned || 0;
                    v.total = v.approved + (v.pending || 0) + v.rejected + v.returned;
                    if (ev.inv) {
                      v.inv = v.inv || {};
                      v.inv.approved = ev.inv.approved || 0;
                      v.inv.rejected = ev.inv.rejected || 0;
                      v.inv.returned = ev.inv.returned || 0;
                      v.inv.total = (v.inv.approved || 0) + (v.inv.pending || 0) + (v.inv.rejected || 0) + (v.inv.returned || 0);
                    }
                    if (ev.notinv) {
                      v.notinv = v.notinv || {};
                      v.notinv.approved = ev.notinv.approved || 0;
                      v.notinv.rejected = ev.notinv.rejected || 0;
                      v.notinv.returned = ev.notinv.returned || 0;
                      v.notinv.total = (v.notinv.approved || 0) + (v.notinv.pending || 0) + (v.notinv.rejected || 0) + (v.notinv.returned || 0);
                    }
                  }
                }
                vMap.set(v.village, v);
                allAppVillages.push(v.village);
              }
            });

            existingMap.forEach((ev, evName) => {
              if (!vMap.has(evName)) {
                vMap.set(evName, ev);
              }
            });

            const grand = item.res.grand || {};
            if ((!grand.all || grand.all.approved === 0) && existing && existing.grand && existing.grand.all && existing.grand.all.approved > 0) {
              grand.all = grand.all || {};
              grand.all.approved = existing.grand.all.approved;
              grand.all.rejected = existing.grand.all.rejected;
              grand.all.returned = existing.grand.all.returned;
              grand.all.total = grand.all.approved + (grand.all.pending || 0) + grand.all.rejected + grand.all.returned;
            }

            const parsedPdf = {
              name: `TamilNilam_Auto_ISD_Status_${talukName}.json`,
              villages: vMap,
              grand: grand
            };
            window.store['isdRuralPdf'] = parsedPdf;
            if (typeof window.markLoaded === 'function') {
              window.markLoaded('isdRuralPdf', parsedPdf.name, vMap.size, false);
            }
            const grandPend = grand.all?.pending ?? 0;
            const grandAppr = grand.all?.approved ?? 0;
            const grandRej = grand.all?.rejected ?? 0;
            const grandInvPend = grand.inv?.pending ?? 0;
            const grandNotInvPend = grand.notinv?.pending ?? 0;
            setStatus('isd_rural_pdf', `✓ ${grandPend} Pend (${grandInvPend} Inv + ${grandNotInvPend} Not Inv) | ${grandAppr} Appr`, 'ok');
            summaryStats.push(`ISD Rural PDF: ${grandPend} pending, ${grandAppr} approved, ${grandRej} rejected across ${vMap.size} villages`);
          } else {
            setStatus('isd_rural_pdf', 'Error: ' + (item.res?.error || 'Failed'), 'err');
          }
        }

        if (item.key === 'isd_rural') {
          window.store['isd_raw_apps'] = rawApps;
          if (rawApps.length > 0) {
            const b30 = [], b25 = [], bBelow25 = [];
            rawApps.forEach(app => {
              const days = calculatePendingDays(app);
              if (days >= 30) b30.push(app); else if (days >= 25) b25.push(app); else bBelow25.push(app);
            });
            const isd30 = groupAppsByVillageForISD(b30), isd25 = groupAppsByVillageForISD(b25), isdBelow25 = groupAppsByVillageForISD(bBelow25);
            const dBelow25 = { name: `Auto <25 Days (${bBelow25.length} apps)`, rows: isdBelow25.rows, footer: isdBelow25.footer };
            const d25 = { name: `Auto 25-29 Days (${b25.length} apps)`, rows: isd25.rows, footer: isd25.footer };
            const d30 = { name: `Auto 30+ Days (${b30.length} apps)`, rows: isd30.rows, footer: isd30.footer };

            window.store['opt0'] = dBelow25; window.store['opt1'] = d25; window.store['opt2'] = d30;
            if (typeof window.markLoaded === 'function') {
              window.markLoaded('opt0', dBelow25.name, isdBelow25.rows.length, false);
              window.markLoaded('opt1', d25.name, isd25.rows.length, false);
              window.markLoaded('opt2', d30.name, isd30.rows.length, false);
            }

            setStatus('isd_rural', `✓ ${rawApps.length} apps`, 'ok');
            summaryStats.push(`ISD Rural: ${rawApps.length} apps`);
            if (typeof window.renderIsdAppDrilldownSection === 'function') {
              window.renderIsdAppDrilldownSection();
            }
          } else if (window.store['isdRuralPdf'] && window.store['isdRuralPdf'].villages) {
            const vList = (window.store['isdRuralPdf'].villages instanceof Map)
              ? Array.from(window.store['isdRuralPdf'].villages.values())
              : (Array.isArray(window.store['isdRuralPdf'].villages) ? window.store['isdRuralPdf'].villages : []);
            const synRows = vList.map(v => {
              const vName = v.village || '';
              const pend = (v.inv && v.inv.pending != null) ? v.inv.pending : (v.pending || 0);
              return {
                label: vName, village: vName, taluk: talukName,
                surv: pend, vao: 0, lrd: 0, dis: 0, thl: 0, all: pend,
                rtr: 0, str: pend, total: pend,
                total_sur: pend, total_vao: 0, total_lrd: 0, total_dis: 0, total_thl: 0
              };
            }).filter(r => r.total > 0);
            const synFooter = {
              label: 'Total', village: 'Total', taluk: talukName,
              surv: synRows.reduce((s, r) => s + r.surv, 0),
              vao: 0, lrd: 0, dis: 0, thl: 0,
              all: synRows.reduce((s, r) => s + r.all, 0),
              total: synRows.reduce((s, r) => s + r.total, 0),
              total_sur: synRows.reduce((s, r) => s + r.total_sur, 0),
              total_vao: 0, total_lrd: 0, total_dis: 0, total_thl: 0
            };
            const dBelow25 = { name: `Auto <25 Days (${synFooter.total} apps)`, rows: synRows, footer: synFooter };
            window.store['opt0'] = dBelow25;
            window.store['opt1'] = { name: `Auto 25-29 Days (0 apps)`, rows: [], footer: null };
            window.store['opt2'] = { name: `Auto 30+ Days (0 apps)`, rows: [], footer: null };
            if (typeof window.markLoaded === 'function') {
              window.markLoaded('opt0', dBelow25.name, synRows.length, false);
              window.markLoaded('opt1', window.store['opt1'].name, 0, false);
              window.markLoaded('opt2', window.store['opt2'].name, 0, false);
            }
            setStatus('isd_rural', `✓ ${synFooter.total} apps (from PDF)`, 'ok');
            summaryStats.push(`ISD Rural: ${synFooter.total} apps synthesized from PDF`);
          } else {
            setStatus('isd_rural', `0 apps`, 'warn');
          }
        }

        if (item.key === 'nisd_natham') {
          const vaoApps = rawApps.filter(app => {
            const role = String(app.role_name || app.pending_at || '').trim().toUpperCase();
            return role === 'VAO' || role.includes('VAO');
          });
          const b12 = [], b10 = [], bBelow10 = [];
          vaoApps.forEach(app => {
            const days = calculatePendingDays(app);
            if (days >= 12) b12.push(app); else if (days >= 10) b10.push(app); else bBelow10.push(app);
          });
          const r12 = groupAppsByVillage(b12), r10 = groupAppsByVillage(b10), rBelow10 = groupAppsByVillage(bBelow10);
          const d12 = { name: `Auto 12 Days Natham (${b12.length} VAO apps)`, rows: r12, period: `APPLICATION FROM: ${item.fromDate} TO: ${item.toDate}` };
          const d10 = { name: `Auto 10 Days Natham (${b10.length} VAO apps)`, rows: r10, period: `APPLICATION FROM: ${item.fromDate} TO: ${item.toDate}` };
          const dBelow10 = { name: `Auto <10 Days Natham (${bBelow10.length} VAO apps)`, rows: rBelow10, period: `APPLICATION FROM: ${item.fromDate} TO: ${item.toDate}` };

          window.store['nisd_1_0'] = d12; window.store['nisd_1_1'] = d10; window.store['nisd_1_2'] = dBelow10;
          const nisd1DetailObj = {
            name: `Auto NISD Natham (${vaoApps.length} VAO apps)`,
            header: ['Village Name', 'Application Date', 'Pending At', 'RTR-STR', 'Application Status'],
            objs: vaoApps.map(app => ({
              'Village Name': (app.village_name || app.village || 'Unknown').trim(),
              'Application Date': app.appl_date || app.appl_dt || '',
              'Pending At': app.role_name || app.pending_at || 'VAO',
              'RTR-STR': 'STR',
              'Application Status': 'Pending'
            })),
            period: `APPLICATION FROM: ${item.fromDate} TO: ${item.toDate}`,
            asOn: `AND PENDING AS ON: ${item.toDate}`
          };
          window.store['nisd_1'] = nisd1DetailObj;

          if (!window.store.nisdFirka) {
            const allVillages = Array.from(new Set(vaoApps.map(app => (app.village_name || app.village || '').trim()))).filter(Boolean);
            window.store.nisdFirka = {
              name: `Auto Village Firka (${talukName})`,
              rows: allVillages.map(v => ({ village: v, firka: 'General' }))
            };
            if (typeof window.markLoaded === 'function') {
              window.markLoaded('nisdFirka', window.store.nisdFirka.name, allVillages.length, false);
            }
          }

          if (typeof window.markLoaded === 'function') {
            window.markLoaded('nisd_1', nisd1DetailObj.name, nisd1DetailObj.objs.length, false);
          }
          setStatus('nisd_natham', `✓ ${vaoApps.length} VAO apps`, 'ok');
          summaryStats.push(`NISD Natham: ${vaoApps.length} VAO apps`);
        }

        if (item.key === 'isd_natham') {
          const isdGroup = groupAppsByVillageForISD(rawApps);
          const dataNatham = {
            name: `Auto ISD Natham (${rawApps.length} apps)`,
            header: ['Village Name', 'Application Date', 'Pending At', 'Number of days pending', 'Application Status'],
            objs: rawApps.map(a => ({
              'Village Name': (a.village_name || a.village || 'Unknown').trim(),
              'Application Date': a.appl_date || a.appl_dt || '',
              'Pending At': a.role_name || a.pending_at || 'Surveyor',
              'Number of days pending': a.pending_days || a.total_pending || '0',
              'Application Status': (a.appl_status || a.status || a.application_status || 'Pending').trim()
            })),
            rows: isdGroup.rows,
            footer: isdGroup.footer
          };
          window.store['isdNatham'] = dataNatham;
          if (typeof window.markLoaded === 'function') {
            window.markLoaded('isdNatham', dataNatham.name, isdGroup.rows.length, false);
          }
          setStatus('isd_natham', `✓ ${rawApps.length} apps`, 'ok');
          summaryStats.push(`ISD Natham: ${rawApps.length} apps`);
        }

        if (item.key === 'fline_rural') {
          const vMap = new Map();
          rawApps.forEach(a => { const v = (a.village_name || 'Unknown').trim(); vMap.set(v, (vMap.get(v) || 0) + 1); });
          const dataFlr = {
            name: `Auto F-Line Rural (${rawApps.length} apps)`,
            header: ['Village Name', 'Application Date', 'Pending At', 'Number of days pending', 'Application Status'],
            objs: rawApps.map(a => ({
              'Village Name': (a.village_name || a.village || 'Unknown').trim(),
              'Application Date': a.appl_date || a.appl_dt || '',
              'Pending At': a.pending_at || 'Surveyor',
              'Number of days pending': a.pending_days || a.total_pending || a.opt_days || '0',
              'Application Status': (a.appl_status || a.status || a.application_status || 'Pending').trim()
            })),
            rows: Array.from(vMap.entries()).map(([v, c]) => ({ village: v, rtr: 0, str: c, total: c }))
          };
          window.store['flineRural'] = dataFlr;
          if (typeof window.markLoaded === 'function') {
            window.markLoaded('flineRural', dataFlr.name, dataFlr.rows.length, false);
          }
          setStatus('fline_rural', `✓ ${rawApps.length} apps`, 'ok');
          summaryStats.push(`F-Line Rural: ${rawApps.length} apps`);
        }

        if (item.key === 'fline_natham') {
          const vMap = new Map();
          rawApps.forEach(a => { const v = (a.village_name || 'Unknown').trim(); vMap.set(v, (vMap.get(v) || 0) + 1); });
          const dataFln = {
            name: `Auto F-Line Natham (${rawApps.length} apps)`,
            header: ['Village Name', 'Application Date', 'Pending At', 'Number of days pending', 'Application Status'],
            objs: rawApps.map(a => ({
              'Village Name': (a.village_name || a.village || 'Unknown').trim(),
              'Application Date': a.appl_date || a.appl_dt || '',
              'Pending At': a.pending_at || 'Surveyor',
              'Number of days pending': a.pending_days || a.total_pending || a.opt_days || '0',
              'Application Status': (a.appl_status || a.status || a.application_status || 'Pending').trim()
            })),
            rows: Array.from(vMap.entries()).map(([v, c]) => ({ village: v, rtr: 0, str: c, total: c }))
          };
          window.store['flineNatham'] = dataFln;
          if (typeof window.markLoaded === 'function') {
            window.markLoaded('flineNatham', dataFln.name, dataFln.rows.length, false);
          }
          setStatus('fline_natham', `✓ ${rawApps.length} apps`, 'ok');
          summaryStats.push(`F-Line Natham: ${rawApps.length} apps`);
        }
      });

      // If ISD OPT was not checked or empty, but ISD PDF was pulled, synthesize baseline opt0 bucket from PDF
      if (window.store['isdRuralPdf'] && (!window.store['opt0'] || !window.store['opt0'].rows || !window.store['opt0'].rows.length)) {
        const vList = Array.from(window.store['isdRuralPdf'].villages.values());
        const synRows = vList.map(v => {
          const vName = v.village || '';
          const pend = (v.inv && v.inv.pending != null) ? v.inv.pending : (v.pending || 0);
          return {
            label: vName, village: vName, taluk: talukName,
            surv: pend, vao: 0, lrd: 0, dis: 0, thl: 0, all: pend,
            rtr: 0, str: pend, total: pend,
            total_sur: pend, total_vao: 0, total_lrd: 0, total_dis: 0, total_thl: 0
          };
        }).filter(r => r.total > 0);
        const synFooter = {
          label: 'Total', village: 'Total', taluk: talukName,
          surv: synRows.reduce((s, r) => s + r.surv, 0),
          vao: 0, lrd: 0, dis: 0, thl: 0,
          all: synRows.reduce((s, r) => s + r.all, 0),
          total: synRows.reduce((s, r) => s + r.total, 0),
          total_sur: synRows.reduce((s, r) => s + r.total_sur, 0),
          total_vao: 0, total_lrd: 0, total_dis: 0, total_thl: 0
        };
        const dBelow25 = { name: `Auto PDF Involving (${synFooter.total} apps)`, rows: synRows, footer: synFooter };
        window.store['opt0'] = dBelow25;
        window.store['opt1'] = { name: `Auto 25-29 Days (0 apps)`, rows: [], footer: null };
        window.store['opt2'] = { name: `Auto 30+ Days (0 apps)`, rows: [], footer: null };
        if (typeof window.markLoaded === 'function') {
          window.markLoaded('opt0', dBelow25.name, synRows.length, false);
        }
      }

      // Sync active TALUK across window and header
      if (talukName) {
        window.TALUK = talukName;
        try { localStorage.setItem('village_test.selectedTaluk.v1', talukName); } catch (e) {}
        const topTalukSel = document.getElementById('talukSel');
        if (topTalukSel) setSelectByTaluk(topTalukSel, talukName);
        if (typeof window.refreshTitles === 'function') window.refreshTitles();
      }

      ensureVillageAndVaoDetails(allAppVillages, talukName);

      if (typeof window.renderNisdDrops === 'function') window.renderNisdDrops();
      if (typeof window.updateRail === 'function') window.updateRail();
      if (typeof window.render === 'function') window.render();

      if (typeof window.saveToCloud === 'function') {
        const slotsToSave = [
          { kind: 'opt0', data: window.store['opt0'], name: `TamilNilam_Auto_ISD_Rural_Below25Days_${talukName}.json` },
          { kind: 'opt1', data: window.store['opt1'], name: `TamilNilam_Auto_ISD_Rural_25to29Days_${talukName}.json` },
          { kind: 'opt2', data: window.store['opt2'], name: `TamilNilam_Auto_ISD_Rural_30DaysAbove_${talukName}.json` },
          { kind: 'isdRuralPdf', data: window.store['isdRuralPdf'], name: `TamilNilam_Auto_ISD_Status_${talukName}.json` },
          { kind: 'isdNatham', data: window.store['isdNatham'], name: `TamilNilam_Auto_ISD_Natham_${talukName}.json` },
          { kind: 'flineRural', data: window.store['flineRural'], name: `TamilNilam_Auto_FLine_Rural_${talukName}.json` },
          { kind: 'flineNatham', data: window.store['flineNatham'], name: `TamilNilam_Auto_FLine_Natham_${talukName}.json` },
          { kind: 'nisd_0_0', data: window.store['nisd_0_0'], name: `TamilNilam_Auto_NISD_Rural_12DaysAbove_${talukName}.json` },
          { kind: 'nisd_0_1', data: window.store['nisd_0_1'], name: `TamilNilam_Auto_NISD_Rural_10to11Days_${talukName}.json` },
          { kind: 'nisd_0_2', data: window.store['nisd_0_2'], name: `TamilNilam_Auto_NISD_Rural_Below10Days_${talukName}.json` },
          { kind: 'nisd_1', data: window.store['nisd_1'], name: `TamilNilam_Auto_NISD_Natham_${talukName}.json` }
        ];
        if (window.store.nisdFirka) {
          slotsToSave.push({ kind: 'nisdFirka', data: window.store.nisdFirka, name: `TamilNilam_Auto_NISD_Village_Firka_${talukName}.json` });
        }
        if (window.store.village) {
          slotsToSave.push({ kind: 'village', data: window.store.village, name: `TamilNilam_Auto_Village_Details_${talukName}.json` });
        }
        if (window.store.vaoDetails) {
          slotsToSave.push({ kind: 'vaoDetails', data: window.store.vaoDetails, name: `TamilNilam_Auto_VAO_Details_${talukName}.json` });
        }
        for (const s of slotsToSave) {
          if (s.data) {
            try {
              let blobContent;
              if (s.kind === 'isdRuralPdf' && s.data.villages instanceof Map) {
                blobContent = JSON.stringify({ villages: Array.from(s.data.villages.values()), grand: s.data.grand || {} });
              } else {
                blobContent = JSON.stringify(s.data);
              }
              const blob = new Blob([blobContent], { type: 'application/json' });
              blob.name = s.name;
              await window.saveToCloud(s.kind, blob, s.data, talukName);
            } catch (e) {
              console.warn('Cloud save note for', s.kind, e);
            }
          }
        }
      }

      showStatus(`✓ Flash Fill Complete for ${talukName}! ${summaryStats.join(' | ')}`, 'info');
      if (typeof window.toast === 'function') {
        window.toast(`⚡ Flash Fill Complete (${talukName})`, summaryStats.join('\n'), 'ok');
      }

      setTimeout(() => {
        const ffBackdrop = document.getElementById('tnFFModalBackdrop');
        if (ffBackdrop) ffBackdrop.classList.remove('open');
      }, 1500);

    } catch (err) {
      console.error('Flash fill execute error:', err);
      showStatus(`Flash fill failed: ${err.message}`, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '⚡ Run Flash Fill (Selected Reports)';
      }
    }
  }

  async function handleFlashFillAll() {
    if (typeof _openFFModal === 'function') _openFFModal();
  }

  function showStatus(msg, type) {
    const b = document.getElementById('tnStatusBanner');
    if (!b) return;
    b.className = `tn-status-banner ${type}`;
    b.textContent = msg;
    b.style.display = 'block';
  }

  function hideStatus() {
    const b = document.getElementById('tnStatusBanner');
    if (b) b.style.display = 'none';
  }

  // Dedicated Standalone Pull for ISD Rural Application Status PDF (drilldowntasildar.html)
  window.__pullIsdRuralPdfStandalone = async function() {
    const badge = document.querySelector('[data-badge="isdRuralPdf"]');
    const drop = document.querySelector('[data-drop="isdRuralPdf"]');
    const rawTaluk = (typeof window.talukName === 'function' && window.talukName()) || window.TALUK || localStorage.getItem('village_test.selectedTaluk.v1') || 'Nemili';
    const activeTaluk = cleanTalukTitle(rawTaluk);
    const talukCode = resolveTalukCode(activeTaluk) || '12';

    const secCreds = getTnCreds('secondary', activeTaluk);
    const u = secCreds.username || 'rpt_panneerselvam';
    const p = secCreds.password || 'Nemili@1970';
    const r = secCreds.roleId || '8';

    if (badge) {
      badge.className = 'badge';
      badge.textContent = '⏳ pulling…';
    }
    if (drop) {
      drop.classList.remove('done', 'bad');
    }
    if (typeof window.toast === 'function') {
      window.toast('Pulling ISD Rural Status', `Fetching drilldowntasildar data for ${activeTaluk} from Tamil Nilam portal...`, 'info');
    }

    try {
      const curRange = getCurrentMonthRange();
      const fromDate = curRange.fromDate;
      const toDate = curRange.toDate;

      const url = `/api/nisd-rural?mode=isd_status&talukCode=${encodeURIComponent(talukCode)}&talukName=${encodeURIComponent(activeTaluk)}&distCode=37&username=${encodeURIComponent(u)}&password=${encodeURIComponent(p)}&roleId=${encodeURIComponent(r)}&fromDate=${fromDate}&toDate=${toDate}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch drilldowntasildar status from Tamil Nilam');
      }

      const existing = window.store && window.store['isdRuralPdf'];
      const existingMap = (existing && existing.villages instanceof Map)
        ? existing.villages
        : (existing && Array.isArray(existing.villages)
            ? new Map(existing.villages.map(v => [v.village, v]))
            : new Map());

      const vMap = new Map();
      (data.villages || []).forEach(v => {
        if (v.village) {
          if (v.approved === 0 && v.rejected === 0 && existingMap.has(v.village)) {
            const ev = existingMap.get(v.village);
            if ((ev.approved || 0) > 0 || (ev.rejected || 0) > 0) {
              v.approved = ev.approved || 0;
              v.rejected = ev.rejected || 0;
              v.returned = ev.returned || 0;
              v.total = v.approved + (v.pending || 0) + v.rejected + v.returned;
              if (ev.inv) {
                v.inv = v.inv || {};
                v.inv.approved = ev.inv.approved || 0;
                v.inv.rejected = ev.inv.rejected || 0;
                v.inv.returned = ev.inv.returned || 0;
                v.inv.total = (v.inv.approved || 0) + (v.inv.pending || 0) + (v.inv.rejected || 0) + (v.inv.returned || 0);
              }
              if (ev.notinv) {
                v.notinv = v.notinv || {};
                v.notinv.approved = ev.notinv.approved || 0;
                v.notinv.rejected = ev.notinv.rejected || 0;
                v.notinv.returned = ev.notinv.returned || 0;
                v.notinv.total = (v.notinv.approved || 0) + (v.notinv.pending || 0) + (v.notinv.rejected || 0) + (v.notinv.returned || 0);
              }
            }
          }
          vMap.set(v.village, v);
        }
      });

      existingMap.forEach((ev, evName) => {
        if (!vMap.has(evName)) {
          vMap.set(evName, ev);
        }
      });

      const grand = data.grand || {};
      if ((!grand.all || grand.all.approved === 0) && existing && existing.grand && existing.grand.all && existing.grand.all.approved > 0) {
        grand.all = grand.all || {};
        grand.all.approved = existing.grand.all.approved;
        grand.all.rejected = existing.grand.all.rejected;
        grand.all.returned = existing.grand.all.returned;
        grand.all.total = grand.all.approved + (grand.all.pending || 0) + grand.all.rejected + grand.all.returned;
      }

      const parsedPdf = {
        name: `Auto ISD Status (${vMap.size} villages)`,
        villages: vMap,
        grand: grand
      };

      if (!window.store) window.store = {};
      window.store['isdRuralPdf'] = parsedPdf;

      ensureVillageAndVaoDetails(Array.from(vMap.keys()), activeTaluk);

      if (typeof window.markLoaded === 'function') {
        window.markLoaded('isdRuralPdf', parsedPdf.name, vMap.size, false);
      }
      if (typeof window.updateRail === 'function') window.updateRail();
      if (typeof window.render === 'function') window.render();

      // Auto-save to Supabase Cloud
      if (typeof window.saveToCloud === 'function') {
        try {
          const fileName = `TamilNilam_Auto_ISD_Status_${activeTaluk}.json`;
          const blob = new Blob([JSON.stringify({ villages: Array.from(vMap.values()), grand: parsedPdf.grand })], { type: 'application/json' });
          blob.name = fileName;
          await window.saveToCloud('isdRuralPdf', blob, parsedPdf, activeTaluk);
        } catch (cloudErr) {
          console.warn('Supabase cloud save note:', cloudErr);
        }
      }

      if (typeof window.toast === 'function') {
        window.toast('ISD Rural Status Loaded', `Successfully pulled ${vMap.size} villages for ${activeTaluk} from drilldowntasildar.html!`, 'ok');
      }
    } catch (err) {
      console.error('ISD Rural PDF pull error:', err);
      if (badge) {
        badge.className = 'badge err';
        badge.textContent = 'error';
      }
      if (drop) drop.classList.add('bad');
      if (typeof window.toast === 'function') {
        window.toast('ISD Rural Pull Failed', err.message || 'Could not pull status from Tamil Nilam', 'err');
      }
    }
  };

  let aregPendingApps = [];
  let aregEditingIdx = -1;

  window.openAregApprovalModal = function(initialTaluk, initialService) {
    const isAdmin = (typeof window.CLOUD_ON === 'undefined' || !window.CLOUD_ON) || (window.ME && window.ME.role === 'admin');
    if (!isAdmin) {
      if (typeof window.toast === 'function') {
        window.toast('Access restricted', 'Access restricted: Only Admin accounts can access A-Register Approval Hub.', 'warn');
      }
      return;
    }
    let backdrop = document.getElementById('aregModalBackdrop');
    if (!backdrop) {
      const modalHtml = `
        <div id="aregModalBackdrop" class="tn-modal-backdrop" style="z-index: 20000 !important;">
          <div class="tn-modal" style="max-width: 1050px; width: 95vw; max-height: 92vh;">
            <div class="tn-modal-header" style="background: linear-gradient(135deg, #d97706, #b45309); color: #fff;">
              <h2>
                <span>📝 Tamil Nilam A-Register Unified Approval Suite</span>
                <span class="tn-badge" style="background: rgba(255,255,255,0.2); color: #fff;">Creation, Correction & Approval</span>
              </h2>
              <button type="button" class="iconbtn" id="aregCloseModal" title="Close" style="color: #fff; border-color: rgba(255,255,255,0.3);">&#10005;</button>
            </div>

            <div class="tn-modal-body" style="padding: 18px 22px;">
              <div class="tn-filter-box" style="background: var(--surface-2); border-color: var(--line-2); margin-bottom: 14px;">
                <div class="tn-filter-title" style="color: #d97706; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                  <span>A-REGISTER APPLICATION CONTROL CENTER</span>
                  <button type="button" id="aregToggleCreateBtn" class="primary" style="background: #2563eb; border-color: #1d4ed8; padding: 5px 12px; font-size: 12px; border-radius: 6px;">
                    ➕ Create New Application
                  </button>
                </div>
                
                <div class="tn-form-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
                  <div class="tn-field">
                    <label>TALUK</label>
                    <select id="aregTalukSel">
                      <option value="03">Arakkonam (03)</option>
                      <option value="12" selected>Nemili (12)</option>
                      <option value="04">Walajah (04)</option>
                      <option value="02">Arcot (02)</option>
                      <option value="13">Kalavai (13)</option>
                      <option value="14">Sholinghur (14)</option>
                    </select>
                  </div>
                  <div class="tn-field">
                    <label>SERVICE TYPE</label>
                    <select id="aregServiceSel">
                      <option value="0109" selected>0109 — A-Register Correction (Rural)</option>
                      <option value="0108">0108 — A-Register Addition (Rural)</option>
                      <option value="0111">0111 — CLR Correction (Rural)</option>
                      <option value="0112">0112 — A-Register Deletion (Rural)</option>
                      <option value="N108">N108 — A-Register Addition (Natham)</option>
                      <option value="N109">N109 — A-Register Correction (Natham)</option>
                    </select>
                  </div>
                  <div class="tn-field" style="display: flex; align-items: flex-end;">
                    <button type="button" class="primary" id="aregFetchBtn" style="background: #d97706; border-color: #b45309; width: 100%; height: 36px;">⚡ Fetch Live Pending Apps</button>
                  </div>
                </div>
              </div>

              <!-- Collapsible Application Creation Form -->
              <div id="aregCreateCard" style="display: block; background: var(--surface-2); border: 1.5px dashed #f59e0b; border-radius: 10px; padding: 14px 18px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                  <h4 style="margin: 0; font-size: 13.5px; font-weight: 700; color: #d97706; display: flex; align-items: center; gap: 6px;">
                    <span>➕ Create New A-Register Application</span>
                  </h4>
                  <span style="font-size: 11px; color: var(--muted); font-weight: 600;">Direct Tahsildar Portal Entry</span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px 14px; align-items: flex-end;">
                  <div class="tn-field">
                    <label style="font-size: 11px; font-weight: 700;">Taluk</label>
                    <select id="aregCreateTaluk" style="font-size: 12px; padding: 6px 8px;">
                      <option value="03">Arakkonam (03)</option>
                      <option value="12" selected>Nemili (12)</option>
                      <option value="04">Walajah (04)</option>
                      <option value="02">Arcot (02)</option>
                      <option value="13">Kalavai (13)</option>
                      <option value="14">Sholinghur (14)</option>
                    </select>
                  </div>

                  <div class="tn-field">
                    <label style="font-size: 11px; font-weight: 700;">Service Type</label>
                    <select id="aregCreateService" style="font-size: 12px; padding: 6px 8px;">
                      <option value="0109" selected>0109 — Correction (Rural)</option>
                      <option value="0108">0108 — Addition (Rural)</option>
                      <option value="0111">0111 — CLR (Rural)</option>
                      <option value="0112">0112 — Deletion (Rural)</option>
                      <option value="N108">N108 — Addition (Natham)</option>
                      <option value="N109">N109 — Correction (Natham)</option>
                    </select>
                  </div>

                  <div class="tn-field">
                    <label style="font-size: 11px; font-weight: 700;">Village</label>
                    <select id="aregCreateVillage" style="font-size: 12px; padding: 6px 8px;">
                      <option value="109">Agavalam (109)</option>
                      <option value="108">Alappakkam (108)</option>
                      <option value="115">Attupakkam (115)</option>
                      <option value="110">Banavaram (110)</option>
                      <option value="111">Illuppaiyandandalam (111)</option>
                      <option value="121">Asanellikuppam (121)</option>
                      <option value="123">Kariakudal (123)</option>
                      <option value="124">Keelvenkatapuram (124)</option>
                      <option value="122" selected>Nemili (122)</option>
                      <option value="125">Sayanavaram (125)</option>
                      <option value="120">S.Kulathur (120)</option>
                      <option value="112">Thenmambakkam (112)</option>
                    </select>
                  </div>

                  <div class="tn-field">
                    <label style="font-size: 11px; font-weight: 700;">Survey No *</label>
                    <input type="text" id="aregCreateSurveyNo" placeholder="e.g. 142" style="font-size: 12px; padding: 6px 8px;">
                  </div>

                  <div class="tn-field">
                    <label style="font-size: 11px; font-weight: 700;">Subdiv No</label>
                    <input type="text" id="aregCreateSubdivNo" placeholder="e.g. 1A" style="font-size: 12px; padding: 6px 8px;">
                  </div>

                  <div class="tn-field">
                    <label style="font-size: 11px; font-weight: 700;">Applicant Name *</label>
                    <input type="text" id="aregCreateApplicantName" placeholder="Applicant Name" style="font-size: 12px; padding: 6px 8px;">
                  </div>

                  <div class="tn-field" style="grid-column: 1 / -1;">
                    <label style="font-size: 11px; font-weight: 700;">Remarks / Correction Details</label>
                    <input type="text" id="aregCreateRemarks" placeholder="Enter remarks or correction details" style="font-size: 12px; padding: 6px 8px;">
                  </div>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 12px;">
                  <button type="button" class="primary" id="aregSubmitCreateBtn" style="background: #16a34a; border-color: #15803d; padding: 7px 18px; font-size: 12.5px;">
                    ➕ Create &amp; Submit Application
                  </button>
                </div>
              </div>

              <div id="aregStatusBanner" class="tn-status-banner" style="display: none; margin-top: 10px;"></div>

              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: var(--ink);">
                  Pending Applications List (<span id="aregAppCount">0</span>)
                </h3>
                <button type="button" class="primary" id="aregApproveAllBtn" disabled style="background: #16a34a; border-color: #15803d; padding: 6px 14px; font-size: 12.5px;">⚡ Approve All Applications</button>
              </div>

              <div class="tablewrap" style="max-height: 380px; overflow-y: auto; border: 1px solid var(--line-2); border-radius: 8px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <thead>
                    <tr style="background: var(--surface-2); position: sticky; top: 0; z-index: 2;">
                      <th style="padding: 8px 8px; border-bottom: 1px solid var(--line-2); text-align: center; width: 40px;">#</th>
                      <th style="padding: 8px 10px; border-bottom: 1px solid var(--line-2); text-align: left;">Application ID</th>
                      <th style="padding: 8px 10px; border-bottom: 1px solid var(--line-2); text-align: left;">Survey / Subdiv</th>
                      <th style="padding: 8px 10px; border-bottom: 1px solid var(--line-2); text-align: left;">Village</th>
                      <th style="padding: 8px 10px; border-bottom: 1px solid var(--line-2); text-align: left;">Appl Date</th>
                      <th style="padding: 8px 10px; border-bottom: 1px solid var(--line-2); text-align: left;">Applicant</th>
                      <th style="padding: 8px 10px; border-bottom: 1px solid var(--line-2); text-align: left;">Remarks</th>
                      <th style="padding: 8px 10px; border-bottom: 1px solid var(--line-2); text-align: center; min-width: 220px;">Actions</th>
                    </tr>
                  </thead>
                  <tbody id="aregTableBody">
                    <tr>
                      <td colspan="8" style="text-align: center; padding: 24px; color: var(--muted);">
                        Click <b>⚡ Fetch Live Pending Apps</b> above to retrieve pending A-Register applications from Tamil Nilam portal.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div id="aregLogs" style="margin-top: 14px; padding: 10px 14px; background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 11.5px; border-radius: 8px; max-height: 120px; overflow-y: auto; display: none;"></div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      backdrop = document.getElementById('aregModalBackdrop');
      
      document.getElementById('aregCloseModal').addEventListener('click', () => {
        backdrop.classList.remove('open');
      });

      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.classList.remove('open');
      });

      const toggleCreateBtn = document.getElementById('aregToggleCreateBtn');
      const createCard = document.getElementById('aregCreateCard');
      if (toggleCreateBtn && createCard) {
        toggleCreateBtn.addEventListener('click', () => {
          const isHidden = createCard.style.display === 'none';
          createCard.style.display = isHidden ? 'block' : 'none';
          toggleCreateBtn.textContent = isHidden ? '➖ Hide Creation Form' : '➕ Create New Application';
        });
      }

      // Sync top selects with creation form selects
      const topTaluk = document.getElementById('aregTalukSel');
      const createTaluk = document.getElementById('aregCreateTaluk');
      const topService = document.getElementById('aregServiceSel');
      const createService = document.getElementById('aregCreateService');

      if (topTaluk && createTaluk) {
        topTaluk.addEventListener('change', () => { createTaluk.value = topTaluk.value; });
        createTaluk.addEventListener('change', () => { topTaluk.value = createTaluk.value; });
      }
      if (topService && createService) {
        topService.addEventListener('change', () => { createService.value = topService.value; });
        createService.addEventListener('change', () => { topService.value = createService.value; });
      }

      document.getElementById('aregFetchBtn').addEventListener('click', fetchAregApplications);
      document.getElementById('aregApproveAllBtn').addEventListener('click', approveAllAregApplications);
      document.getElementById('aregSubmitCreateBtn').addEventListener('click', createAregApplication);
    }

    const targetTaluk = initialTaluk || (typeof window.TALUK !== 'undefined' && window.TALUK) || 'Nemili';
    if (targetTaluk) {
      const tCode = resolveTalukCode(targetTaluk) || '12';
      const sel = document.getElementById('aregTalukSel');
      const cSel = document.getElementById('aregCreateTaluk');
      if (sel) sel.value = tCode;
      if (cSel) cSel.value = tCode;
    }
    if (initialService) {
      const sSel = document.getElementById('aregServiceSel');
      const csSel = document.getElementById('aregCreateService');
      if (sSel) sSel.value = initialService;
      if (csSel) csSel.value = initialService;
    }

    backdrop.classList.add('open');
    fetchAregApplications();
  };

  async function createAregApplication() {
    const talukSel = document.getElementById('aregCreateTaluk');
    const serviceSel = document.getElementById('aregCreateService');
    const villageSel = document.getElementById('aregCreateVillage');
    const surveyInput = document.getElementById('aregCreateSurveyNo');
    const subdivInput = document.getElementById('aregCreateSubdivNo');
    const applicantInput = document.getElementById('aregCreateApplicantName');
    const remarksInput = document.getElementById('aregCreateRemarks');
    const submitBtn = document.getElementById('aregSubmitCreateBtn');
    const statusBanner = document.getElementById('aregStatusBanner');

    const talukCode = talukSel ? talukSel.value : '12';
    const serviceCode = serviceSel ? serviceSel.value : '0109';
    const villageCode = villageSel ? villageSel.value : '122';
    const villageName = villageSel && villageSel.options[villageSel.selectedIndex] ? villageSel.options[villageSel.selectedIndex].text.replace(/\s*\(\d+\)/, '').trim() : 'Nemili';
    const surveyNo = surveyInput ? surveyInput.value.trim() : '';
    const subdivNo = subdivInput ? subdivInput.value.trim() : '';
    const applicantName = applicantInput ? applicantInput.value.trim() : '';
    const remarks = remarksInput ? remarksInput.value.trim() : '';

    if (!surveyNo) {
      if (typeof window.toast === 'function') window.toast('Validation Error', 'Please enter Survey Number', 'warn');
      if (surveyInput) surveyInput.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ Creating &amp; Submitting...';
    }
    if (statusBanner) {
      statusBanner.className = 'tn-status-banner info';
      statusBanner.style.display = 'block';
      statusBanner.textContent = `Submitting new A-Register application to Tamil Nilam portal...`;
    }

    try {
      const talukText = talukSel ? talukSel.options[talukSel.selectedIndex].text : 'Nemili';
      const secCreds = getTnCreds('secondary', talukText.split(' ')[0]);
      const u = secCreds.username || 'rpt_panneerselvam';
      const p = secCreds.password || 'Nemili@1970';
      const r = secCreds.roleId || '8';

      const url = `/api/areg?mode=create_app&distCode=37&talukCode=${encodeURIComponent(talukCode)}&serviceCode=${encodeURIComponent(serviceCode)}&villageCode=${encodeURIComponent(villageCode)}&villageName=${encodeURIComponent(villageName)}&surveyNo=${encodeURIComponent(surveyNo)}&subdivNo=${encodeURIComponent(subdivNo)}&applicantName=${encodeURIComponent(applicantName)}&remarks=${encodeURIComponent(remarks)}&username=${encodeURIComponent(u)}&password=${encodeURIComponent(p)}&roleId=${encodeURIComponent(r)}`;
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Application creation failed');
      }

      const newApp = (data.creationPayload ? {
        applId: data.applId,
        surveyNo: data.creationPayload.surveyNo,
        subdivNo: data.creationPayload.subdivNo,
        villageCode: data.creationPayload.villageCode,
        villageName: villageName,
        applicantName: data.creationPayload.applicantName || applicantName || 'Applicant',
        remarks: data.creationPayload.remarks || remarks || 'Created via Hub',
        applDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        applStatus: 'Pending at Tahsildar',
        serviceCode: serviceCode
      } : null) || data.application || {
        applId: data.applId || `AREG-37${talukCode}${villageCode}-${Date.now().toString().slice(-5)}`,
        surveyNo: surveyNo,
        subdivNo: subdivNo,
        villageCode: villageCode,
        villageName: villageName,
        applicantName: applicantName || 'Applicant',
        remarks: remarks || 'Created via Hub',
        applDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        applStatus: 'Pending at Tahsildar',
        serviceCode: serviceCode
      };

      aregPendingApps.unshift(newApp);
      renderAregTable();

      if (surveyInput) surveyInput.value = '';
      if (subdivInput) subdivInput.value = '';
      if (applicantInput) applicantInput.value = '';
      if (remarksInput) remarksInput.value = '';

      if (statusBanner) {
        statusBanner.className = 'tn-status-banner ok';
        statusBanner.style.display = 'block';
        statusBanner.textContent = `✓ Application ${newApp.applId} created and submitted successfully!`;
      }
      if (typeof window.toast === 'function') {
        window.toast('Application Created', `Application ${newApp.applId} created successfully!`, 'ok');
      }
    } catch (err) {
      console.error('Create application error:', err);
      if (statusBanner) {
        statusBanner.className = 'tn-status-banner err';
        statusBanner.style.display = 'block';
        statusBanner.textContent = `Error creating application: ${err.message}`;
      }
      if (typeof window.toast === 'function') {
        window.toast('Creation Failed', err.message, 'err');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '➕ Create &amp; Submit Application';
      }
    }
  }

  async function fetchAregApplications() {
    const talukSel = document.getElementById('aregTalukSel');
    const serviceSel = document.getElementById('aregServiceSel');
    const fetchBtn = document.getElementById('aregFetchBtn');
    const countSpan = document.getElementById('aregAppCount');
    const approveAllBtn = document.getElementById('aregApproveAllBtn');
    const statusBanner = document.getElementById('aregStatusBanner');

    const talukCode = talukSel ? talukSel.value : '03';
    const serviceCode = serviceSel ? serviceSel.value : '0109';
    const talukText = talukSel ? talukSel.options[talukSel.selectedIndex].text : 'Arakkonam';

    if (fetchBtn) {
      fetchBtn.disabled = true;
      fetchBtn.innerHTML = '⏳ Fetching...';
    }
    if (statusBanner) {
      statusBanner.className = 'tn-status-banner info';
      statusBanner.style.display = 'block';
      statusBanner.textContent = `Fetching live pending applications for ${talukText} (${serviceCode}) from Tamil Nilam portal...`;
    }

    try {
      const secCreds = getTnCreds('secondary', talukText.split(' ')[0]);
      const u = secCreds.username || 'rpt_panneerselvam';
      const p = secCreds.password || 'Nemili@1970';
      const r = secCreds.roleId || '8';

      const url = `/api/areg?mode=pending_list&distCode=37&talukCode=${encodeURIComponent(talukCode)}&serviceCode=${encodeURIComponent(serviceCode)}&username=${encodeURIComponent(u)}&password=${encodeURIComponent(p)}&roleId=${encodeURIComponent(r)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch pending applications');
      }

      aregPendingApps = data.applications || [];
      aregEditingIdx = -1;
      renderAregTable();

      if (!aregPendingApps.length) {
        if (approveAllBtn) approveAllBtn.disabled = true;
        if (statusBanner) {
          statusBanner.className = 'tn-status-banner ok';
          statusBanner.textContent = `✓ No pending applications for ${talukText} (${serviceCode}).`;
        }
        return;
      }

      if (approveAllBtn) approveAllBtn.disabled = false;
      if (statusBanner) {
        statusBanner.className = 'tn-status-banner ok';
        statusBanner.textContent = `✓ Found ${aregPendingApps.length} pending applications for ${talukText} (${serviceCode}). Ready for approval!`;
      }

    } catch (err) {
      console.error('Fetch A-Register error:', err);
      aregPendingApps = [];
      aregEditingIdx = -1;
      renderAregTable();
      if (statusBanner) {
        statusBanner.className = 'tn-status-banner err';
        statusBanner.textContent = `Error fetching applications: ${err.message}`;
      }
    } finally {
      if (fetchBtn) {
        fetchBtn.disabled = false;
        fetchBtn.innerHTML = '⚡ Fetch Live Pending Apps';
      }
    }
  }

  function renderAregTable() {
    const tbody = document.getElementById('aregTableBody');
    const countSpan = document.getElementById('aregAppCount');
    const approveAllBtn = document.getElementById('aregApproveAllBtn');

    if (countSpan) countSpan.textContent = aregPendingApps.length;
    if (approveAllBtn) approveAllBtn.disabled = !aregPendingApps.length;

    if (!tbody) return;

    if (!aregPendingApps.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 24px; color: var(--muted);">
            No pending applications found. Click <b>➕ Create New Application</b> to create one, or click <b>⚡ Fetch Live Pending Apps</b> to retrieve applications.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = aregPendingApps.map((app, idx) => {
      const isEditing = (aregEditingIdx === idx);
      if (isEditing) {
        return `
          <tr id="aregRow_${idx}" style="border-bottom: 1px solid var(--line-2); background: rgba(2, 132, 199, 0.08);">
            <td style="padding: 6px 8px; text-align: center; font-weight: 600;">${idx + 1}</td>
            <td style="padding: 6px 8px; font-weight: 700; color: var(--accent);">${app.applId || '-'}</td>
            <td style="padding: 6px 8px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <input type="text" id="aregEditSurvey_${idx}" value="${app.surveyNo || ''}" placeholder="Survey" style="width: 55px; padding: 4px 6px; font-size: 11.5px; border: 1px solid var(--line-2); border-radius: 4px;">
                <span>/</span>
                <input type="text" id="aregEditSubdiv_${idx}" value="${app.subdivNo || ''}" placeholder="Subdiv" style="width: 45px; padding: 4px 6px; font-size: 11.5px; border: 1px solid var(--line-2); border-radius: 4px;">
              </div>
            </td>
            <td style="padding: 6px 8px;">${app.villageName || app.villageCode || '-'}</td>
            <td style="padding: 6px 8px; font-size: 11px;">${app.applDate || '-'}</td>
            <td style="padding: 6px 8px;">
              <input type="text" id="aregEditApplicant_${idx}" value="${app.applicantName || ''}" placeholder="Applicant" style="width: 100px; padding: 4px 6px; font-size: 11.5px; border: 1px solid var(--line-2); border-radius: 4px;">
            </td>
            <td style="padding: 6px 8px;">
              <input type="text" id="aregEditRemarks_${idx}" value="${app.remarks || ''}" placeholder="Remarks" style="width: 100%; min-width: 110px; padding: 4px 6px; font-size: 11.5px; border: 1px solid var(--line-2); border-radius: 4px;">
            </td>
            <td style="padding: 6px 8px; text-align: center; white-space: nowrap;">
              <button type="button" class="primary btn-areg-save" data-idx="${idx}" style="background: #0284c7; border-color: #0369a1; padding: 4px 8px; font-size: 11px; margin-right: 4px;">
                💾 Save Correction
              </button>
              <button type="button" class="ghost btn-areg-cancel" data-idx="${idx}" style="padding: 4px 8px; font-size: 11px;">
                ❌ Cancel
              </button>
            </td>
          </tr>
        `;
      } else {
        const isApproved = app.applStatus === 'Approved & Completed';
        return `
          <tr id="aregRow_${idx}" style="border-bottom: 1px solid var(--line-2); ${isApproved ? 'background: rgba(74, 222, 128, 0.15);' : ''}">
            <td style="padding: 8px 8px; text-align: center; font-weight: 600;">${idx + 1}</td>
            <td style="padding: 8px 8px; font-weight: 700; color: var(--accent);">${app.applId || '-'}</td>
            <td style="padding: 8px 8px; font-weight: 600;">${app.surveyNo || '-'}${app.subdivNo ? '/' + app.subdivNo : ''}</td>
            <td style="padding: 8px 8px;">${app.villageName || app.villageCode || '-'}</td>
            <td style="padding: 8px 8px; font-size: 11px;">${app.applDate || '-'}</td>
            <td style="padding: 8px 8px;">${app.applicantName || '-'}</td>
            <td style="padding: 8px 8px; font-size: 11.5px; color: var(--muted);">${app.remarks || '-'}</td>
            <td style="padding: 8px 8px; text-align: center; white-space: nowrap;">
              ${isApproved ? `<span style="color: #16a34a; font-weight: 700; font-size: 11.5px;">✓ Approved &amp; Completed</span>` : `
                <button type="button" class="ghost btn-areg-edit" data-idx="${idx}" style="padding: 4px 8px; font-size: 11px; margin-right: 4px;" title="Edit correction details inline">
                  ✏️ Edit Correction
                </button>
                <button type="button" class="primary btn-areg-approve" data-idx="${idx}" style="background: #16a34a; border-color: #15803d; padding: 4px 8px; font-size: 11px;">
                  ⚡ Approve &amp; Complete
                </button>
              `}
            </td>
          </tr>
        `;
      }
    }).join('');

    document.querySelectorAll('.btn-areg-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        aregEditingIdx = index;
        renderAregTable();
      });
    });

    document.querySelectorAll('.btn-areg-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        aregEditingIdx = -1;
        renderAregTable();
      });
    });

    document.querySelectorAll('.btn-areg-save').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        saveAregCorrection(index, e.currentTarget);
      });
    });

    document.querySelectorAll('.btn-areg-approve').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        if (!isNaN(index) && aregPendingApps[index]) {
          approveSingleAregApp(index, e.currentTarget);
        }
      });
    });
  }

  async function saveAregCorrection(index, btnElement) {
    const app = aregPendingApps[index];
    if (!app) return;

    const surveyInput = document.getElementById(`aregEditSurvey_${index}`);
    const subdivInput = document.getElementById(`aregEditSubdiv_${index}`);
    const applicantInput = document.getElementById(`aregEditApplicant_${index}`);
    const remarksInput = document.getElementById(`aregEditRemarks_${index}`);

    const newSurveyNo = surveyInput ? surveyInput.value.trim() : app.surveyNo;
    const newSubdivNo = subdivInput ? subdivInput.value.trim() : app.subdivNo;
    const newApplicantName = applicantInput ? applicantInput.value.trim() : app.applicantName;
    const newRemarks = remarksInput ? remarksInput.value.trim() : app.remarks;

    const talukSel = document.getElementById('aregTalukSel');
    const serviceSel = document.getElementById('aregServiceSel');
    const talukCode = talukSel ? talukSel.value : '12';
    const serviceCode = serviceSel ? serviceSel.value : '0109';
    const talukText = talukSel ? talukSel.options[talukSel.selectedIndex].text : 'Nemili';

    if (btnElement) {
      btnElement.disabled = true;
      btnElement.innerHTML = '⏳ Saving...';
    }

    try {
      const secCreds = getTnCreds('secondary', talukText.split(' ')[0]);
      const u = secCreds.username || 'rpt_panneerselvam';
      const p = secCreds.password || 'Nemili@1970';
      const r = secCreds.roleId || '8';

      const url = `/api/areg?mode=save_correction&distCode=37&talukCode=${encodeURIComponent(talukCode)}&serviceCode=${encodeURIComponent(serviceCode)}&applId=${encodeURIComponent(app.applId || '')}&surveyNo=${encodeURIComponent(newSurveyNo)}&subdivNo=${encodeURIComponent(newSubdivNo)}&villageCode=${encodeURIComponent(app.villageCode || '')}&applicantName=${encodeURIComponent(newApplicantName)}&remarks=${encodeURIComponent(newRemarks)}&username=${encodeURIComponent(u)}&password=${encodeURIComponent(p)}&roleId=${encodeURIComponent(r)}`;
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to save correction details');
      }

      app.surveyNo = newSurveyNo;
      app.subdivNo = newSubdivNo;
      app.applicantName = newApplicantName;
      app.remarks = newRemarks;

      aregEditingIdx = -1;
      renderAregTable();

      if (typeof window.toast === 'function') {
        window.toast('Correction Saved', `Correction details saved for ${app.applId || newSurveyNo}`, 'ok');
      }
    } catch (err) {
      console.error('Save correction error:', err);
      if (typeof window.toast === 'function') {
        window.toast('Save Failed', err.message, 'err');
      }
      if (btnElement) {
        btnElement.disabled = false;
        btnElement.innerHTML = '💾 Save Correction';
      }
    }
  }

  async function approveSingleAregApp(index, btnElement) {
    const app = aregPendingApps[index];
    if (!app) return;

    const talukSel = document.getElementById('aregTalukSel');
    const serviceSel = document.getElementById('aregServiceSel');
    const talukCode = talukSel ? talukSel.value : '03';
    const serviceCode = serviceSel ? serviceSel.value : '0109';
    const talukText = talukSel ? talukSel.options[talukSel.selectedIndex].text : 'Arakkonam';
    const logs = document.getElementById('aregLogs');

    if (btnElement) {
      btnElement.disabled = true;
      btnElement.innerHTML = '⏳ Approving...';
    }
    if (logs) {
      logs.style.display = 'block';
      logs.innerHTML += `<div>[${new Date().toLocaleTimeString()}] Approving ${app.applId || app.surveyNo}...</div>`;
      logs.scrollTop = logs.scrollHeight;
    }

    try {
      const secCreds = getTnCreds('secondary', talukText.split(' ')[0]);
      const u = secCreds.username || 'rpt_panneerselvam';
      const p = secCreds.password || 'Nemili@1970';
      const r = secCreds.roleId || '8';

      const url = `/api/areg?mode=approve&distCode=37&talukCode=${encodeURIComponent(talukCode)}&serviceCode=${encodeURIComponent(serviceCode)}&applId=${encodeURIComponent(app.applId)}&surveyNo=${encodeURIComponent(app.surveyNo)}&subdivNo=${encodeURIComponent(app.subdivNo)}&villageCode=${encodeURIComponent(app.villageCode)}&username=${encodeURIComponent(u)}&password=${encodeURIComponent(p)}&roleId=${encodeURIComponent(r)}`;
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Approval failed on Tamil Nilam portal');
      }

      app.applStatus = 'Approved & Completed';
      renderAregTable();

      if (logs) {
        logs.innerHTML += `<div style="color: #4ade80;">[${new Date().toLocaleTimeString()}] ✓ Application ${app.applId || app.surveyNo} approved &amp; completed!</div>`;
        logs.scrollTop = logs.scrollHeight;
      }

      if (typeof window.toast === 'function') {
        window.toast('A-Register Approved', `Application ${app.applId || app.surveyNo} approved and completed!`, 'ok');
      }

    } catch (err) {
      console.error('Approve single app error:', err);
      if (logs) {
        logs.innerHTML += `<div style="color: #f87171;">[${new Date().toLocaleTimeString()}] ❌ Failed to approve ${app.applId}: ${err.message}</div>`;
        logs.scrollTop = logs.scrollHeight;
      }
      if (btnElement) {
        btnElement.disabled = false;
        btnElement.innerHTML = '⚡ Retry Approval';
      }
    }
  }

  async function approveAllAregApplications() {
    if (!aregPendingApps.length) return;
    const approveAllBtn = document.getElementById('aregApproveAllBtn');
    if (approveAllBtn) {
      approveAllBtn.disabled = true;
      approveAllBtn.innerHTML = '⏳ Processing Bulk Approval...';
    }

    const logs = document.getElementById('aregLogs');
    if (logs) {
      logs.style.display = 'block';
      logs.innerHTML += `<div>[${new Date().toLocaleTimeString()}] Starting bulk approval for ${aregPendingApps.length} applications...</div>`;
      logs.scrollTop = logs.scrollHeight;
    }

    let successCount = 0;
    for (let i = 0; i < aregPendingApps.length; i++) {
      const rowBtn = document.querySelector(`.btn-areg-approve[data-idx="${i}"]`);
      await approveSingleAregApp(i, rowBtn);
      successCount++;
    }

    if (approveAllBtn) {
      approveAllBtn.innerHTML = `✓ Bulk Approval Complete (${successCount}/${aregPendingApps.length})`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectUI);
  } else {
    injectUI();
  }
})();
