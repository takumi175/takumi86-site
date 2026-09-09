---
title: "GMKtec M8 のLANポートで速度が56倍違った話"
description: "同じ本体に付いている2つの有線LANポートで、実効速度が43KB/s と 2.4MB/s。リンク速度はどちらも1000Mb/sなのに何が違ったのか、切り分けの記録。"
pubDate: 2026-08-29
heroImage: "../../assets/blog/nic-speed-comparison.svg"
tags: ["ネットワーク", "Proxmox", "トラブルシューティング", "ミニPC"]
---

自宅サーバー用に買った GMKtec M8 に Proxmox を入れて、コンテナのテンプレートをダウンロードしようとしたら異様に遅かった。

**124MB のファイルに48分。** 平均 43.6KB/s。

結論から書くと、本体に付いている2つの LAN ポートのうち片方の実効速度が極端に低かった。もう一方に挿し替えたら 2.36MB/s 出た。**56倍の差。**

同じ症状で悩んでいる人のために、切り分けの過程を残しておく。

## 環境

- GMKtec M8（AMD Ryzen 5 PRO 6650H）
- Proxmox VE 9.2.2
- 有線LAN 2ポート（Realtek、ドライバは `r8169`）
- LANケーブルは CAT6a
- バッファローの中継機 WEX-5400AX6 経由で接続

## 症状

`pveam download` でコンテナテンプレートを落とすと、進捗が異常に遅い。

```
debian-13-standard_13.6-1_amd64.tar.zst
  15%[=====>              ]  19.16M  1.09MB/s  eta 97s
```

いや、これは解決後の表示だ。問題があったときはこうだった。

```
  0%[                     ]  768K  36.2KB/s  eta 45m 5s
```

45分。ADSL でもここまで遅くない。

## 切り分け1：CDN の経路を疑う

まず接続先を確認した。

```
$ ping -c 10 download.proxmox.com
PING sg.cdn.proxmox.com (51.79.228.122) 56(84) bytes of data.
64 bytes from sg.cdn.proxmox.com: icmp_seq=2 ttl=46 time=86.6 ms
...
10 packets transmitted, 9 received, 10% packet loss
```

**シンガポールのサーバーに繋がっていた。** ホスト名が `sg.cdn.proxmox.com`、応答時間 86ms、パケットロス10%。

日本のミラーを直接叩けば速くなるはずだと考えた。

```
$ wget http://jp.as.cdn.proxmox.com/images/system/debian-13-standard_13.6-1_amd64.tar.zst
Resolving jp.as.cdn.proxmox.com... 117.120.5.24
  0%[                     ]  617.57K  42.5KB/s  eta 41m 54s
```

**変わらない。** 日本のサーバーに繋いでも 42.5KB/s。CDN の経路は原因ではなかった。

## 切り分け2：リンク速度を確認

物理層を疑う。

```
$ ethtool nic1 | grep -i Speed
        Speed: 1000Mb/s
```

1Gbps でリンクしている。ケーブルも CAT6a（10Gbps 対応）なので、規格上のボトルネックはない。

この時点で「リンク速度は正常だから物理層は問題なし」と判断してしまったのだが、**これが最初の誤りだった。** リンク速度は「機器同士が合意した速度」であって、実際にデータが流れる速度ではない。

## 切り分け3：省電力機能（EEE）

Realtek の NIC では、省電力機能が原因で速度が落ちる報告がある。

```
$ ethtool --show-eee nic1
EEE settings for nic1:
        EEE status: enabled - active
        Tx LPI: 12 (us)
        Link partner advertised EEE link modes:  100baseT/Full
                                                 1000baseT/Full
```

**有効になっていた。** 中継機側も EEE に対応していて、両者が省電力モードで合意している状態だ。これが犯人に見えた。

```
$ ethtool --set-eee nic1 eee off
$ ethtool --show-eee nic1
        EEE status: disabled
```

再測定。

```
  0%[                     ]  617.57K  42.5KB/s  eta 41m 54s
```

**効果なし。** 容疑者から外れた。

## 切り分け4：ネットワークのどこが遅いのか

ここで方向を変えた。M8 が悪いのか、それとも中継機や回線が悪いのか。

