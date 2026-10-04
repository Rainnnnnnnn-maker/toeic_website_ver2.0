#!/usr/bin/env node
// `npm audit` には「特定のアドバイザリだけを除外する」機能が無いため、
// 意図的に受容した脆弱性を明示的に許可リスト化した上で、
// それ以外の high 以上が出たら失敗させるゲート。
//
// CI で `npm audit --audit-level=high` をそのまま使うと落ち続けるが、
// かといって continue-on-error で丸ごと無視すると「今後増える dev 依存の脆弱性」も
// 見逃してしまうため、受容済みのものだけをピンポイントで除外する。

import { execFileSync } from "node:child_process";
import { evaluateAuditReport } from "./audit-report.mjs";

// 受容済みアドバイザリ。期限を過ぎたら（上流が直った可能性があるため）失敗させて見直す。
const ALLOWLIST = [
  {
    id: "GHSA-vfj7-8cjw-p6xm",
    expires: "2026-11-30",
    reason: [
      "braces の深いネストによるスタック枯渇 DoS。アドバイザリ範囲 <=3.0.3 は最新版 3.0.3 を",
      "含み、修正版が存在しないため overrides での回避もできない。",
      "経路は tailwindcss@3（chokidar / micromatch / fast-glob）と eslint-config-next",
      "（@next/eslint-plugin-next → fast-glob → micromatch）の2つ。npm audit が提示する",
      "tailwindcss@4 への --force 更新は破壊的変更なうえ、eslint-config-next 側の経路が残る。",
      "dev 依存のみで本番バンドルには入らず（npm audit --omit=dev は0件）、悪用には自前の",
      "tailwind content / ESLint 設定へ細工した glob パターンを書く必要があるため実質到達不能。",
    ].join("\n      "),
  },
];

function runAudit() {
  try {
    return execFileSync("npm", ["audit", "--json"], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    // 脆弱性が見つかると npm audit は非ゼロ終了するが、JSON は stdout に出力される
    if (error.stdout) return error.stdout;
    throw error;
  }
}

function main() {
  const today = new Date().toISOString().slice(0, 10);

  const expired = ALLOWLIST.filter((item) => item.expires < today);
  if (expired.length > 0) {
    for (const item of expired) {
      console.error(
        `許可リストの期限が切れています: ${item.id}（期限 ${item.expires}）`
      );
      console.error("  上流が修正済みか確認し、未修正なら期限を延長してください。");
    }
    process.exit(1);
  }

  const report = JSON.parse(runAudit());
  const { failures, allowedCount } = evaluateAuditReport(
    report,
    ALLOWLIST.map((item) => item.id)
  );

  if (allowedCount > 0) {
    console.log(`受容済みアドバイザリに由来する high 以上: ${allowedCount} 件（除外）`);
    for (const item of ALLOWLIST) {
      console.log(`  - ${item.id}（見直し期限 ${item.expires}）`);
      console.log(`      ${item.reason}`);
    }
  }

  if (failures.length === 0) {
    console.log("許可リスト外の high 以上の脆弱性はありません。");
    return;
  }

  console.error(`\n許可リスト外の脆弱性が ${failures.length} 件あります:`);
  for (const failure of failures) {
    console.error(`  - ${failure.name}（${failure.severity}）`);
    if (failure.reason) {
      console.error(`      ${failure.reason}`);
    }
    for (const advisory of failure.advisories) {
      console.error(`      ${advisory.title}`);
      console.error(`      ${advisory.url}`);
    }
  }
  console.error(
    "\n修正するか、正当な理由がある場合は scripts/check-audit.mjs の ALLOWLIST に追加してください。"
  );
  process.exit(1);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`npm audit の実行または解析に失敗しました: ${message}`);
  process.exit(1);
}
