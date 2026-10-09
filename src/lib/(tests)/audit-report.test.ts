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
              severity: "high",
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
              severity: "high",
            },
          ],
        },
      }),
      [ALLOWED_ID]
    );

    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].name).toBe("vulnerable");
  });

  it.each(["info", "low", "moderate"])(
    "許可済みhighと合流した未許可%sを失敗にしない",
    (severity) => {
      const result = evaluateAuditReport(
        reportWith({
          accepted: {
            severity: "high",
            via: [
              {
                title: "accepted",
                url: `https://github.com/advisories/${ALLOWED_ID}`,
                severity: "high",
              },
            ],
          },
          lower: {
            severity,
            via: [
              {
                title: "lower severity vulnerability",
                url: "https://github.com/advisories/GHSA-1111-2222-3333",
                severity,
              },
            ],
          },
          transitive: {
            severity,
            via: ["lower"],
          },
          aggregate: {
            severity: "high",
            via: ["accepted", "lower", "transitive"],
          },
        }),
        [ALLOWED_ID]
      );

      expect(result.failures).toEqual([]);
      expect(result.allowedCount).toBe(2);
    }
  );

  it.each(["high", "critical", undefined, "unknown"])(
    "許可済みhighと合流しても未許可の重大度%sを失敗にする",
    (severity) => {
      const unaccepted = {
        title: "unaccepted vulnerability",
        url: "https://github.com/advisories/GHSA-1111-2222-3333",
        severity,
      };
      const result = evaluateAuditReport(
        reportWith({
          aggregate: {
            severity: "critical",
            via: [
              {
                title: "accepted",
                url: `https://github.com/advisories/${ALLOWED_ID}`,
                severity: "high",
              },
              {
                title: "moderate vulnerability",
                url: "https://github.com/advisories/GHSA-4444-5555-6666",
                severity: "moderate",
              },
              unaccepted,
            ],
          },
        }),
        [ALLOWED_ID]
      );

      expect(result.failures).toEqual([
        {
          name: "aggregate",
          severity: "critical",
          advisories: [unaccepted],
          reason: null,
        },
      ]);
      expect(result.allowedCount).toBe(0);
    }
  );

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
