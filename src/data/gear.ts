export interface GearItem {
	/** 製品名 */
	name: string;
	/** 型番やスペックの要約（1行） */
	spec?: string;
	/** 関連する記事へのリンク */
	post?: { href: string; label: string };
	/** 販売ページへのリンク */
	url?: string;
}

export const gear: GearItem[] = [
	{
		name: 'GMKtec M8',
		spec: 'Ryzen 5 PRO 6650H / 16GB / SSD 512GB',
		url: 'https://www.amazon.co.jp/dp/B0GYWTMWVH',
	},
	{
		name: 'Raspberry Pi 5',
		spec: 'Obsidian の同期サーバー（CouchDB）',
	},
	{
		name: 'Dell E2425HSM',
		spec: '23.8型 / 1920×1080 / HDMI・DisplayPort・VGA / スピーカー内蔵',
		url: 'https://www.amazon.co.jp/dp/B0F4PDMS9G',
	},
	{
		name: 'ASUS VZ249HR',
		spec: '23.8型 / Eye Care',
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
		url: 'https://www.amazon.co.jp/dp/B0BJTSFN8Z',
	},
];
