const BLOCKING_SEVERITIES = new Set(["high", "critical"]);
const SUPPORTED_AUDIT_REPORT_VERSION = 2;

function auditErrorMessage(report) {
  if (typeof report.message === "string" && report.message.length > 0) {
    return report.message;
  }

  if (typeof report.error === "object" && report.error !== null) {
    const summary =
      typeof report.error.summary === "string" ? report.error.summary : "";
    const detail =
      typeof report.error.detail === "string" ? report.error.detail : "";
    const combined = [summary, detail].filter(Boolean).join(": ");
    if (combined.length > 0) return combined;
  }

  return "npm audit がエラーを返しました";
}

export function validateAuditReport(report) {
  if (typeof report !== "object" || report === null || Array.isArray(report)) {
    throw new Error("npm audit のJSONがオブジェクトではありません");
  }

  if ("error" in report) {
    throw new Error(auditErrorMessage(report));
  }

  if (report.auditReportVersion !== SUPPORTED_AUDIT_REPORT_VERSION) {
    throw new Error(
      `未対応の npm audit レポート形式です: ${String(
        report.auditReportVersion
      )}`
    );
  }

  if (
    typeof report.vulnerabilities !== "object" ||
    report.vulnerabilities === null ||
    Array.isArray(report.vulnerabilities)
  ) {
    throw new Error("npm audit のJSONに vulnerabilities がありません");
  }

  return report.vulnerabilities;
}

export function advisoryId(url) {
  if (typeof url !== "string") return null;
  const match = url.match(/GHSA-[0-9a-z-]+/i);
  return match ? match[0].toUpperCase() : null;
}

// vulnerabilities[name].via は、根本原因のアドバイザリ（オブジェクト）か
// 別パッケージ名（文字列）のどちらか。文字列は辿って根本原因まで解決する。
export function collectAdvisories(name, vulnerabilities, seen = new Set()) {
  if (seen.has(name)) return [];
  seen.add(name);

  const entry = vulnerabilities[name];
  if (
    typeof entry !== "object" ||
    entry === null ||
    !Array.isArray(entry.via)
  ) {
    return [];
  }

  const advisories = [];
  for (const via of entry.via) {
    if (typeof via === "string") {
      advisories.push(...collectAdvisories(via, vulnerabilities, seen));
    } else if (typeof via === "object" && via !== null) {
      advisories.push(via);
    }
  }
  return advisories;
}

export function evaluateAuditReport(report, allowedAdvisoryIds) {
  const vulnerabilities = validateAuditReport(report);
  const allowed = new Set(
    allowedAdvisoryIds.map((id) => id.toUpperCase())
  );

  const failures = [];
  let allowedCount = 0;

  for (const [name, entry] of Object.entries(vulnerabilities)) {
    if (
      typeof entry !== "object" ||
      entry === null ||
      !BLOCKING_SEVERITIES.has(entry.severity)
    ) {
      continue;
    }

    const advisories = collectAdvisories(name, vulnerabilities);
    if (advisories.length === 0) {
      failures.push({
        name,
        severity: entry.severity,
        advisories: [],
        reason: "根本アドバイザリを解決できませんでした",
      });
      continue;
    }

    const blocking = advisories.filter(
      (advisory) => !allowed.has(advisoryId(advisory.url))
    );

    if (blocking.length === 0) {
      allowedCount += 1;
      continue;
    }

    failures.push({
      name,
      severity: entry.severity,
      advisories: blocking,
      reason: null,
    });
  }

  return { failures, allowedCount };
}
