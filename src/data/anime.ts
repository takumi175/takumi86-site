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
];
