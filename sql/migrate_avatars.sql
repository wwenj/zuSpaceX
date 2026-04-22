-- ============================================================
-- 头像地址迁移：线上 CDN URL → 本地静态路径
-- 执行前请先备份 user 表
-- ============================================================

UPDATE `user` SET `avatar` = '/media/avatars/avatar-01.png' WHERE `avatar` = 'https://file.ljcdn.com/nebula/cdba8a31294a431991abc41113a7e2f8_1768990635630.png';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-02.png' WHERE `avatar` = 'https://file.ljcdn.com/nebula/820ecceb5375467187d0c6afc66df007_1768990636134.png';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-03.png' WHERE `avatar` = 'https://file.ljcdn.com/nebula/b3df28746a3f42dc82b2976ca800708c_1768982720474.png';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-04.png' WHERE `avatar` = 'https://file.ljcdn.com/nebula/5dffafc8c1a84529b474118b83555b78_1768982719371.png';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-05.png' WHERE `avatar` = 'https://file.ljcdn.com/nebula/4ee35710f06743878ecf1be0a77a026f_1768982719995.png';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-06.png' WHERE `avatar` = 'https://file.ljcdn.com/nebula/db732b10d6f54196bfe033833d53859b_1768982718856.png';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-07.png' WHERE `avatar` = 'https://file.ljcdn.com/nebula/6791de09ae954027a7c5182447c22881_1768975407156.png';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-08.png' WHERE `avatar` = 'https://file.ljcdn.com/nebula/a5eb21f33e8546fe80ee44833a66ac0e_1768965624778.png';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-09.png' WHERE `avatar` = 'https://file.ljcdn.com/nebula/df53b6d4428d4183826cb14a9697117c_1768964043157.png';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-10.jpeg' WHERE `avatar` = 'https://file.ljcdn.com/nebula/8499b993ad2e49bea369aa91f6b5d96d_1768962374205.jpeg';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-11.jpeg' WHERE `avatar` = 'https://file.ljcdn.com/nebula/ee5a55e52eba4c94b665c9d32b120090_1768962339011.jpeg';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-12.jpeg' WHERE `avatar` = 'https://file.ljcdn.com/nebula/704cac7b3904440895af5f1dad326024_1768962320509.jpeg';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-13.jpeg' WHERE `avatar` = 'https://file.ljcdn.com/nebula/bfde94d2b68940d483fe4a04e31eff24_1768962320838.jpeg';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-14.jpeg' WHERE `avatar` = 'https://file.ljcdn.com/nebula/a1092802030a475fb655eabf6963552f_1768962321086.jpeg';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-15.jpeg' WHERE `avatar` = 'https://file.ljcdn.com/nebula/e4edc0b55d604be584d856756fa383da_1768962321299.jpeg';
UPDATE `user` SET `avatar` = '/media/avatars/avatar-16.jpeg' WHERE `avatar` = 'https://file.ljcdn.com/nebula/a80104af67a241d18547406f598ece7b_1768962320220.jpeg';