まずノートPCで速度測定。Wi-Fi 経由で 25Mbps。回線自体は生きている。

次に、**M8 から抜いた LAN ケーブルをそのままノートPCに挿して**測定した。同じケーブル、同じ中継機ポート。

結果は 17Mbps。

M8 の 0.35Mbps に対して 50倍。**中継機は正常で、M8 側に問題があると確定した。**

## 切り分け5：もう一方のポート

M8 には LAN ポートが2つある。使っていなかった方を試す。

```
$ ip a
2: nic0: <BROADCAST,MULTICAST> mtu 1500 state DOWN
    link/ether 70:70:fc:0b:ce:91
3: nic1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 master vmbr0 state UP
    link/ether 70:70:fc:0b:ce:92
```

MAC アドレスが連番（`...ce91` と `...ce92`）。おそらく同じチップの2ポート構成だ。だとすればドライバは共通なので、結果は変わらないだろうと予想した。

ケーブルを `nic0` 側に挿し替えて、インターフェースを有効化する。

```
$ ip link set nic0 up
$ ethtool nic0 | grep -i -E "Speed|Link detected"
        Speed: 1000Mb/s
        Link detected: yes
$ dhclient nic0
```

ここで一度つまずいた。IP は取得できたのに外に出られない。

```
$ ip route
default via 192.168.11.1 dev vmbr0 proto kernel onlink linkdown
192.168.11.0/24 dev vmbr0 proto kernel scope link src 192.168.11.100 linkdown
192.168.11.0/24 dev nic0 proto kernel scope link src 192.168.11.13
```

**デフォルトルートが `vmbr0` を向いていて、しかも `linkdown`。** ケーブルが刺さっていない方に全パケットを流していた。

`nic0` 経由のルートを追加して、古い方を削除する。

```
$ ip route add default via 192.168.11.1 dev nic0 metric 50
$ ip route del default via 192.168.11.1 dev vmbr0
$ ping -c 3 8.8.8.8
3 packets transmitted, 3 received, 0% packet loss
```

通った。そして測定。

```
$ wget -O /dev/null http://jp.as.cdn.proxmox.com/images/system/debian-13-standard_13.6-1_amd64.tar.zst
  11.54M  2.36MB/s  eta 47s
```

**2.36MB/s。**

43.6KB/s に対して 56倍。同じケーブル、同じ中継機、同じドライバ、同じ設定。違うのはポートだけ。

## 対処

Proxmox のブリッジ `vmbr0` が束ねるポートを `nic1` から `nic0` に変更した。

管理画面の `システム` → `ネットワーク` で `vmbr0` を選んで `編集`、ブリッジポートを書き換えて `設定を適用`。あとはケーブルを挿し替えるだけ。IP アドレスは変わらないので、他の設定に影響はない。

なお、`ip link` や `ip route` で行った変更はすべてメモリ上の一時的なものなので、再起動すれば消える。設定ファイルを直接いじる必要はなかった。

## 原因の考察

ドライバの問題なら両方のポートが遅いはずなので、**ポート固有の不良**と考えるのが自然だろう。

リンク速度が 1000Mb/s と表示されるのに実効速度が出ないというのは、オートネゴシエーションは成立しているが、その先の物理層で何かが起きている状態だ。パケットロスは出ていなかったので、単純な断線でもない。

Windows 環境で同じ症状が出るかは確認していない。プリインストールの Windows は Proxmox で上書きしてしまったので、比較できなかった。ドライバとの相性という可能性も完全には否定できない。

返品も考えたが、2つあるうちの良い方を使えば実用上の問題はないので、そのまま運用している。

## まとめ

**リンク速度が正常でも実効速度は保証されない。** `ethtool` の `Speed: 1000Mb/s` を見て「物理層は問題なし」と判断したのが遠回りの原因だった。

**同じケーブルを別の機器に挿して測るのが一番速い切り分け。** これで「ネットワーク側」と「機器側」が一発で分かれる。

**LAN ポートが2つあるなら両方試す。** MAC アドレスが連番でも、実効速度が同じとは限らない。

同じミニPCで通信が遅いと感じている人は、まずもう一方のポートを試してみてほしい。数分で試せる。
