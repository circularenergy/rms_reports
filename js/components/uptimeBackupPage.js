import { n, h, e, section } from "./ui.js";

const safe = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const siteKey = id => String(id || "").replace(/-/g, "");
/*const fmtDate = value => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toISOString().slice(0, 16).replace("T", " ");
};

above section was replaced by below section as it was changing the time zone making the date appearing -1hr
*/
const fmtDate = value => {
    if (!value) return "—";

    const s = String(value);

    return s
        .replace("T", " ")
        .replace(/Z$/, "")
        .replace(/\.\d+$/, "")
        .slice(0, 16);
};

export function render(D, selectedSite) {
    const batterySites = selectedSite === "ALL" ? D.battery.sites : D.battery.sites.filter(s => s.id === selectedSite);
    const uptimeSites = selectedSite === "ALL" ? D.uptime.sites : D.uptime.sites.filter(s => s.siteId === selectedSite);
    const days = D.battery.period.days || D.uptime.period.days || 1;
    const totalEnergy = batterySites.reduce((sum, s) => sum + safe(s.totalEnergy), 0);
    const totalHours = batterySites.reduce((sum, s) => sum + safe(s.totalHours), 0);
    const siteCount = Math.max(1, batterySites.length);
    const energyPerSiteDay = totalEnergy / siteCount / days;
    const hoursPerSiteDay = totalHours / siteCount / days;
    const tempRows = D.uptime.bms.temperatureSummary.filter(r => batterySites.some(s => s.id === r.siteId));
    const avgTemp = tempRows.length ? tempRows.reduce((sum, r) => sum + safe(r.avg), 0) / tempRows.length : 0;
    const ceUptime = safe(D.uptime.grandTotal?.ce_sla_uptime_pct);
    const siteUptime = safe(D.uptime.grandTotal?.site_uptime_pct);

    document.getElementById("app").innerHTML = `<div class="combined-page">
        ${uptimeSection(D.uptime, uptimeSites, selectedSite)}
        ${batteryUsageSection(D.battery, batterySites)}
        ${cycleSection(D.battery, batterySites, days)}
        ${distribution(D.battery, batterySites)}
</div>`;

    const firstHeader = document.querySelector(".combined-page-kpis");
    if (firstHeader) {
        const energyEl = firstHeader.querySelector('[data-role="energy"]');
        const hoursEl = firstHeader.querySelector('[data-role="hours"]');
        const tempEl = firstHeader.querySelector('[data-role="temp"]');
        if (energyEl) energyEl.textContent = `${n(energyPerSiteDay)} kWh/day`;
        if (hoursEl) hoursEl.textContent = `${n(hoursPerSiteDay)} h/day`;
        if (tempEl) tempEl.textContent = `${n(avgTemp)} °C`;
    }
}

