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
		// name には ASIN を仮置きしている。商品名に置き換えて、
		// spec / meta / pros / cons を埋めると記事と /gear の両方に反映される。
		category: 'デスク周り',
		description: '作業机で使っているもの',
		items: [
			{ name: 'B07X5VJQ3D', url: 'https://www.amazon.co.jp/dp/B07X5VJQ3D' },
			{ name: 'B0BJTSFN8Z', url: 'https://www.amazon.co.jp/dp/B0BJTSFN8Z' },
			{ name: 'B0F4PDMS9G', url: 'https://www.amazon.co.jp/dp/B0F4PDMS9G' },
			{ name: 'B0CKWT77XL', url: 'https://www.amazon.co.jp/dp/B0CKWT77XL' },
			{ name: 'B0FDQK9T7D', url: 'https://www.amazon.co.jp/dp/B0FDQK9T7D' },
			{ name: 'B0GYWTMWVH', url: 'https://www.amazon.co.jp/dp/B0GYWTMWVH' },
			{ name: 'B0D9Y1J4NH', url: 'https://www.amazon.co.jp/dp/B0D9Y1J4NH' },
			{ name: 'B07V1XJ56J', url: 'https://www.amazon.co.jp/dp/B07V1XJ56J' },
			{ name: 'B08C37944Z', url: 'https://www.amazon.co.jp/dp/B08C37944Z' },
			{ name: 'B07LH1ZDSL', url: 'https://www.amazon.co.jp/dp/B07LH1ZDSL' },
		],
	},
];
