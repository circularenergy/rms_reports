import { n, h, e, section, modal } from "./ui.js";

const siteKey = id => String(id || "").replace(/-/g, "");
const safe = value => Number.isFinite(Number(value)) ? Number(value) : 0;

export function render(D, selectedSite) {
    const sites = selectedSite === "ALL"
        ? D.sites
        : D.sites.filter(site => site.id === selectedSite);

    const partialHours = sites.reduce((sum, site) => sum + safe(site.ph), 0);
    const fullHours = sites.reduce((sum, site) => sum + safe(site.fh), 0);
    const partialEnergy = sites.reduce((sum, site) => sum + safe(site.pe), 0);
    const fullEnergy = sites.reduce((sum, site) => sum + safe(site.fe), 0);
    const fullRuns = sites.reduce((sum, site) => sum + safe(site.fr), 0);
    const partialRuns = sites.reduce((sum, site) => sum + safe(site.pr), 0);
    const totalEnergy = partialEnergy + fullEnergy;

    const portfolioActual = sites.length
        ? sites.reduce((sum, site) => sum + safe(site.achievedCyclesPerDay), 0) / sites.length
        : 0;

    const portfolioVariance = portfolioActual - safe(D.cycle.slaPerDay);

    document.getElementById("app").innerHTML = `
        ${section(
            "Portfolio Overview (Grand Total)",
            "Selected reporting scope.",
            `<div class="kpis five">
                <div class="kpi blue"><div class="icon">◷</div><div class="l">Total Battery Usage</div><div class="v">${h(partialHours + fullHours)}</div></div>
                <div class="kpi green"><div class="icon">ϟ</div><div class="l">Total Battery Energy</div><div class="v">${e(totalEnergy)}</div></div>
                <div class="kpi cyan"><div class="icon">⟳</div><div class="l">Total Contribution Runs</div><div class="v">${fullRuns + partialRuns}</div></div>
                <div class="kpi purple"><div class="icon">▣</div><div class="l">Full Battery Usage</div><div class="v">${h(fullHours)}</div><div class="s">(${fullRuns} runs | ${n(fullEnergy)} kWh)</div></div>
                <div class="kpi orange"><div class="icon">▣</div><div class="l">Partial Battery Usage</div><div class="v">${h(partialHours)}</div><div class="s">(${partialRuns} runs | ${n(partialEnergy)} kWh)</div></div>
            </div>`
        )}
        ${siteSummary(sites)}
        ${cycle(D, sites)}
        ${temperature(D, sites)}
        ${distribution(D, selectedSite)}
        ${quality(sites)}
    `;

    document.querySelectorAll("[data-site]").forEach(button => {
        button.onclick = () => siteDetail(button.dataset.site, sites);
    });

    document.querySelectorAll("[data-temp]").forEach(button => {
        button.onclick = () => tempDetail(D, button.dataset.temp);
    });
}

