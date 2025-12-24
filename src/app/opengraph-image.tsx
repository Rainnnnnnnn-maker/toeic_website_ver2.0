import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "TOEIC重要単語";
export const size = {
	width: 1200,
	height: 630,
};

export const contentType = "image/png";

async function loadGoogleFont(font: string, text: string) {
	const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
	const css = await (await fetch(url)).text();
	const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

	if (resource) {
		const res = await fetch(resource[1]);
		return res.arrayBuffer();
	}

	throw new Error("failed to load font");
}

export default async function Image() {
	const fontData = await loadGoogleFont(
		"Noto+Sans+JP",
		"TOEIC重要単語頻出の重要単語をAI解説で効率よく学べるLEVELUPYOURSCORE2026年版学習モードでAI解説と一緒に単語を攻略TOEICWordsAI解説付きincrease/allocate/revenue頻出ビジネス英語を例文と一緒にチェック単語数:200+toeic-words.com",
	);

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				background:
					"radial-gradient(circle at 0% 0%, #e0f2fe 0, #f9fafb 45%, #ffffff 100%)",
				fontFamily: '"Noto Sans JP", sans-serif',
			}}
		>
			<div
				style={{
					width: 1040,
					height: 520,
					borderRadius: 32,
					padding: 48,
					boxShadow:
						"0 32px 80px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(148, 163, 184, 0.2)",
					background:
						"linear-gradient(135deg, rgba(255,255,255,0.98), rgba(239,246,255,0.98))",
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "stretch",
					gap: 40,
				}}
			>
				<div
					style={{
						flex: 3,
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: 18,
						}}
					>
						<div
							style={{
								fontSize: 20,
								letterSpacing: 6,
								textTransform: "uppercase",
								color: "#64748b",
						}}
						>
							LEVEL UP YOUR SCORE
						</div>
						<div
							style={{
								fontSize: 52,
								lineHeight: 1.2,
								fontWeight: 700,
								color: "#0f172a",
						}}
						>
							2026年版 TOEIC 重要単語集
						</div>
						<div
							style={{
								fontSize: 26,
								lineHeight: 1.6,
								color: "#6b7280",
								maxWidth: 640,
						}}
						>
							頻出単語を効率よく学習して、スコアアップを目指しましょう。
						</div>
					</div>
					<div
						style={{
							marginTop: 32,
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							padding: "14px 32px",
							borderRadius: 999,
							backgroundColor: "rgba(22, 163, 195, 0.35)",
							border: "2px solid #2a2a65",
							color: "#051d4c",
							fontSize: 26,
							fontWeight: 600,
							boxShadow: "0 14px 30px rgba(15, 23, 42, 0.18)",
						}}
					>
						学習モードでAI解説と一緒に単語を攻略
					</div>
				</div>
				<div
					style={{
						flex: 2,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<div
						style={{
							width: 360,
							height: 260,
							borderRadius: 24,
							background:
								"linear-gradient(145deg, #1d4ed8, #22c55e, #eab308)",
							padding: 24,
							boxShadow:
								"0 18px 40px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(15, 23, 42, 0.3)",
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							color: "#f9fafb",
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
						}}
						>
							<div
								style={{
									fontSize: 20,
									fontWeight: 600,
							}}
							>
								TOEIC Words
							</div>
							<div
								style={{
									fontSize: 18,
									padding: "6px 12px",
									borderRadius: 999,
									backgroundColor: "rgba(15, 23, 42, 0.3)",
							}}
							>
								AI解説付き
							</div>
						</div>
						<div
							style={{
								marginTop: 16,
								fontSize: 28,
								fontWeight: 700,
							}}
						>
							increase / allocate / revenue
						</div>
						<div
							style={{
								marginTop: 8,
								fontSize: 18,
								opacity: 0.9,
							}}
						>
							頻出ビジネス英語を例文と一緒にチェック
						</div>
						<div
							style={{
								marginTop: 18,
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
						}}
						>
							<div
								style={{
									fontSize: 16,
									opacity: 0.9,
							}}
							>
								単語数: 200+
							</div>
							<div
								style={{
									width: 38,
									height: 38,
									borderRadius: 999,
									backgroundColor: "rgba(15, 23, 42, 0.7)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
							}}
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M8 5v14l11-7z"
										fill="#e5e7eb"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>
				<div
					style={{
						position: "absolute",
						bottom: 32,
						left: 80,
						fontSize: 18,
						color: "#6b7280",
					}}
				>
					toeic-words.com
				</div>
			</div>
		</div>,
		{
			...size,
			fonts: [
				{
					name: "Noto Sans JP",
					data: fontData,
					style: "normal",
				},
			],
		},
	);
}
