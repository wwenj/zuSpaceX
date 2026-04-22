const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const MEDIA = {
  common: {
    avatarClosed: asset("media/common/avatar-closed.png"),
    avatarOpen: asset("media/common/avatar-open.png"),
    homeBanner: asset("media/common/home-banner.png"),
    cyberCover: asset("media/common/cyber-cover.jpeg"),
    recordIcon: asset("media/common/beian-icon.svg"),
    terminalAvatar: asset("media/avatars/avatar-07.png"),
  },
  placeholders: {
    profileAvatar: asset("media/placeholders/profile-avatar.svg"),
    wechatQr: asset("media/placeholders/contact-wechat.svg"),
    officialAccountQr: asset("media/placeholders/contact-channel.svg"),
  },
  social: {
    github: asset("media/social/github.svg"),
    juejin: asset("media/social/juejin.svg"),
    zhihu: asset("media/social/zhihu.svg"),
    wechat: asset("media/social/wechat.svg"),
    officialAccount: asset("media/social/official-account.svg"),
  },
  interests: {
    badminton: asset("media/interests/badminton.jpeg"),
    riding: asset("media/interests/riding.jpeg"),
    printing: asset("media/interests/printing.jpeg"),
    camping: asset("media/interests/camping.jpeg"),
  },
  game: {
    playerTank: asset("media/game/player-tank.png"),
    enemyTank: asset("media/game/enemy-tank.png"),
    enemyPlane: asset("media/game/enemy-plane.png"),
    resourceBox: asset("media/game/resource-box.png"),
    missile: asset("media/game/missile.png"),
    explosion: asset("media/game/explosion.png"),
  },
  avatars: [
    asset("media/avatars/avatar-01.png"),
    asset("media/avatars/avatar-02.png"),
    asset("media/avatars/avatar-03.png"),
    asset("media/avatars/avatar-04.png"),
    asset("media/avatars/avatar-05.png"),
    asset("media/avatars/avatar-06.png"),
    asset("media/avatars/avatar-07.png"),
    asset("media/avatars/avatar-08.png"),
    asset("media/avatars/avatar-09.png"),
    asset("media/avatars/avatar-10.jpeg"),
    asset("media/avatars/avatar-11.jpeg"),
    asset("media/avatars/avatar-12.jpeg"),
    asset("media/avatars/avatar-13.jpeg"),
    asset("media/avatars/avatar-14.jpeg"),
    asset("media/avatars/avatar-15.jpeg"),
    asset("media/avatars/avatar-16.jpeg"),
  ],
} as const;
