import type { ImageMetadata } from 'astro';

// 表紙の写真を載せるときは src/assets/books/ に置いてここで import し、image に渡す。
// Amazon や出版社の書影画像は転載できないので、自分で撮った写真を使うこと。
// image を省略した項目は本のアイコンのプレースホルダーが表示される。
//
//   import sql from '../assets/books/sql.jpg';
//   ...
//   { title: '...', image: sql, ... }

export interface BookItem {
	/** 書名 */
	title: string;
	/** 著者名 */
	author?: string;
	/** 出版社・出版年など */
	publisher?: string;
	/** 表紙の写真。省略可 */
	image?: ImageMetadata;
	/** 読んだ時期 */
	readAt?: string;
	/** なぜ読んだか */
	why?: string;
	/** 読んでどうだったか */
	review?: string;
	/** どんな人に向くか */
	recommend?: string;
	/** 関連する記事へのリンク */
	post?: { href: string; label: string };
	/** 販売ページへのリンク */
	url?: string;
}

/**
 * 書名と著者から Amazon の検索URLを作る。
 * ASIN が分かっている本は item.url に直リンクを入れれば、そちらが優先される。
 */
export function amazonSearchUrl(item: BookItem): string {
	const q = [item.title, item.author].filter(Boolean).join(' ');
	return `https://www.amazon.co.jp/s?k=${encodeURIComponent(q)}&i=stripbooks`;
}

export interface BookGroup {
	category: string;
	description?: string;
	/** cards: 1冊ずつカード表示（コメントを書く本向け） / compact: 書名と著者だけの一覧 */
	layout?: 'cards' | 'compact';
	items: BookItem[];
}

export const books: BookGroup[] = [
	{
		category: '技術書',
		description: '作りながら読んだもの。why / review を埋めると詳しい紹介になる',
		layout: 'cards',
		items: [
			{ title: 'いちばんやさしいGit&GitHubの教本', author: '横田紋奈' },
			{ title: 'モダンJavaScriptの基本から始める React実践の教科書', author: 'じゃけぇ（岡田拓巳）' },
			{ title: '1冊ですべて身につくHTML & CSSとWebデザイン入門講座', author: 'Mana' },
			{ title: 'SQL 第2版 ゼロからはじめるデータベース操作', author: 'ミック' },
			{ title: '単体テストの考え方/使い方', author: 'Vladimir Khorikov' },
			{ title: '図解 Amazon Web Services の仕組みと技術がしっかりわかる教科書', author: 'NRIネットコム' },
			{ title: 'Claude CodeによるAI駆動開発', author: '平川知秀' },
			{ title: 'これからはじめるFigma Web・UIデザイン入門', author: '阿部文人' },
			{
				title: 'これ1冊でできる！ラズベリーパイ 超入門',
				author: '福田和宏',
				post: { href: '/blog/01-homeserver-overview/', label: 'ラズパイを使った構成' },
			},
			{ title: 'Jetson Nano 超入門 改訂第2版', author: 'Jetson Japan User Group' },
			{ title: '[第3版] Python機械学習プログラミング', author: 'Sebastian Raschka' },
			{ title: 'いきなりプログラミング Androidアプリ開発', author: 'Sara' },
			{ title: 'スマホで動くアプリを作ろう！ Flutter実践', author: '渋谷エミリ' },
			{ title: '10日でBlender練習帳', author: 'M design' },
			{
				title: 'PC自作の鉄則！2025',
				author: '日経PC21',
				post: { href: '/blog/01-homeserver-overview/', label: '自宅サーバーの構築' },
			},
		],
	},
	{
		category: '大学の勉強',
		layout: 'compact',
		items: [{ title: '線型代数（改訂版）', author: '長谷川浩司' }],
	},
	{
		category: '考え方',
		layout: 'compact',
		items: [
			{ title: '問いのデザイン 創造的対話のファシリテーション', author: '安斎勇樹' },
			{ title: 'ソクラテスの弁明', author: 'プラトン' },
		],
	},
	{
		category: '小説',
		description: '息抜きに読んだもの',
		layout: 'compact',
		items: [
			{ title: '成瀬は天下を取りにいく', author: '宮島未奈' },
			{ title: 'カフネ', author: '阿部暁子' },
			{ title: '汝、星のごとく', author: '凪良ゆう' },
			{ title: '流浪の月', author: '凪良ゆう' },
			{ title: '同志少女よ、敵を撃て', author: '逢坂冬馬' },
			{ title: '宙わたる教室', author: '伊与原新' },
			{ title: '52ヘルツのクジラたち', author: '町田そのこ' },
			{ title: 'そして、バトンは渡された', author: '瀬尾まいこ' },
			{ title: 'かがみの孤城', author: '辻村深月' },
			{ title: '六人の嘘つきな大学生', author: '浅倉秋成' },
			{ title: '正欲', author: '朝井リョウ' },
			{ title: 'コンビニ人間', author: '村田沙耶香' },
			{ title: '変な家', author: '雨穴' },
			{ title: '三体', author: '劉慈欣' },
			{ title: '白夜行', author: '東野圭吾' },
			{ title: '容疑者Xの献身', author: '東野圭吾' },
			{ title: '流星の絆', author: '東野圭吾' },
			{ title: '告白', author: '湊かなえ' },
			{ title: 'リバース', author: '湊かなえ' },
			{ title: 'ノルウェイの森', author: '村上春樹' },
		],
	},
];
