import type { ImageMetadata } from 'astro';

// 写真を追加するときは、src/assets/gear/ に画像を置いてここで import し、
// 該当アイテムの image に渡す。image を省略した項目はプレースホルダーが表示される。
//
//   import m8 from '../assets/gear/m8.jpg';
//   ...
//   { name: 'GMKtec M8', image: m8, ... }

export interface GearItem {
	/** 製品名 */
	name: string;
	/** 型番やスペックの要約（1行） */
	spec?: string;
	/** 製品の写真。省略可 */
	image?: ImageMetadata;
	/** 購入時期・用途など、表で見せたい項目 */
	meta?: { label: string; value: string }[];
	/** 良かった点 */
	pros?: string[];
	/** 誤算・不満点 */
	cons?: string[];
	/** 関連する記事へのリンク */
	post?: { href: string; label: string };
	/** 販売ページへのリンク */
	url?: string;
}

export interface GearGroup {
	category: string;
	description?: string;
	items: GearItem[];
}

export const gear: GearGroup[] = [
	{
		category: '自宅サーバー',
		description: '24時間動かしている機材',
		items: [
			{
				name: 'GMKtec M8',
				spec: 'Ryzen 5 PRO 6650H / 16GB / SSD 512GB',
				meta: [
					{ label: '購入時期', value: '2026年8月' },
					{ label: '用途', value: '仮想化基盤（Proxmox VE）' },
					{ label: '実測消費電力', value: 'アイドル 15〜20W（月 約150円）' },
				],
				pros: [
					'静音で24時間動かせる。この性能を常時起動できるのは快適',
					'中古ノートPCを流用するより消費電力と静音性で有利だった',
				],
				cons: [
					'メモリが LPDDR5 の基板直付けで増設できない。商品ページには「DDR5 16GB」としか書かれていない',
					'16GB 固定になるため ZFS を諦めて ext4 を選ぶ判断が必要だった',
					'2つある有線LANポートのうち片方の実効速度が極端に低かった',
				],
				post: { href: '/blog/01-homeserver-overview/', label: '構築の記録' },
				url: 'https://www.amazon.co.jp/dp/B0GYWTMWVH',
			},
			{
				name: 'Raspberry Pi 5',
				spec: 'Obsidian の同期サーバー（CouchDB）',
				meta: [
					{ label: '購入時期', value: '大学1年の春休み' },
					{ label: '用途', value: 'Obsidian 同期 / メトリクス送信' },
				],
				pros: ['公式の有料同期を使わずに Obsidian を複数端末で同期できる'],
				post: { href: '/blog/01-homeserver-overview/', label: '構成の全体像' },
			},
		],
	},
	{
		// 商品名は Amazon の商品ページから取得したもの。
		// pros / cons は未記入。使ってみた感想を追記すると記事と /gear の両方に反映される。
		category: 'デスク周り',
		description: '作業机で使っているもの',
		items: [
			{
				name: 'Dell E2425HSM',
				spec: '23.8型 / 1920×1080 / HDMI・DisplayPort・VGA / スピーカー内蔵',
				meta: [{ label: '用途', value: 'メインモニター' }],
				url: 'https://www.amazon.co.jp/dp/B0F4PDMS9G',
			},
			{
				name: 'ASUS VZ249HR',
				spec: '23.8型 / Eye Care',
				meta: [{ label: '用途', value: 'サブモニター' }],
				url: 'https://www.amazon.co.jp/dp/B07LH1ZDSL',
			},
			{
				name: 'ロジクール K250GR',
				spec: 'Bluetooth ワイヤレスキーボード / テンキー付き / 日本語配列 / 耐水',
				url: 'https://www.amazon.co.jp/dp/B0FDQK9T7D',
			},
			{
				name: 'ロジクール M575SPd',
				spec: '静音ワイヤレストラックボール',
				url: 'https://www.amazon.co.jp/dp/B0D9Y1J4NH',
			},
			{
				name: 'アイリスオーヤマ MNS-590',
				spec: 'モニター台 幅59cm / キーボードを下に収納できる',
				url: 'https://www.amazon.co.jp/dp/B08C37944Z',
			},
			{
				name: 'アイリスオーヤマ NPS-SBK',
				spec: 'ノートPCスタンド / 高さ・角度調整可 / 折り畳み式',
				url: 'https://www.amazon.co.jp/dp/B0CKWT77XL',
			},
			{
				name: 'Anker PowerExpand+ USB-C & HDMI 変換アダプター',
				spec: '4K 60Hz 対応',
				url: 'https://www.amazon.co.jp/dp/B07X5VJQ3D',
			},
			{
				name: 'エレコム T-K6A-2630BK',
				spec: '電源タップ 6個口 3m / 雷ガード / 個別スイッチ / ほこりシャッター',
				url: 'https://www.amazon.co.jp/dp/B07V1XJ56J',
			},
			{
				name: 'バッファロー WEX-5400AX6/N',
				spec: 'Wi-Fi 6 中継機 / 4803 + 573Mbps / Easy Mesh 対応',
				meta: [{ label: '備考', value: '自宅サーバーもこの中継機を経由して接続している' }],
				post: { href: '/blog/02-m8-nic-speed-issue/', label: 'LAN速度の切り分け' },
				url: 'https://www.amazon.co.jp/dp/B0BJTSFN8Z',
			},
		],
	},
];