function uptimeSection(U, sites, selectedSite) {
    const gt = U.grandTotal || {};
    const rows = sites;
    const events = U.events.filter(e => selectedSite === "ALL" || e.siteId === selectedSite);
    return section("Uptime SLA", "Site uptime & CE SLA", `
        <div class="combined-kpis combined-page-kpis">
            <div class="combined-kpi ce"><span>CE Uptime</span><b>${n(gt.ce_sla_uptime_pct)}%</b></div>
            <div class="combined-arrow">➜</div>
            <div class="combined-kpi site"><span>Site Uptime</span><b>${n(gt.site_uptime_pct)}%</b></div>
            <div class="combined-arrow">➜</div>
            <div class="combined-kpi energy"><span>Battery Energy</span><b data-role="energy">—</b></div>
            <div class="combined-arrow">➜</div>
            <div class="combined-kpi run"><span>Battery Run</span><b data-role="hours">—</b></div>
            <div class="combined-arrow">➜</div>
            <div class="combined-kpi temp"><span>Temp Aver.</span><b data-role="temp">—</b></div>
        </div>
        <div class="combined-note-grid">
            <div class="combined-titlebar">Table 1: ${periodLabel(U.filters?.start_utc)} Site Uptime &amp; CE SLA</div>
            <div class="scroll"><table class="uptime-table">
                <thead><tr><th>Site</th><th>Site Uptime<br>(%)</th><th>Site Downtime<br>(h)</th><th>Data Gaps<br>(records)</th><th>CE-Attributable Downtime<br>(h)</th><th>CE SLA Uptime<br>(%)</th></tr></thead>
                <tbody>${rows.map(r => `<tr><td>${r.siteId}</td><td>${n(r.siteUptimePct)}%</td><td>${n(r.siteDowntimeHours)}</td><td>${n(r.missingDataRows,0)}</td><td>${n(r.ceAttributableDowntimeHours)}</td><td>${n(r.ceSlaUptimePct)}%</td></tr>`).join("")}</tbody>
                <tfoot><tr><td>Total</td><td>${n(gt.site_uptime_pct)}%</td><td>${n(gt.site_downtime_hours)}</td><td>${n(gt.missing_data_rows,0)}</td><td>${n(gt.ce_attributable_downtime_hours)}</td><td>${n(gt.ce_sla_uptime_pct)}%</td></tr></tfoot>
            </table></div>
            <div class="combined-footnote">Note: Missing data rows are excluded from uptime/downtime calculation. CE SLA downtime only applies where the site goes down while CE's contractual backup-energy entitlement remains unfulfilled.</div>
        </div>
        <div class="combined-note-grid">
            <div class="combined-titlebar">Table 2: Critical Backup / Downtime Events — ${periodLabel(U.filters?.start_utc)}</div>
            <div class="scroll"><table class="event-table">
                <thead><tr><th rowspan="2">Site</th><th rowspan="2">Event</th><th rowspan="2">Backup Start</th><th rowspan="2">Site Downtime</th><th rowspan="2">Downtime<br>(h)</th><th rowspan="2">Battery Run<br>(h)</th><th colspan="5">Key Event Evidence</th><th rowspan="2">CE SLA Downtime<br>(h)</th></tr><tr><th>Opening SOC<br>(%)</th><th>Closing SOC<br>(%)</th><th>Available Energy<br>(kWh)</th><th>Actual Energy<br>Delivered (kWh)</th><th>Remaining SLA<br>Energy (kWh)</th></tr></thead>
                <tbody>${events.map(e => `<tr><td>${e.siteId}</td><td>${e.event}</td><td>${fmtDate(e.backupStart)}</td><td>${e.siteDowntime || "—"}</td><td>${n(e.downtimeHours)}</td><td>${e.batteryRunHours == null ? "—" : n(e.batteryRunHours)}</td><td>${e.openingSocPct == null ? "—" : n(e.openingSocPct,1)}</td><td>${e.endingSocPct == null ? "—" : n(e.endingSocPct,1)}</td><td>${e.availableEnergyKwh == null ? "—" : n(e.availableEnergyKwh)}</td><td>${e.energyDeliveredKwh == null ? "—" : n(e.energyDeliveredKwh)}</td><td>${e.remainingSlaEnergyKwh == null ? "—" : n(e.remainingSlaEnergyKwh)}</td><td>${e.ceSlaDowntimeHours == null ? "—" : n(e.ceSlaDowntimeHours)}</td></tr>`).join("")}</tbody>
            </table></div>
            <div class="combined-footnotes"><b>Footnotes:</b><br>1. Battery energy delivered is calculated from measured battery current and voltage over the RMS intervals during the backup event.<br>2. Available energy is calculated from opening SOC down to the configured minimum usable SOC boundary.<br>3. SLA entitlement is the lesser of contractual SLA energy and theoretical available battery energy at the start of the event.<br>4. Physical battery operation may continue below the 15% boundary; the boundary is used only to determine contractual SLA entitlement.<br>5. Missing RMS data is excluded from site uptime/downtime calculations and does not create artificial battery energy.</div>
        </div>
    `);
}

function periodLabel(start) {
    if (!start) return "Selected Period";
    const d = new Date(start);
    return d.toLocaleString("en-US", { month: "long" });
}

