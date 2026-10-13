export interface AnimeItem {
	/** 作品名 */
	title: string;
	/** 制作会社・放送年など、右側に出る補足 */
	note?: string;
	/** 公式サイトなどへのリンク */
	url?: string;
}

export const anime: AnimeItem[] = [
	{ title: 'ヴァイオレット・エヴァーガーデン', note: '京都アニメーション / 2018' },
	{ title: 'メイドインアビス', note: 'キネマシトラス / 2017' },
	{ title: '無職転生 〜異世界行ったら本気だす〜', note: 'スタジオバインド / 2021' },
	{ title: '86 -エイティシックス-', note: 'A-1 Pictures / 2021' },
	{ title: '葬送のフリーレン', note: 'マッドハウス / 2023' },
	{ title: '呪術廻戦', note: 'MAPPA / 2020' },
	{ title: 'チェンソーマン', note: 'MAPPA / 2022' },
	{ title: '薬屋のひとりごと', note: 'TOHO animation STUDIO / 2023' },
	{ title: '進撃の巨人', note: 'WIT STUDIO / 2013' },
	{ title: 'Re:ゼロから始める異世界生活', note: 'WHITE FOX / 2016' },
	{ title: 'この素晴らしい世界に祝福を!', note: 'スタジオディーン / 2016' },
	{ title: '転生したらスライムだった件', note: 'エイトビット / 2018' },
	{ title: 'ソードアート・オンライン', note: 'A-1 Pictures / 2012' },
];