function siteSummary(sites) {
    return section(
        "Site Performance Summary",
        "Live Battery Usage and measured battery energy by site.",
        `<div class="scroll"><table class="site-performance">
            <thead>
                <tr>
                    <th rowspan="2">Site ID</th>
                    <th colspan="3" class="group-full">Full Battery</th>
                    <th colspan="3" class="group-partial">Partial Battery</th>
                </tr>
                <tr>
                    <th class="full-cell">Runs</th>
                    <th class="full-cell">Hours</th>
                    <th class="full-cell">Energy (kWh)</th>
                    <th class="partial-cell">Runs</th>
                    <th class="partial-cell">Hours</th>
                    <th class="partial-cell">Energy (kWh)</th>
                </tr>
            </thead>
            <tbody>
                ${sites.map(site => `
                    <tr>
                        <td><button class="link" data-site="${site.id}">${site.id}</button></td>
                        <td class="full-cell">${site.fr}</td>
                        <td class="full-cell">${n(site.fh)}</td>
                        <td class="full-cell">${n(site.fe)}</td>
                        <td class="partial-cell">${site.pr}</td>
                        <td class="partial-cell">${n(site.ph)}</td>
                        <td class="partial-cell">${n(site.pe)}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table></div>`
    );
}

function cycle(D, sites) {
    const rows = sites.map(site => ({
        id: site.id,
        energy: safe(site.totalEnergy),
        hours: safe(site.totalHours),
        actual: safe(site.achievedCyclesPerDay),
        variance: safe(site.variance)
    }));

    const portfolioDaily = rows.length
        ? rows.reduce((sum, row) => sum + row.actual, 0) / rows.length
        : 0;

    const variance = portfolioDaily - safe(D.cycle.slaPerDay);

    return section(
        "Monthly SLA Battery Cycle Tracking",
        "Actual battery throughput against the SLA cycle-energy basis, normalized per site per day.",
        `<div class="cycle-top">
            <div class="cc target"><div class="l">SLA Target</div><div class="v">${n(D.cycle.slaPerDay)} <small>cycles/site/day</small></div></div>
            <div class="cc achieved"><div class="l">Portfolio Average Achieved</div><div class="v">${n(portfolioDaily)} <small>cycles/site/day</small></div></div>
            <div class="cc variance ${variance >= 0 ? "positive" : "negative"}"><div class="l">Portfolio Average Excess/(Deficit)</div><div class="v">${variance >= 0 ? "+" : ""}${n(variance)} <small>cycles/site/day</small></div></div>
        </div>
        <div class="cycle-grid">
            <div class="scroll"><table>
                <thead><tr><th>Site ID</th><th>Battery Energy Throughput<br>(kWh)</th><th>Total Hours</th><th>Achieved Cycles/Day</th><th>Excess/(Deficit)<br>Cycles per Day</th></tr></thead>
                <tbody>
                    ${rows.map(row => `
                        <tr>
                            <td>${row.id}</td>
                            <td>${n(row.energy)}</td>
                            <td>${n(row.hours)}</td>
                            <td>${n(row.actual)}</td>
                            <td class="${row.variance >= 0 ? "positive" : "negative"}">${row.variance >= 0 ? "+" : ""}${n(row.variance)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table></div>
            <div class="chart-card">
                <div class="chart-title">SLA vs Achieved Cycles/Day</div>
                ${cycleChart(D, rows)}
            </div>
        </div>
        <div class="note">Per Battery Cycle Energy Throughput = SLA (Load × Backup Hrs), e.g. 4 kW × 8 hrs = 32 kWh. SLA cycles per day = 1.60 cycles/site/day.<br>Monthly throughput reference = 1.60 × 32 kWh × 30 days = 1,536 kWh per site. Actual cycle achievement is normalized per site per day for the selected reporting period.</div>`
    );
}

function cycleChart(D, rows) {
    const W = 620, H = 260;
    const p = { l: 42, r: 18, t: 28, b: 42 };
    const plotW = W - p.l - p.r;
    const plotH = H - p.t - p.b;
    const max = 2.0;
    const step = rows.length ? plotW / rows.length : plotW;
    const barW = Math.min(34, step * 0.28);
    const base = p.t + plotH;

    let svg = `<svg viewBox="0 0 ${W} ${H}" class="svgchart" role="img" aria-label="SLA versus achieved cycles per day">`;

    for (let i = 0; i <= 4; i++) {
        const y = p.t + plotH - i * (plotH / 4);
        const value = (max / 4) * i;
        svg += `<line x1="${p.l}" y1="${y}" x2="${W - p.r}" y2="${y}" class="gridline"/><text x="${p.l - 7}" y="${y + 4}" text-anchor="end" class="axis">${value.toFixed(1)}</text>`;
    }

    rows.forEach((row, i) => {
        const x = p.l + step * i + step / 2;
        const slaY = base - (safe(D.cycle.slaPerDay) / max) * plotH;
        const actualY = base - (Math.min(row.actual, max) / max) * plotH;

        svg += `<rect x="${x - barW - 2}" y="${slaY}" width="${barW}" height="${base - slaY}" class="bar-sla"/>`;
        svg += `<rect x="${x + 2}" y="${actualY}" width="${barW}" height="${base - actualY}" class="bar-achieved"/>`;
        svg += `<text x="${x - barW / 2 - 2}" y="${Math.max(14, slaY - 6)}" text-anchor="middle" class="label">${safe(D.cycle.slaPerDay).toFixed(2)}</text>`;
        svg += `<text x="${x + barW / 2 + 2}" y="${Math.max(14, actualY - 6)}" text-anchor="middle" class="label">${row.actual.toFixed(2)}</text>`;
        svg += `<text x="${x}" y="${H - 19}" text-anchor="middle" class="axis">${row.id}</text>`;
    });

    svg += `<rect x="${W - 180}" y="8" width="11" height="11" class="bar-sla"/><text x="${W - 164}" y="18" class="legend">SLA ${safe(D.cycle.slaPerDay).toFixed(2)}</text>`;
    svg += `<rect x="${W - 95}" y="8" width="11" height="11" class="bar-achieved"/><text x="${W - 79}" y="18" class="legend">Achieved</text></svg>`;

    return svg;
}

function temperature(D, sites) {
    return section(
        "Battery Temperature Monitoring",
        "Site-level summary; click a site for individual battery temperatures.",
        `<div class="scroll"><table>
            <thead><tr><th>Site ID</th><th>Min</th><th>Avg</th><th>Max</th><th>Status</th></tr></thead>
            <tbody>
                ${sites.map(site => {
                    const t = D.temperature?.[siteKey(site.id)] || [0, 0, []];
                    const min = safe(t[0]);
                    const max = safe(t[1]);
                    const avg = (min + max) / 2;
                    return `<tr><td><button class="link" data-temp="${site.id}">${site.id}</button></td><td>${n(min)} °C</td><td>${n(avg)} °C</td><td>${n(max)} °C</td><td>◉ —</td></tr>`;
                }).join("")}
            </tbody>
        </table></div>`
    );
}

function distribution(D, selectedSite) {
    const use = selectedSite === "ALL"
        ? D.sites.map(site => site.id)
        : [selectedSite];

    const rows = D.durationSlabs.filter(row =>
        use.some(id =>
            (row.partial[siteKey(id)] || 0) +
            (row.full[siteKey(id)] || 0) > 0
        )
    );

    const fullTotal = use.reduce(
        (sum, id) => sum + D.durationSlabs.reduce(
            (inner, row) => inner + (row.full[siteKey(id)] || 0),
            0
        ),
        0
    );

    const partialTotal = use.reduce(
        (sum, id) => sum + D.durationSlabs.reduce(
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
                    <thead><tr><th>Duration Slab (h)</th>${use.map(id => `<th>${id}</th>`).join("")}<th>Total</th></tr></thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr><td>${row.slab}</td>${use.map(id => `<td>${row.full[siteKey(id)] || "–"}</td>`).join("")}<td>${use.reduce((sum, id) => sum + (row.full[siteKey(id)] || 0), 0) || "–"}</td></tr>
                        `).join("")}
                    </tbody>
                    <tfoot><tr><td>Total</td>${use.map(id => `<td>${D.durationSlabs.reduce((sum, row) => sum + (row.full[siteKey(id)] || 0), 0)}</td>`).join("")}<td>${fullTotal}</td></tr></tfoot>
                </table></div>
            </div>

            <div class="dist-box partial-box">
                <div class="box-title">Partial Contribution Runs</div>
                <div class="scroll matrix"><table>
                    <thead><tr><th>Duration Slab (h)</th>${use.map(id => `<th>${id}</th>`).join("")}<th>Total</th></tr></thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr><td>${row.slab}</td>${use.map(id => `<td>${row.partial[siteKey(id)] || "–"}</td>`).join("")}<td>${use.reduce((sum, id) => sum + (row.partial[siteKey(id)] || 0), 0) || "–"}</td></tr>
                        `).join("")}
                    </tbody>
                    <tfoot><tr><td>Total</td>${use.map(id => `<td>${D.durationSlabs.reduce((sum, row) => sum + (row.partial[siteKey(id)] || 0), 0)}</td>`).join("")}<td>${partialTotal}</td></tr></tfoot>
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

function quality(sites) {
    return section(
        "Data Quality",
        "Data coverage is presented separately from battery performance.",
        `<div class="scroll"><table>
            <thead><tr><th>Site ID</th><th>Expected Records</th><th>Received Records</th><th>Missing Records</th><th>Data Coverage %</th><th>Duplicate Records</th><th>Missing Required Fields</th><th>Calculation Ready Records</th><th>Calculation Ready %</th></tr></thead>
            <tbody>
                ${sites.map(site => {
                    const q = site.quality;
                    const expected = safe(q.expectedRecords);
                    const ready = safe(q.calculationReadyRecords);
                    const readyPct = expected ? ready / expected * 100 : 0;
                    return `<tr class="${safe(q.recordsWithMissingRequiredFields) > 0 && site.id === "ABJ-2" ? "warn" : ""}">
                        <td>${site.id}</td>
                        <td>${expected.toLocaleString()}</td>
                        <td>${safe(q.receivedRecords).toLocaleString()}</td>
                        <td>${safe(q.missingRecords).toLocaleString()}</td>
                        <td>${n(q.dataCoveragePct)}%</td>
                        <td>${safe(q.duplicateRecords).toLocaleString()}</td>
                        <td>${safe(q.recordsWithMissingRequiredFields).toLocaleString()}</td>
                        <td>${ready.toLocaleString()}</td>
                        <td>${n(readyPct)}%</td>
                    </tr>`;
                }).join("")}
            </tbody>
        </table></div>`
    );
}

function siteDetail(id, sites) {
    const site = sites.find(item => item.id === id);
    if (!site) return;

    modal(
        `${id} — Battery Usage Detail`,
        `<div class="detail">
            <div class="dc"><small>Total Usage</small><b>${h(site.ph + site.fh)}</b></div>
            <div class="dc"><small>Battery Energy</small><b>${e(site.pe + site.fe)}</b></div>
            <div class="dc"><small>Full Runs</small><b>${site.fr}</b></div>
            <div class="dc"><small>Partial Runs</small><b>${site.pr}</b></div>
        </div>
        <p>Production drill-down will show Contribution Runs and the underlying 15-minute RMS records supplied by the API.</p>`
    );
}

function tempDetail(D, id) {
    const t = D.temperature?.[siteKey(id)] || [0, 0, []];

    modal(
        `${id} — Battery Temperature Detail`,
        `<div class="scroll"><table>
            <thead><tr><th>Site</th>${t[2].map((_, i) => `<th>Battery ${i + 1}</th>`).join("")}</tr></thead>
            <tbody><tr><td>${id}</td>${t[2].map(value => `<td>${n(value)} °C</td>`).join("")}</tr></tbody>
        </table></div>`
    );
}
