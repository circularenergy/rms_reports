/*
====================================================================
 CE RMS Uptime & Backup SLA — V1.7 API -> GUI MAPPING
====================================================================

The get_rms_uptime_sla RPC is authoritative. This module maps only
API output into a clean page model; it does not recalculate SLA logic.

TEMPORARY BMS PLACEHOLDERS
--------------------------------------------------------------------
The current Uptime/SLA and Battery Usage SQL functions do not return
per-battery temperature, SOC trend or SOH trend data. The following
placeholder structures are intentionally isolated here and are NOT
calculated from RMS data. They will be replaced when the required
DB fields and formulas are provided and tested.
====================================================================
*/

function num(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function mapSiteSummary(source = []) {
    return (Array.isArray(source) ? source : []).map(row => ({
        siteId: row.site_id,
        siteUptimePct: num(row.site_uptime_pct),
        siteDowntimeHours: num(row.site_downtime_hours),
        missingDataRows: num(row.missing_data_rows),
        recordsWithMissingRequiredFields: num(row.records_with_missing_required_fields),
        calculationReadyRecords: num(row.calculation_ready_records),
        duplicateTimestampRecords: num(row.duplicate_timestamp_records),
        ceAttributableDowntimeHours: num(row.ce_attributable_downtime_hours),
        ceSlaUptimePct: num(row.ce_sla_uptime_pct),
        validHours: num(row.valid_hours),
        unresolvedDataGapEvents: num(row.unresolved_data_gap_events),
        unresolvedDataGapHours: num(row.unresolved_data_gap_hours)
    }));
}

function mapCriticalEvents(source = []) {
    return (Array.isArray(source) ? source : []).map(row => ({
        siteId: row.site_id,
        event: row.event || "",
        eventNumber: row.event_number,
        backupStart: row.backup_start,
        backupEnd: row.backup_end,
        siteDowntimeStart: row.site_downtime_start,
        siteDowntimeEnd: row.site_downtime_end,
        siteDowntime: row.site_downtime || "",
        downtimeHours: num(row.downtime_hours),
        batteryRunHours: row.battery_run_hours == null ? null : num(row.battery_run_hours),
        numberOfGaps: row.number_of_gaps == null ? null : num(row.number_of_gaps),
        openingSocPct: row.opening_soc_pct == null ? null : num(row.opening_soc_pct),
        endingSocPct: row.ending_soc_pct == null ? null : num(row.ending_soc_pct),
        minSoc: row.min_soc == null ? null : num(row.min_soc),
        maxSoc: row.max_soc == null ? null : num(row.max_soc),
        batteryCapacityAh: row.battery_capacity_ah == null ? null : num(row.battery_capacity_ah),
        availableEnergyKwh: row.available_energy_kwh == null ? null : num(row.available_energy_kwh),
        contractualSlaEnergyKwh: row.contractual_sla_energy_kwh == null ? null : num(row.contractual_sla_energy_kwh),
        slaEntitlementKwh: row.sla_entitlement_kwh == null ? null : num(row.sla_entitlement_kwh),
        energyDeliveredKwh: row.energy_delivered_kwh == null ? null : num(row.energy_delivered_kwh),
        remainingSlaEnergyKwh: row.remaining_sla_energy_kwh == null ? null : num(row.remaining_sla_energy_kwh),
        ceSlaDowntimeHours: row.ce_sla_downtime_hours == null ? null : num(row.ce_sla_downtime_hours)
    }));
}

function mapDataQuality(source = []) {
    return (Array.isArray(source) ? source : []).map(row => ({
        siteId: row.site_id,
        expectedRecords: num(row.expected_records),
        receivedRecords: num(row.received_records),
        uniqueTimestampRecords: num(row.unique_timestamp_records),
        missingDataRows: num(row.missing_data_rows),
        recordsWithMissingRequiredFields: num(row.records_with_missing_required_fields),
        calculationReadyRecords: num(row.calculation_ready_records),
        duplicateTimestampRecords: num(row.duplicate_timestamp_records),
        unresolvedDataGapEvents: num(row.unresolved_data_gap_events),
        unresolvedDataGapHours: num(row.unresolved_data_gap_hours),
        minUtc: row.min_utc,
        maxUtc: row.max_utc
    }));
}

function placeholderBms() {
    /*
      PLACEHOLDER INPUTS — DO NOT INTERPRET AS LIVE BMS DATA.
      Future assumed SQL output fields:
        temperature_min_b1 ... temperature_min_b8
        temperature_max_b1 ... temperature_max_b8
        temperature_avg_b1 ... temperature_avg_b8
        soc_min_b1 ... soc_min_b8 / soc_max_b1 ... soc_max_b8
        soh_min_b1 ... soh_min_b8 / soh_max_b1 ... soh_max_b8
      These remain deliberately commented-out until formulas and DB
      fields are supplied and validated.
    */
    const sites = ["ABJ-1", "ABJ-2", "LAG-1", "LAG-2"];
    const values = {
        "ABJ-1": { min: 24, max: 31, avg: 27 },
        "ABJ-2": { min: 24, max: 32, avg: 28 },
        "LAG-1": { min: 24, max: 33, avg: 28.5 },
        "LAG-2": { min: 24, max: 34, avg: 29 }
    };
    return {
        temperatureSummary: sites.map(siteId => ({ siteId, ...values[siteId] })),
        temperatureTrend: {
            min: sites.map(siteId => ({ siteId, timestamp: "—", batteries: [24, 23, 23.5, 24.1, 25, 24.8, 24.7, 16.5], average: 23.2 })),
            max: sites.map(siteId => ({ siteId, timestamp: "—", batteries: [30, 31.5, 29.5, 29.9, 30.1, 31.2, 29.1, 28.9], average: 30 })),
            average: sites.map(siteId => ({ siteId, timestamp: "—", batteries: [27, 27.3, 26.5, 27, 27.6, 28, 26.9, 22.7], average: 26.6 }))
        },
        socTrend: {
            min: sites.map(siteId => ({ siteId, timestamp: "—", batteries: [24, 23, 23.5, 24.1, 25, 24.8, 24.7, 16.5], average: 23.2 })),
            max: sites.map(siteId => ({ siteId, timestamp: "—", batteries: [30, 31.5, 29.5, 29.9, 30.1, 31.2, 29.1, 28.9], average: 30 }))
        },
        sohTrend: {
            min: sites.map(siteId => ({ siteId, timestamp: "—", batteries: [24, 23, 23.5, 24.1, 25, 24.8, 24.7, 16.5], average: 23.2 })),
            max: sites.map(siteId => ({ siteId, timestamp: "—", batteries: [30, 31.5, 29.5, 29.9, 30.1, 31.2, 29.1, 28.9], average: 30 }))
        }
    };
}

export function mapUptimeSlaApi(api = {}) {
    return {
        apiVersion: api.api_version || "",
        calculation: api.calculation || "",
        filters: api.filters || {},
        businessRules: api.business_rules || {},
        grandTotal: api.grand_total || {},
        sites: mapSiteSummary(api.site_summary),
        events: mapCriticalEvents(api.critical_events),
        dataQuality: mapDataQuality(api.data_quality),
        bms: placeholderBms(),
        rawApi: api
    };
}