function batteryUsageSection(B, sites) {
    const totalFullHours = sites.reduce((s,r)=>s+safe(r.fh),0);
    const totalPartialHours = sites.reduce((s,r)=>s+safe(r.ph),0);
    const totalFullEnergy = sites.reduce((s,r)=>s+safe(r.fe),0);
    const totalPartialEnergy = sites.reduce((s,r)=>s+safe(r.pe),0);
    const fullRuns = sites.reduce((s,r)=>s+safe(r.fr),0);
    const partialRuns = sites.reduce((s,r)=>s+safe(r.pr),0);
    return section("Battery Usage", "Battery contribution to customer load, usage duration and measured battery energy throughput.", `
        <div class="kpis five">
            <div class="kpi blue"><div class="icon">◷</div><div class="l">Total Battery Usage</div><div class="v">${h(totalFullHours+totalPartialHours)}</div></div>
            <div class="kpi green"><div class="icon">ϟ</div><div class="l">Total Battery Energy</div><div class="v">${e(totalFullEnergy+totalPartialEnergy)}</div></div>
            <div class="kpi cyan"><div class="icon">⟳</div><div class="l">Total Contribution Runs</div><div class="v">${fullRuns+partialRuns}</div></div>
            <div class="kpi purple"><div class="icon">▣</div><div class="l">Full Battery Usage</div><div class="v">${h(totalFullHours)}</div><div class="s">(${fullRuns} runs | ${n(totalFullEnergy)} kWh)</div></div>
            <div class="kpi orange"><div class="icon">▣</div><div class="l">Partial Battery Usage</div><div class="v">${h(totalPartialHours)}</div><div class="s">(${partialRuns} runs | ${n(totalPartialEnergy)} kWh)</div></div>
        </div>
        <div class="scroll"><table class="battery-summary-table"><thead><tr><th rowspan="2">Site-ID</th><th colspan="3">Runs (Count)</th><th colspan="3">Duration (Hours)</th><th colspan="3">Energy (kWh)</th></tr><tr><th>Full</th><th>Partial</th><th>Total</th><th>Full</th><th>Partial</th><th>Total</th><th>Full</th><th>Partial</th><th>Total</th></tr></thead><tbody>${sites.map(s=>`<tr><td>${s.id}</td><td>${s.fr}</td><td>${s.pr}</td><td>${s.fr+s.pr}</td><td>${n(s.fh)}</td><td>${n(s.ph)}</td><td>${n(s.totalHours)}</td><td>${n(s.fe)}</td><td>${n(s.pe)}</td><td>${n(s.totalEnergy)}</td></tr>`).join("")}</tbody></table></div>`);
}

