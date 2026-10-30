/*
====================================================================
 CE RMS Battery Usage — API -> GUI Mapping
 MAPPING VERSION: V1.6
====================================================================

The API response from get_battery_usage_stretches is authoritative.
This module performs ONLY data mapping and presentation-level
normalisation. It does not recalculate Battery Usage business logic.

API sections mapped explicitly:
    api_version
    calculation
    filters
    grand_total
    site_summary
    duration_slabs
    data_quality

Temperature is intentionally separate because the current Battery
Usage RPC does not return temperature data; V1.6 retains the existing
UI placeholder until a temperature API is connected.
====================================================================
*/

const SITE_KEY = site => String(site || "").replace(/-/g, "");

function num(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function mapGrandTotal(source = {}) {
    return {
        fullHours: num(source.full_hours),
        partialHours: num(source.partial_hours),
        totalHours: num(source.total_hours),
        fullRunCount: num(source.full_run_count),
        partialRunCount: num(source.partial_run_count),
        fullEnergyKwh: num(source.full_energy_kwh),
        partialEnergyKwh: num(source.partial_energy_kwh),
        totalBatteryEnergyKwh: num(source.total_battery_energy_kwh)
    };
}

function mapSiteSummary(source = []) {
    return (Array.isArray(source) ? source : []).map(site => ({
        siteId: site.site_id,
        fullRunCount: num(site.full_run_count),
        fullHours: num(site.full_hours),
        fullEnergyKwh: num(site.full_energy_kwh),
        partialRunCount: num(site.partial_run_count),
        partialHours: num(site.partial_hours),
        partialEnergyKwh: num(site.partial_energy_kwh),
        totalHours: num(site.total_hours),
        totalBatteryEnergyKwh: num(site.total_battery_energy_kwh)
    }));
}

function mapDurationSlabs(source = []) {
    const bySlab = new Map();

    for (const item of Array.isArray(source) ? source : []) {
        const slab = item.slab || "";
        if (!slab) continue;

        if (!bySlab.has(slab)) {
            bySlab.set(slab, {
                slab,
                startHours: num(item.slab_start_hours),
                endHours: num(item.slab_end_hours),
                partial: {},
                full: {}
            });
        }

        const row = bySlab.get(slab);
        const site = item.site_id;
        if (!site) continue;

        const count = num(item.run_count);
        const type = String(item.contribution_type || "").toLowerCase();

        if (type === "partial") {
            row.partial[SITE_KEY(site)] = count;
        } else if (type === "full") {
            row.full[SITE_KEY(site)] = count;
        }
    }

    return [...bySlab.values()].sort((a, b) =>
        a.startHours - b.startHours
    );
}

function mapDataQuality(source = []) {
    return (Array.isArray(source) ? source : []).map(item => ({
        siteId: item.site_id,
        expectedRecords: num(item.expected_records),
        receivedRecords: num(item.received_records),
        missingRecords: num(item.missing_records),
        duplicateRecords: num(item.duplicate_records),
        recordsWithMissingRequiredFields: num(
            item.records_with_missing_required_fields
        ),
        calculationReadyRecords: num(item.calculation_ready_records),
        dataCoveragePct: num(item.data_coverage_pct)
    }));
}

function mapTemperaturePlaceholder() {
    return {
        ABJ1: [24.1, 31.8, [25, 24.6, 24.1, 25.3, 31.8, 30.9, 29.8, 30.2]],
        ABJ2: [23.7, 32.4, [24, 24.3, 23.7, 25.1, 32.4, 31.7, 30.8, 31.2]],
        LAG1: [25.2, 34.1, [25.2, 26.1, 26.4, 27, 34.1, 33.6, 32.9, 33.2]],
        LAG2: [24.8, 33.5, [24.8, 25.2, 25.5, 26, 33.5, 32.8, 32.2, 32.9]]
    };
}

export function mapBatteryUsageApi(api, { days, slaKwh = 32, slaPerDay = 1.6 } = {}) {
    const grandTotal = mapGrandTotal(api?.grand_total);
    const sites = mapSiteSummary(api?.site_summary);

    const siteQuality = new Map(
        mapDataQuality(api?.data_quality).map(row => [row.siteId, row])
    );

    const siteRows = sites.map(site => {
        const totalEnergy = site.totalBatteryEnergyKwh;
        const achievedCyclesPerDay = days > 0 && slaKwh > 0
            ? totalEnergy / slaKwh / days
            : 0;

        return {
            id: site.siteId,
            ph: site.partialHours,
            fh: site.fullHours,
            pe: site.partialEnergyKwh,
            fe: site.fullEnergyKwh,
            fr: site.fullRunCount,
            pr: site.partialRunCount,
            totalHours: site.totalHours,
            totalEnergy,
            achievedCyclesPerDay,
            variance: achievedCyclesPerDay - slaPerDay,
            quality: siteQuality.get(site.siteId) || {
                siteId: site.siteId,
                expectedRecords: 0,
                receivedRecords: 0,
                missingRecords: 0,
                duplicateRecords: 0,
                recordsWithMissingRequiredFields: 0,
                calculationReadyRecords: 0,
                dataCoveragePct: 0
            }
        };
    });

    return {
        apiVersion: api?.api_version || "",
        calculation: api?.calculation || "",
        filters: {
            siteId: api?.filters?.site_id ?? null,
            startUtc: api?.filters?.start_utc ?? null,
            endUtc: api?.filters?.end_utc ?? null
        },
        grandTotal,
        sites: siteRows,
        durationSlabs: mapDurationSlabs(api?.duration_slabs),
        dataQuality: mapDataQuality(api?.data_quality),
        cycle: {
            slaKwh,
            slaPerDay
        },
        temperature: mapTemperaturePlaceholder(),
        rawApi: api || {}
    };
}
