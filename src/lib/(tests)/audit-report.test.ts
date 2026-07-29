import { describe, expect, it } from "vitest";
import {
  evaluateAuditReport,
  validateAuditReport,
} from "../../../scripts/audit-report.mjs";

const ALLOWED_ID = "GHSA-mh99-v99m-4gvg";

function reportWith(vulnerabilities: Record<string, unknown>) {
  return {
    auditReportVersion: 2,
    vulnerabilities,
  };
}

describe("validateAuditReport", () => {
  it("監査APIのエラーJSONを拒否する", () => {
    expect(() =>
      validateAuditReport({
        message: "audit endpoint returned an error",
        error: { summary: "", detail: "" },
      })
    ).toThrow("audit endpoint returned an error");
  });

  it("vulnerabilities のないJSONを拒否する", () => {
    expect(() =>
      validateAuditReport({ auditReportVersion: 2 })
    ).toThrow("vulnerabilities");
  });

  it("未対応のレポート形式を拒否する", () => {
    expect(() =>
      validateAuditReport({
        auditReportVersion: 3,
        vulnerabilities: {},
      })
    ).toThrow("未対応");
  });
});

describe("evaluateAuditReport", () => {
  it("許可済みアドバイザリだけに由来するhighを除外する", () => {
    const result = evaluateAuditReport(
      reportWith({
        "brace-expansion": {
          severity: "high",
          via: [
            {
              title: "accepted",
              url: `https://github.com/advisories/${ALLOWED_ID}`,
            },
          ],
        },
        minimatch: {
          severity: "high",
          via: ["brace-expansion"],
        },
      }),
      [ALLOWED_ID]
    );

    expect(result.failures).toEqual([]);
    expect(result.allowedCount).toBe(2);
  });

  it("許可リスト外のhighを失敗にする", () => {
    const result = evaluateAuditReport(
      reportWith({
        vulnerable: {
          severity: "high",
          via: [
            {
              title: "new vulnerability",
              url: "https://github.com/advisories/GHSA-1111-2222-3333",
            },
          ],
        },
      }),
      [ALLOWED_ID]
    );

    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].name).toBe("vulnerable");
  });

  it("根本アドバイザリを解決できないhighをfail-closedにする", () => {
    const result = evaluateAuditReport(
      reportWith({
        unresolved: {
          severity: "high",
          via: ["missing-package"],
        },
      }),
      [ALLOWED_ID]
    );

    expect(result.failures).toEqual([
      {
        name: "unresolved",
        severity: "high",
        advisories: [],
        reason: "根本アドバイザリを解決できませんでした",
      },
    ]);
  });
});