function cycleSection(B, sites, days) {
    const slaPerDay = safe(B.cycle?.slaPerDay || 1.6);
    const rows = sites.map(s=>({id:s.id, energy:safe(s.totalEnergy), hours:safe(s.totalHours), actual:safe(s.achievedCyclesPerDay), variance:safe(s.variance)}));
    const avg = rows.length ? rows.reduce((s,r)=>s+r.actual,0)/rows.length : 0;
    const variance = avg-slaPerDay;
    return section("Battery SLA Cycle Tracking", "Actual battery throughput against the SLA cycle-energy basis, normalized per site per day.", `
        <div class="cycle-top"><div class="cc target"><div class="l">SLA Target</div><div class="v">${n(slaPerDay)} <small>cycles/site/day</small></div></div><div class="cc achieved"><div class="l">Portfolio Average Achieved</div><div class="v">${n(avg)} <small>cycles/site/day</small></div></div><div class="cc variance ${variance>=0?'positive':'negative'}"><div class="l">Portfolio Average Excess/(Deficit)</div><div class="v">${variance>=0?'+':''}${n(variance)} <small>cycles/site/day</small></div></div></div>
        <div class="cycle-grid"><div class="scroll"><table><thead><tr><th>Site-ID</th><th>Battery Energy Throughput<br>Per Day</th><th>Total</th><th>Backup Hrs<br>Per Day</th><th>Total</th><th>Cycles Per Day</th><th>Excess<br>(Deficit)</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.id}</td><td>${n(r.energy/days)}</td><td>${n(r.energy)}</td><td>${n(r.hours/days)}</td><td>${n(r.hours)}</td><td>${n(r.actual)}</td><td class="${r.variance>=0?'positive':'negative'}">${r.variance>=0?'+':''}${n(r.variance)}</td></tr>`).join("")}</tbody></table></div><div class="chart-card"><div class="chart-title">SLA vs Achieved Cycles/Day</div>${cycleChart(slaPerDay,rows)}</div></div>
        <div class="note">Per Battery Cycle Energy Throughput = SLA (Load × Backup Hrs), e.g. 4 kW × 8 hrs = 32 kWh. SLA cycles per day = 1.60 cycles/site/day.</div>`);
}

function cycleChart(sla,rows){const W=620,H=260,p={l:42,r:18,t:28,b:38},plotW=W-p.l-p.r,plotH=H-p.t-p.b,max=Math.max(sla,...rows.map(r=>r.actual),1),axisMax=Math.ceil(max*2)/2,base=p.t+plotH,step=rows.length?plotW/rows.length:plotW,barW=Math.min(34,step*.32);let svg=`<svg viewBox="0 0 ${W} ${H}" class="svgchart">`;for(let i=0;i<=4;i++){const y=base-i*plotH/4,v=axisMax*i/4;svg+=`<line x1="${p.l}" y1="${y}" x2="${W-p.r}" y2="${y}" class="gridline"/><text x="${p.l-7}" y="${y+4}" text-anchor="end" class="axis">${v.toFixed(1)}</text>`;}rows.forEach((r,i)=>{const x=p.l+step*i+step/2,sy=base-sla/axisMax*plotH,ay=base-Math.min(r.actual,axisMax)/axisMax*plotH;svg+=`<rect x="${x-barW-2}" y="${sy}" width="${barW}" height="${base-sy}" class="bar-sla"/><rect x="${x+2}" y="${ay}" width="${barW}" height="${base-ay}" class="bar-achieved"/><text x="${x}" y="${H-15}" text-anchor="middle" class="axis">${r.id}</text>`;});return svg+`<rect x="${W-165}" y="7" width="11" height="11" class="bar-sla"/><text x="${W-148}" y="17" class="legend">SLA ${sla.toFixed(2)}</text><rect x="${W-75}" y="7" width="11" height="11" class="bar-achieved"/><text x="${W-58}" y="17" class="legend">Achieved</text></svg>`;}

function distribution(D, sites) {
    const use = sites.map(site => site.id);
    const rows = (D.durationSlabs || []).filter(row =>
        use.some(id =>
            (row.partial[siteKey(id)] || 0) +
            (row.full[siteKey(id)] || 0) > 0
        )
    );

    const fullTotal = use.reduce(
        (sum, id) => sum + (D.durationSlabs || []).reduce(
            (inner, row) => inner + (row.full[siteKey(id)] || 0),
            0
        ),
        0
    );

    const partialTotal = use.reduce(
        (sum, id) => sum + (D.durationSlabs || []).reduce(
            (inner, row) => inner + (row.partial[siteKey(id)] || 0),
            0
        ),
        0
    );

    return section(
        "Contribution Run Duration Distribution",
        "Only populated duration slabs are displayed. Cells show Contribution Run counts.",
        `<div class="distribution-grid">
            <div class="dist-box full-box">
                <div class="box-title">Full Contribution Runs</div>
                <div class="scroll matrix"><table>
                    <thead><tr><th>Duration Slab (Hrs)</th>${use.map(id => `<th>${id}</th>`).join("")}<th>Total</th></tr></thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr><td>${row.slab.replace(/\s*h(?:rs)?\b/gi, "")}</td>${use.map(id => `<td>${row.full[siteKey(id)] || "–"}</td>`).join("")}<td>${use.reduce((sum, id) => sum + (row.full[siteKey(id)] || 0), 0) || "–"}</td></tr>
                        `).join("")}
                    </tbody>
                    <tfoot><tr><td>Total</td>${use.map(id => `<td>${(D.durationSlabs || []).reduce((sum, row) => sum + (row.full[siteKey(id)] || 0), 0)}</td>`).join("")}<td>${fullTotal}</td></tr></tfoot>
                </table></div>
            </div>

            <div class="dist-box partial-box">
                <div class="box-title">Partial Contribution Runs</div>
                <div class="scroll matrix"><table>
                    <thead><tr><th>Duration Slab (Hrs)</th>${use.map(id => `<th>${id}</th>`).join("")}<th>Total</th></tr></thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr><td>${row.slab.replace(/\s*h(?:rs)?\b/gi, "")}</td>${use.map(id => `<td>${row.partial[siteKey(id)] || "–"}</td>`).join("")}<td>${use.reduce((sum, id) => sum + (row.partial[siteKey(id)] || 0), 0) || "–"}</td></tr>
                        `).join("")}
                    </tbody>
                    <tfoot><tr><td>Total</td>${use.map(id => `<td>${(D.durationSlabs || []).reduce((sum, row) => sum + (row.partial[siteKey(id)] || 0), 0)}</td>`).join("")}<td>${partialTotal}</td></tr></tfoot>
                </table></div>
            </div>

            <div class="chart-card distribution-chart">
                <div class="chart-title">Portfolio Duration Distribution</div>
                ${durationChart(rows, use)}
            </div>
        </div>
        <div class="note">Slab values are Contribution Run counts, not battery-stretch counts.</div>`
    );
}

function durationChart(rows, use) {
    const W = 620, H = 270;
    const p = { l: 44, r: 16, t: 36, b: 52 };
    const plotW = W - p.l - p.r;
    const plotH = H - p.t - p.b;

    const full = rows.map(row => use.reduce((sum, id) => sum + (row.full[siteKey(id)] || 0), 0));
    const partial = rows.map(row => use.reduce((sum, id) => sum + (row.partial[siteKey(id)] || 0), 0));
    const max = Math.max(...full.map((value, i) => value + partial[i]), 1);
    const axisMax = Math.ceil(max / 50) * 50 || 50;
    const step = rows.length ? plotW / rows.length : plotW;
    const barW = Math.min(34, step * 0.48);
    const base = p.t + plotH;

    let svg = `<svg viewBox="0 0 ${W} ${H}" class="svgchart" role="img" aria-label="Portfolio duration distribution by contribution type">`;

    for (let i = 0; i <= 4; i++) {
        const y = p.t + plotH - i * (plotH / 4);
        const value = axisMax * i / 4;
        svg += `<line x1="${p.l}" y1="${y}" x2="${W - p.r}" y2="${y}" class="gridline"/><text x="${p.l - 8}" y="${y + 4}" text-anchor="end" class="axis">${Math.round(value)}</text>`;
    }

    rows.forEach((row, i) => {
        const x = p.l + step * i + step / 2;
        const partialHeight = partial[i] / axisMax * plotH;
        const fullHeight = full[i] / axisMax * plotH;
        const top = base - partialHeight - fullHeight;

        svg += `<rect x="${x - barW / 2}" y="${base - partialHeight}" width="${barW}" height="${partialHeight}" class="bar-part"/>`;
        svg += `<rect x="${x - barW / 2}" y="${top}" width="${barW}" height="${fullHeight}" class="bar-full"/>`;
        svg += `<text x="${x}" y="${H - 27}" text-anchor="middle" class="axis">${row.slab.replace(" h", "")}</text>`;
    });

    svg += `<rect x="${W - 170}" y="10" width="11" height="11" class="bar-full"/><text x="${W - 153}" y="20" class="legend">Full Runs</text>`;
    svg += `<rect x="${W - 86}" y="10" width="11" height="11" class="bar-part"/><text x="${W - 69}" y="20" class="legend">Partial Runs</text></svg>`;

    return svg;
}

function temperatureSection(U,sites){const rows=U.bms.temperatureSummary.filter(r=>sites.some(s=>s.id===r.siteId));return section("Battery Temperature Monitoring","Temperature record from Battery Management System (BMS)",`<div class="scroll"><table class="temperature-summary"><thead><tr><th rowspan="2">Site-ID</th><th colspan="3">Temperature</th></tr><tr><th>Min</th><th>Max</th><th>Aver.</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.siteId}</td><td>${n(r.min)} °C</td><td>${n(r.max)} °C</td><td>${n(r.avg)} °C</td></tr>`).join("")}</tbody></table></div><div class="placeholder-note">Temporary BMS placeholder — per-battery temperature data is not yet supplied by the SQL/API.</div>`);}

function temperatureTrendSection(bms,sites){return section("Battery Temperature Trend","Temperature record from Battery Management System (BMS)",`<div class="trend-stack">${trendTable("Temperature Minimum",bms.temperatureTrend.min,sites,"°C")}${trendTable("Temperature Max",bms.temperatureTrend.max,sites,"°C")}${trendTable("Temperature Average",bms.temperatureTrend.average,sites,"°C")}</div><div class="placeholder-note">Temporary BMS placeholder — formulas and database fields will be integrated after validation.</div>`);}

function trendSection(title,sub,data,sites,type){const sets=type==='soc'?[['SOC Minimum',data.min,'%'],['SOC Max',data.max,'%']]:[['SOH Minimum',data.min,'%'],['SOH Max',data.max,'%']];return section(title,sub,`<div class="trend-stack">${sets.map(x=>trendTable(x[0],x[1],sites,x[2])).join("")}</div><div class="placeholder-note">Temporary BMS placeholder — no live SOC/SOH per-battery calculation is performed by the current SQL/API.</div>`);}

function trendTable(title,rows,sites,unit){const filtered=rows.filter(r=>sites.some(s=>s.id===r.siteId));return `<div class="trend-box"><table><thead><tr><th rowspan="2">Site-ID</th><th rowspan="2">Time Stamp</th><th colspan="8">${title}</th><th rowspan="2">Aver.</th></tr><tr>${Array.from({length:8},(_,i)=>`<th>B-${i+1}</th>`).join("")}</tr></thead><tbody>${filtered.map(r=>`<tr><td>${r.siteId}</td><td>${r.timestamp}</td>${r.batteries.map(v=>`<td>${n(v)}${unit}</td>`).join("")}<td>${n(r.average)}${unit}</td></tr>`).join("")}</tbody></table></div>`;}
