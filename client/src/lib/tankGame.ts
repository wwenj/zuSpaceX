/**
 * 2D 坦克小游戏 - 页面外挂式实现
 * 完全独立,不影响页面原有功能
 */

// 导入用户 API 和认证函数
import { userApi } from "../api";
import { getUserInfo } from "./auth";
import { MEDIA } from "./siteAssets";

// 图片资源 URLs
const IMAGES = {
  playerTank: MEDIA.game.playerTank,
  enemyTank: MEDIA.game.enemyTank,
  enemyPlane: MEDIA.game.enemyPlane,
  resourceBox: MEDIA.game.resourceBox,
  missile: MEDIA.game.missile,
  explosion: MEDIA.game.explosion,
};

// 图片加载管理器
class ImageLoader {
  private images: Map<string, HTMLImageElement> = new Map();
  private loadedCount = 0;
  private totalCount = 0;

  async loadAll(): Promise<void> {
    const entries = Object.entries(IMAGES);
    this.totalCount = entries.length;

    const promises = entries.map(([key, url]) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          this.images.set(key, img);
          this.loadedCount++;
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image: ${key}`);
          resolve(); // 继续加载其他图片
        };
        img.src = url;
      });
    });

    await Promise.all(promises);
  }

  get(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }

  isLoaded(): boolean {
    return this.loadedCount === this.totalCount;
  }
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

// 加成类型
type PowerUpType =
  | "bulletSpeed"
  | "fireRate"
  | "multiShot"
  | "shield"
  | "bulletStyle"
  | "scoreBonus";

// 加成接口
interface PowerUp {
  type: PowerUpType;
  value: number;
  icon: string;
}

// 敌人配置
interface EnemyConfig {
  imageKey: string; // 图片资源键名
  health: number; // 需要几发炮弹打爆
  probability: number; // 出现概率(0-1)
  speed: number; // 下落速度
  score: number; // 被打爆的积分
  powerUp?: PowerUp; // 被打爆后的奖励
  isBoss?: boolean; // 是否为Boss类型（大飞机，尺寸2倍）
  isMissile?: boolean; // 是否为飞弹类型（精准追踪）
}

// 波次难度配置接口
interface WaveConfig {
  waveNumber: number; // 波次编号
  scoreThreshold: number; // 达到该分数进入此波次
  speedMultiplier: number; // 速度倍率
  spawnInterval: number; // 生成敌人间隔（毫秒）
  resourceBoxMultiplier: number; // 资源箱生成倍率
  name: string; // 波次名称
}

// 波次配置 - 平衡难度（分数间隔更大，早期敌人更少）
const WAVE_CONFIGS: WaveConfig[] = [
  {
    waveNumber: 1,
    scoreThreshold: 0,
    speedMultiplier: 1.0,
    spawnInterval: 2000,
    resourceBoxMultiplier: 0.5,
    name: "第一波",
  },
  {
    waveNumber: 2,
    scoreThreshold: 800,
    speedMultiplier: 1.2,
    spawnInterval: 1600,
    resourceBoxMultiplier: 0.6,
    name: "第二波",
  },
  {
    waveNumber: 3,
    scoreThreshold: 2000,
    speedMultiplier: 1.4,
    spawnInterval: 1200,
    resourceBoxMultiplier: 0.7,
    name: "第三波",
  },
  {
    waveNumber: 4,
    scoreThreshold: 4000,
    speedMultiplier: 1.6,
    spawnInterval: 900,
    resourceBoxMultiplier: 0.8,
    name: "第四波",
  },
  {
    waveNumber: 5,
    scoreThreshold: 7000,
    speedMultiplier: 1.8,
    spawnInterval: 650,
    resourceBoxMultiplier: 0.9,
    name: "第五波",
  },
  {
    waveNumber: 6,
    scoreThreshold: 12000,
    speedMultiplier: 2.0,
    spawnInterval: 450,
    resourceBoxMultiplier: 1.0,
    name: "第六波",
  },
  {
    waveNumber: 7,
    scoreThreshold: 19000,
    speedMultiplier: 2.1,
    spawnInterval: 300,
    resourceBoxMultiplier: 1.0,
    name: "第七波",
  },
  {
    waveNumber: 8,
    scoreThreshold: 28000,
    speedMultiplier: 2.1,
    spawnInterval: 200,
    resourceBoxMultiplier: 1.0,
    name: "第八波",
  },
  {
    waveNumber: 9,
    scoreThreshold: 40000,
    speedMultiplier: 2.1,
    spawnInterval: 140,
    resourceBoxMultiplier: 1.0,
    name: "第九波",
  },
  {
    waveNumber: 10,
    scoreThreshold: 56000,
    speedMultiplier: 2.1,
    spawnInterval: 90,
    resourceBoxMultiplier: 1.0,
    name: "第十波",
  },
  {
    waveNumber: 11,
    scoreThreshold: 77000,
    speedMultiplier: 2.1,
    spawnInterval: 60,
    resourceBoxMultiplier: 1.0,
    name: "第十一波",
  },
  {
    waveNumber: 12,
    scoreThreshold: 105000,
    speedMultiplier: 2.1,
    spawnInterval: 40,
    resourceBoxMultiplier: 1.0,
    name: "地狱波",
  },
  {
    waveNumber: 13,
    scoreThreshold: 145000,
    speedMultiplier: 2.1,
    spawnInterval: 28,
    resourceBoxMultiplier: 1.0,
    name: "噩梦波",
  },
];

// 敌人类型基础配置
// 数量比：资源箱 : 敌方坦克 : 敌方飞机 : 大飞机
// 速度：资源箱最慢 < 坦克 < 飞机 < 大飞机最快
const ENEMY_CONFIGS: EnemyConfig[] = [
  // 敌方坦克 - 普通敌人（占比最高）
  {
    imageKey: "enemyTank",
    health: 1,
    probability: 0.5, // 50%
    speed: 100,
    score: 10,
  },
  // 敌方飞机 - 快速敌人
  {
    imageKey: "enemyPlane",
    health: 2,
    probability: 0.3, // 30%
    speed: 150,
    score: 30,
    powerUp: { type: "fireRate", value: 0.8, icon: "⚡" },
  },
  // 大飞机 - Boss级敌人（4血，2倍大小，中后期出现）
  {
    imageKey: "enemyPlane", // 使用同样的飞机图片
    health: 4,
    probability: 0.0, // 初始为0，中后期动态增加
    speed: 120,
    score: 100,
    powerUp: { type: "multiShot", value: 3, icon: "💥" },
    isBoss: true, // 标记为Boss类型
  },
  // 飞弹 - 精准追踪型威胁（前两波不出现，后期极低概率）
  {
    imageKey: "missile",
    health: 1, // 可以被打爆
    probability: 0.0, // 初始为0，第3波后动态调整
    speed: 350, // 极快飞行速度（从250提升到350）
    score: 200, // 高分奖励
    isMissile: true, // 标记为飞弹类型
  },
  // 资源箱 - 积分奖励（概率最高：40%）
  {
    imageKey: "resourceBox",
    health: 1,
    probability: 0.08, // 8.0%（总宝箱20%中的40%）
    speed: 60,
    score: 50,
    powerUp: { type: "scoreBonus", value: 0, icon: "💰" }, // value为0，实际积分在碰撞时随机生成
  },
  // 资源箱 - 护盾（概率第二：30%）
  {
    imageKey: "resourceBox",
    health: 1,
    probability: 0.06, // 6.0%（总宝箱20%中的30%）
    speed: 60,
    score: 200,
    powerUp: { type: "shield", value: 1, icon: "🛡️" },
  },
  // 资源箱 - 炮弹速度（概率第三：20%）
  {
    imageKey: "resourceBox",
    health: 1,
    probability: 0.04, // 4.0%（总宝箱20%中的20%）
    speed: 60,
    score: 50,
    powerUp: { type: "bulletSpeed", value: 1.5, icon: "🚀" },
  },
  // 资源箱 - 多发炮弹（概率最低：10%）
  {
    imageKey: "resourceBox",
    health: 1,
    probability: 0.02, // 2.0%（总宝箱20%中的10%）
    speed: 60,
    score: 100,
    powerUp: { type: "multiShot", value: 3, icon: "💥" },
  },
];

// 坦克类
class Tank implements GameObject {
  x: number;
  y: number;
  initialX: number;
  initialY: number;
  width = 50;
  height = 50;
  isDragging = false;
  dragOffsetX = 0;
  dragOffsetY = 0;
  lastFireTime = 0;
  baseFireInterval = 1000; // 基础发射间隔
  speed = 200; // 键盘移动速度(像素/秒)

  // 加成系统 - 可累加属性（大幅提升上限）
  shieldCount = 0; // 护盾层数（0-5层，可累加）
  maxShieldCount = 5; // 护盾层数上限
  bulletSpeed = 300; // 基础速度300
  maxBulletSpeed = 900; // 速度上限900（3倍）
  bulletCount = 1; // 基础1发
  maxBulletCount = 15; // 子弹数量上限15发（原7发）
  fireRateLevel = 0; // 射速等级（0-10）
  maxFireRateLevel = 10; // 射速等级上限（原5级）

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.initialX = x;
    this.initialY = y;
  }

  update(deltaTime: number): void {
    // 计算当前发射间隔(根据射速等级)
    // 等级0: 1000ms, 等级1: 920ms, ..., 等级10: 200ms（每级减少80ms）
    const currentFireInterval = Math.max(
      200,
      this.baseFireInterval - this.fireRateLevel * 80,
    );

    // 自动发射逻辑
    this.lastFireTime += deltaTime;
    if (this.lastFireTime >= currentFireInterval) {
      this.fire();
      this.lastFireTime = 0;
    }
  }

  // 应用加成 - 可累加系统
  applyPowerUp(powerUp: PowerUp): void {
    if (powerUp.type === "shield") {
      // 护盾可累加，最多5层
      if (this.shieldCount < this.maxShieldCount) {
        this.shieldCount++;
        console.log(`[Tank] 护盾层数增加至 ${this.shieldCount} 层`);
      } else {
        console.log(`[Tank] 护盾已达上限 ${this.maxShieldCount} 层`);
      }
    } else if (powerUp.type === "bulletSpeed") {
      // 子弹速度累加，每次增加50，上限900
      this.bulletSpeed = Math.min(this.bulletSpeed + 50, this.maxBulletSpeed);
      console.log(`[Tank] 子弹速度提升至 ${this.bulletSpeed}`);
    } else if (powerUp.type === "multiShot") {
      // 子弹数量累加，每次+1，上限15发
      if (this.bulletCount < this.maxBulletCount) {
        this.bulletCount++;
        console.log(`[Tank] 子弹数量增加至 ${this.bulletCount} 发`);
      } else {
        console.log(`[Tank] 子弹数量已达上限 ${this.maxBulletCount} 发`);
      }
    } else if (powerUp.type === "fireRate") {
      // 射速等级累加，每次+1，上限10级
      if (this.fireRateLevel < this.maxFireRateLevel) {
        this.fireRateLevel++;
        console.log(
          `[Tank] 射速等级提升至 ${this.fireRateLevel} 级（间隔${Math.max(200, 1000 - this.fireRateLevel * 80)}ms）`,
        );
      } else {
        console.log(`[Tank] 射速已达上限 ${this.maxFireRateLevel} 级`);
      }
    }
  }

  // 清空所有加成（非护盾）
  clearPowerUps(): void {
    this.bulletSpeed = 300;
    this.bulletCount = 1;
    this.fireRateLevel = 0;
    console.log(`[Tank] 所有加成已清空（护盾保留：${this.shieldCount}层）`);
  }

  // 清空所有加成包括护盾
  clearAllPowerUps(): void {
    this.shieldCount = 0;
    this.bulletSpeed = 300;
    this.bulletCount = 1;
    this.fireRateLevel = 0;
    console.log(`[Tank] 所有加成和护盾已清空`);
  }

  // 重置到初始位置
  reset(): void {
    this.x = this.initialX;
    this.y = this.initialY;
    this.isDragging = false; // 停止拖动状态
    this.clearAllPowerUps(); // 重置时清空所有加成包括护盾
  }

  // 键盘移动
  moveByKeyboard(
    direction: "up" | "down" | "left" | "right",
    deltaTime: number,
    canvasWidth: number,
    canvasHeight: number,
  ): void {
    const distance = this.speed * (deltaTime / 1000);

    switch (direction) {
      case "up":
        this.y = Math.max(0, this.y - distance);
        break;
      case "down":
        this.y = Math.min(canvasHeight - this.height, this.y + distance);
        break;
      case "left":
        this.x = Math.max(0, this.x - distance);
        break;
      case "right":
        this.x = Math.min(canvasWidth - this.width, this.x + distance);
        break;
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    currentScore?: number,
    imageLoader?: ImageLoader,
    showGameStart?: boolean,
  ): void {
    ctx.save();

    // 主角坦克发光描边效果
    ctx.shadowColor = "#00FF9D";
    ctx.shadowBlur = 12;

    // 护盾效果 - 单层护盾圆圈 + 层数文字
    if (this.shieldCount > 0) {
      // 绘制单层护盾圆圈
      ctx.strokeStyle = "#00E5FF";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#00E5FF";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        35,
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      // 显示护盾层数文字
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#00E5FF";
      ctx.font = "bold 14px Press Start 2P, monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        `🛡️${this.shieldCount}`,
        this.x + this.width / 2,
        this.y - 15,
      );

      ctx.shadowColor = "#00FF9D";
      ctx.shadowBlur = 12;
    }

    // 渲染坦克图片
    const tankImg = imageLoader?.get("playerTank");
    if (tankImg) {
      ctx.drawImage(tankImg, this.x, this.y, this.width, this.height);
    } else {
      // 降级：使用原有绘制逻辑
      ctx.fillStyle = "#00E5FF";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = "#33EFFF";
      ctx.fillRect(this.x + 15, this.y - 10, 20, 15);
    }

    ctx.restore();

    // 在坦克旁边显示当前分数
    if (currentScore !== undefined) {
      ctx.font = "14px Press Start 2P, monospace";
      ctx.fillStyle = "#00E5FF";
      ctx.shadowColor = "#00E5FF";
      ctx.shadowBlur = 8;
      ctx.textAlign = "left";
      ctx.fillText(
        `${currentScore}`,
        this.x + this.width + 10,
        this.y + this.height / 2 + 5,
      );
      ctx.shadowBlur = 0;
    }

    // 显示 GAME START 提示
    if (showGameStart) {
      ctx.font = "16px Press Start 2P, monospace";
      ctx.fillStyle = "#00FF9D";
      ctx.shadowColor = "#00FF9D";
      ctx.shadowBlur = 15;
      ctx.textAlign = "center";
      ctx.fillText("GAME START", this.x + this.width / 2, this.y - 15);
      ctx.shadowBlur = 0;
    }
  }

  fire(): void {
    if (this.bulletCount === 1) {
      // 单发子弹 - 垂直向上
      const bullet = new Bullet(
        this.x + this.width / 2 - 2.5,
        this.y - 10,
        this.bulletSpeed,
      );
      window.__tankGame__.addBullet(bullet);
    } else {
      // 多发子弹 - 扇形发射（缩小角度间隔，让炮弹更密集）
      const angleSpread = 5; // 角度间隔（度）- 从15度缩小到5度
      const baseAngle = -90; // 向上为基准（-90度）

      for (let i = 0; i < this.bulletCount; i++) {
        // 计算每发子弹的角度偏移
        const angleOffset = (i - (this.bulletCount - 1) / 2) * angleSpread;
        const angle = baseAngle + angleOffset;

        // 根据子弹数量调整水平偏移，让初始位置更靠近（从15缩小到8）
        const horizontalOffset = (i - (this.bulletCount - 1) / 2) * 8;

        const bullet = new Bullet(
          this.x + this.width / 2 - 2.5 + horizontalOffset,
          this.y - 10,
          this.bulletSpeed,
          angle,
        );
        window.__tankGame__.addBullet(bullet);
      }
    }
  }

  contains(x: number, y: number): boolean {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }

  startDrag(mouseX: number, mouseY: number): void {
    this.isDragging = true;
    this.dragOffsetX = mouseX - this.x;
    this.dragOffsetY = mouseY - this.y;
  }

  drag(
    mouseX: number,
    mouseY: number,
    canvasWidth: number,
    canvasHeight: number,
  ): void {
    if (this.isDragging) {
      this.x = Math.max(
        0,
        Math.min(canvasWidth - this.width, mouseX - this.dragOffsetX),
      );
      this.y = Math.max(
        0,
        Math.min(canvasHeight - this.height, mouseY - this.dragOffsetY),
      );
    }
  }

  stopDrag(): void {
    this.isDragging = false;
  }
}

// 子弹类
class Bullet implements GameObject {
  x: number;
  y: number;
  width = 5;
  height = 15;
  speed: number;
  active = true;
  angle: number; // 发射角度（度）
  vx: number; // x轴速度分量
  vy: number; // y轴速度分量

  constructor(x: number, y: number, speed: number = 300, angle: number = -90) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.angle = angle;

    // 根据角度计算速度分量
    const radians = (angle * Math.PI) / 180;
    this.vx = Math.cos(radians) * speed;
    this.vy = Math.sin(radians) * speed;
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 超出屏幕则失活
    if (
      this.y < -this.height ||
      this.x < -this.width ||
      this.x > window.innerWidth
    ) {
      this.active = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // 统一使用青绿渐变子弹
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(((this.angle + 90) * Math.PI) / 180); // 旋转子弹朝向

    const gradient = ctx.createLinearGradient(
      0,
      -this.height / 2,
      0,
      this.height / 2,
    );
    gradient.addColorStop(0, "#00E5FF");
    gradient.addColorStop(1, "#00FF9D");
    ctx.fillStyle = gradient;
    ctx.shadowColor = "#00E5FF";
    ctx.shadowBlur = 10;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}

// 敌人类
class Enemy implements GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  config: EnemyConfig;
  currentHealth: number;
  active = true;
  hitFlashTime = 0; // 受击闪烁计时器
  glowTime = 0; // 资源箱发光动画计时器
  // 飞弹追踪相关
  targetX: number = 0; // 目标X坐标
  targetY: number = 0; // 目标Y坐标
  velocityX: number = 0; // X方向速度
  velocityY: number = 0; // Y方向速度
  rotation: number = 0; // 飞弹旋转角度

  constructor(x: number, config: EnemyConfig, tankX?: number, tankY?: number) {
    this.x = x;
    this.config = config;
    this.currentHealth = config.health;

    // 大飞机尺寸为2倍
    if (config.isBoss) {
      this.width = 80; // 2倍大小
      this.height = 80; // 2倍大小
    } else if (config.isMissile) {
      this.width = 60; // 飞弹尺寸（从30放大到60）
      this.height = 90; // 飞弹高度（从50放大到90）
    } else {
      this.width = 40;
      this.height = 40;
    }

    this.y = -this.height;

    // 飞弹类型：计算追踪目标和速度向量
    if (config.isMissile && tankX !== undefined && tankY !== undefined) {
      this.targetX = tankX;
      this.targetY = tankY;

      // 计算飞弹到坦克的方向向量
      const dx = tankX - x;
      const dy = tankY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 归一化并乘以速度
      if (distance > 0) {
        this.velocityX = (dx / distance) * config.speed;
        this.velocityY = (dy / distance) * config.speed;

        // 计算旋转角度（飞弹头朝向目标）
        this.rotation = Math.atan2(dy, dx) + Math.PI / 2;
      }
    }
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;

    // 飞弹追踪移动
    if (this.config.isMissile) {
      this.x += this.velocityX * dt;
      this.y += this.velocityY * dt;
    } else {
      // 普通敌人直线下落
      this.y += this.config.speed * dt;
    }

    // 受击闪烁倒计时
    if (this.hitFlashTime > 0) {
      this.hitFlashTime -= deltaTime;
    }

    // 资源箱发光动画
    if (this.config.imageKey === "resourceBox") {
      this.glowTime += deltaTime;
    }

    // 超出屏幕则失活
    if (
      this.y > window.innerHeight ||
      this.x < -this.width ||
      this.x > window.innerWidth
    ) {
      this.active = false;
    }
  }

  takeDamage(): boolean {
    this.currentHealth--;
    // 触发受击闪烁效果
    if (this.currentHealth > 0) {
      this.hitFlashTime = 200; // 200毫秒闪烁
    }
    return this.currentHealth <= 0;
  }

  render(ctx: CanvasRenderingContext2D, imageLoader?: ImageLoader): void {
    ctx.save();

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    // 移动到中心点
    ctx.translate(centerX, centerY);

    // 受击闪烁效果
    const isFlashing = this.hitFlashTime > 0;
    if (isFlashing) {
      ctx.globalAlpha = 0.5;
    }

    // 资源箱特殊效果：闪烁发光
    if (this.config.imageKey === "resourceBox") {
      const glowIntensity = Math.sin(this.glowTime / 300) * 0.5 + 0.5; // 0.5-1.0之间波动
      ctx.shadowColor = "#FFC107";
      ctx.shadowBlur = 15 + glowIntensity * 10;
    } else if (this.config.isMissile) {
      // 飞弹：按追踪角度旋转，保留原图清晰度
      ctx.rotate(this.rotation);
      ctx.shadowColor = "#FF3355"; // 轻微红色预警
      ctx.shadowBlur = 6; // 轻微发光，不遮挡原图
    } else if (this.config.isBoss) {
      // 大飞机Boss：旋转180度 + 紫色强烈发光
      ctx.rotate(Math.PI);
      ctx.shadowColor = "#FF00FF"; // 霓虹紫色
      ctx.shadowBlur = 20; // 更强的发光效果
    } else {
      // 普通敌方单位：旋转180度 + 红色描边发光
      ctx.rotate(Math.PI);
      ctx.shadowColor = "#FF3355";
      ctx.shadowBlur = 8;
    }

    // 渲染图片
    const enemyImg = imageLoader?.get(this.config.imageKey);
    if (enemyImg) {
      ctx.drawImage(
        enemyImg,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height,
      );
    } else {
      // 降级：使用原有绘制逻辑
      ctx.fillStyle = "#FF3355";
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }

    ctx.restore();

    // 显示生命值（多次击打才爆炸的敌人）
    if (this.config.health > 1 && this.config.imageKey !== "resourceBox") {
      ctx.fillStyle = "#E6E6E6";
      ctx.font = "12px Press Start 2P, monospace";
      ctx.textAlign = "center";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 3;
      ctx.fillText(`${this.currentHealth}`, centerX, this.y + this.height + 15);
      ctx.shadowBlur = 0;
    }
  }
}

// 加成提示文字类
class PowerUpText {
  x: number;
  y: number;
  text: string;
  alpha = 1;
  active = true;
  duration = 2000; // 持续时间2秒
  elapsed = 0;
  offsetY = 0;

  constructor(
    x: number,
    y: number,
    powerUpType: PowerUpType,
    customText?: string,
  ) {
    this.x = x;
    this.y = y;

    // 如果有自定义文本，直接使用
    if (customText) {
      this.text = customText;
    } else {
      // 根据加成类型显示文字
      switch (powerUpType) {
        case "bulletSpeed":
          this.text = "+ 速度";
          break;
        case "fireRate":
          this.text = "+ 频率";
          break;
        case "multiShot":
          this.text = "+ 炮弹";
          break;
        case "shield":
          this.text = "+ 护盾";
          break;
        case "bulletStyle":
          this.text = "+ 样式";
          break;
        case "scoreBonus":
          this.text = "+ 积分";
          break;
      }
    }
  }

  update(deltaTime: number): void {
    this.elapsed += deltaTime;
    const progress = this.elapsed / this.duration;

    // 向上浮动
    this.offsetY = -progress * 50;
    // 淡出
    this.alpha = 1 - progress;

    if (this.elapsed >= this.duration) {
      this.active = false;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.font = "16px Press Start 2P, monospace";
    ctx.fillStyle = "#00FF9D";
    ctx.shadowColor = "#00FF9D";
    ctx.shadowBlur = 10;
    ctx.textAlign = "left";
    ctx.fillText(this.text, this.x, this.y + this.offsetY);
    ctx.restore();
  }
}

// 波次提示文字类
class WaveNotification {
  alpha = 0;
  scale = 0.8;
  active = true;
  duration = 2000;
  elapsed = 0;
  text: string;
  subText: string;
  isFirstWave: boolean;
  glowIntensity = 0;
  pulsePhase = 0;
  particles: Array<{
    x: number;
    y: number;
    alpha: number;
    scale: number;
    speed: number;
  }> = [];

  constructor(waveName: string) {
    this.isFirstWave = waveName === "第一波";
    if (this.isFirstWave) {
      this.text = "GAME START";
      this.subText = isTouchDevice()
        ? "手指拖动坦克移动"
        : "鼠标拖动或键盘方向键控制坦克移动";
      this.duration = 3500;
      this.scale = 0.6;
      // 创建粒子效果
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: (Math.random() - 0.5) * 600,
          y: (Math.random() - 0.5) * 200,
          alpha: Math.random() * 0.5 + 0.3,
          scale: Math.random() * 0.5 + 0.5,
          speed: Math.random() * 2 + 1,
        });
      }
    } else {
      this.text = `${waveName}敌人即将来临！`;
      this.subText = "";
      this.duration = 2500;
    }
  }

  update(deltaTime: number): void {
    this.elapsed += deltaTime;
    const progress = this.elapsed / this.duration;

    if (this.isFirstWave) {
      // 第一波简洁动画
      if (progress < 0.2) {
        // 入场：从下方滑入 + 渐显
        const easeProgress = this.easeOutCubic(progress / 0.2);
        this.alpha = easeProgress;
        this.scale = easeProgress;
      } else if (progress < 0.8) {
        // 持续显示
        this.alpha = 1;
        this.scale = 1;
      } else {
        // 退场：向上淡出
        const fadeProgress = (progress - 0.8) / 0.2;
        this.alpha = 1 - fadeProgress;
        this.scale = 1 - fadeProgress * 0.1;
      }
    } else {
      // 普通波次简洁动画
      if (progress < 0.15) {
        const easeProgress = this.easeOutCubic(progress / 0.15);
        this.alpha = easeProgress;
        this.scale = 0.9 + easeProgress * 0.1;
      } else if (progress < 0.85) {
        this.alpha = 1;
        this.scale = 1;
      } else {
        const fadeProgress = (progress - 0.85) / 0.15;
        this.alpha = 1 - fadeProgress;
        this.scale = 1;
      }
    }

    if (this.elapsed >= this.duration) {
      this.active = false;
    }
  }

  // 缓动函数
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    ctx.globalAlpha = this.alpha;
    ctx.translate(centerX, centerY);
    ctx.scale(this.scale, this.scale);

    // 整体半透明背景（移动端适配）
    const screenW = window.innerWidth;
    const isMobileScreen = screenW < 600;
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    if (this.isFirstWave) {
      const bgW = isMobileScreen ? Math.min(screenW - 40, 340) : 500;
      const bgH = isMobileScreen ? 90 : 120;
      ctx.fillRect(-bgW / 2, -bgH / 2, bgW, bgH);
    } else {
      const bgW = isMobileScreen ? Math.min(screenW - 40, 300) : 400;
      const bgH = isMobileScreen ? 60 : 80;
      ctx.fillRect(-bgW / 2, -bgH / 2, bgW, bgH);
    }
    ctx.restore();

    if (this.isFirstWave) {
      this.renderGameStart(ctx);
    } else {
      this.renderWaveAlert(ctx);
    }

    ctx.restore();
  }

  private renderGameStart(ctx: CanvasRenderingContext2D): void {
    const screenW = window.innerWidth;
    const isMobileScreen = screenW < 600;
    const titleSize = isMobileScreen ? 36 : 72;
    const subSize = isMobileScreen ? 13 : 18;
    const titleY = isMobileScreen ? -12 : -20;
    const subY = isMobileScreen ? 28 : 45;

    // 主标题：GAME START
    ctx.font = `${titleSize}px 'Press Start 2P', VT323, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 字体底部半透明遮罩
    const textMetrics = ctx.measureText(this.text);
    const textWidth = textMetrics.width;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(
      -textWidth / 2 - 20,
      -titleSize / 2 + 10,
      textWidth + 40,
      titleSize - 10,
    );
    ctx.restore();

    // 简洁的文字渲染
    const gradient = ctx.createLinearGradient(
      -textWidth / 2,
      0,
      textWidth / 2,
      0,
    );
    gradient.addColorStop(0, "#00E5FF");
    gradient.addColorStop(0.5, "#00FF9D");
    gradient.addColorStop(1, "#00E5FF");

    ctx.fillStyle = gradient;
    ctx.fillText(this.text, 0, titleY);

    // 副标题：操作提示
    ctx.font = `${subSize}px VT323, monospace`;
    ctx.fillStyle = "#A6A6A6";
    ctx.fillText(this.subText, 0, subY);
  }

  private renderWaveAlert(ctx: CanvasRenderingContext2D): void {
    const screenW = window.innerWidth;
    const isMobileScreen = screenW < 600;
    const waveSize = isMobileScreen ? 32 : 56;

    // 主文字
    ctx.font = `${waveSize}px VT323, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 简洁的渐变文字
    const textMetrics = ctx.measureText(this.text);
    const textWidth = textMetrics.width;

    const gradient = ctx.createLinearGradient(
      -textWidth / 2,
      0,
      textWidth / 2,
      0,
    );
    gradient.addColorStop(0, "#FF3355");
    gradient.addColorStop(0.5, "#FF6B85");
    gradient.addColorStop(1, "#FF3355");

    ctx.fillStyle = gradient;
    ctx.fillText(this.text, 0, 0);
  }
}

// 爆炸效果类
class Explosion {
  x: number;
  y: number;
  width = 60;
  height = 60;
  radius = 0;
  maxRadius = 50;
  alpha = 1;
  active = true;
  duration = 500; // 持续时间(毫秒)
  elapsed = 0;

  constructor(x: number, y: number) {
    this.x = x - 30; // 居中显示
    this.y = y - 30;
  }

  update(deltaTime: number): void {
    this.elapsed += deltaTime;
    const progress = this.elapsed / this.duration;

    this.radius = this.maxRadius * progress;
    this.alpha = 1 - progress;

    if (this.elapsed >= this.duration) {
      this.active = false;
    }
  }

  render(ctx: CanvasRenderingContext2D, imageLoader?: ImageLoader): void {
    ctx.save();
    ctx.globalAlpha = this.alpha;

    // 渲染爆炸图片
    const explosionImg = imageLoader?.get("explosion");
    if (explosionImg) {
      ctx.drawImage(explosionImg, this.x, this.y, this.width, this.height);
    } else {
      // 降级：使用原有绘制逻辑
      const centerX = this.x + 30;
      const centerY = this.y + 30;

      ctx.strokeStyle = "#FFC107";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#FFC107";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#FF00FF";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#FF00FF";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(centerX, centerY, this.radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// 移动端检测
function isTouchDevice(): boolean {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

// 游戏主类
class TankGame {
  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  tank: Tank | null = null;
  bullets: Bullet[] = [];
  enemies: Enemy[] = [];
  explosions: Explosion[] = [];
  powerUpTexts: PowerUpText[] = [];
  waveNotification: WaveNotification | null = null;
  imageLoader: ImageLoader = new ImageLoader();

  isRunning = false;
  lastTime = 0;
  enemySpawnInterval = 2000; // 每2秒生成一个敌人
  lastEnemySpawnTime = 0;

  // 飞弹独立生成系统
  missileSpawnInterval = 8000; // 飞弹初始间隔8秒
  lastMissileSpawnTime = 0;

  mouseX = 0;
  mouseY = 0;
  keysPressed = new Set<string>();

  // 移动端触摸状态
  isMobile = false;
  activeTouchId: number | null = null; // 跟踪拖动坦克的触摸点

  // 积分系统
  currentScore = 0;
  highScore = 0;

  // 波次系统
  currentWave = 1;
  currentWaveConfig: WaveConfig = WAVE_CONFIGS[0];

  // 游戏开始提示时间
  gameStartTime = 0;
  showGameStartDuration = 3000; // 显示3秒

  // 性能优化配置
  targetFPS = 30; // 目标帧率降低到30fps
  frameInterval = 1000 / 30; // 约33ms每帧
  lastFrameTime = 0;
  maxEnemies = 50; // 敌人数量上限
  maxBullets = 100; // 子弹数量上限
  isPageVisible = true; // 页面可见性

  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn("[TankGame] 游戏已在运行");
      return;
    }

    // 加载图片资源
    console.log("[TankGame] 正在加载游戏资源...");
    await this.imageLoader.loadAll();
    console.log("[TankGame] 资源加载完成");

    await this.loadHighScore();
    this.createCanvas();
    this.createTank();
    this.bindEvents();
    this.isRunning = true;
    this.lastTime = performance.now();

    // 显示第一波提示
    this.waveNotification = new WaveNotification(WAVE_CONFIGS[0].name);

    this.gameLoop(this.lastTime);

    console.log("[TankGame] 游戏启动成功 🎮");
  }

  // 加载最高分
  async loadHighScore(): Promise<void> {
    try {
      const currentUser = await getUserInfo();
      if (currentUser) {
        const user = await userApi.detail({ id: currentUser.id });
        this.highScore = user.gameScore || 0;
      }
    } catch (error) {
      console.warn("[TankGame] 加载最高分失败:", error);
      this.highScore = 0;
    }
  }

  // 保存最高分
  async saveHighScore(): Promise<void> {
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;

      try {
        const currentUser = await getUserInfo();
        if (currentUser) {
          await userApi.update({
            id: currentUser.id,
            gameScore: this.highScore,
          });
          console.log(`[TankGame] 最高分已更新到服务器: ${this.highScore}`);

          // 触发自定义事件，通知分数已更新
          window.dispatchEvent(
            new CustomEvent("tank-score-updated", {
              detail: { newScore: this.highScore },
            }),
          );
        }
      } catch (error) {
        console.error("[TankGame] 保存最高分失败:", error);
      }
    }
  }

  // 获取最高分(供外部调用)
  getHighScore(): number {
    return this.highScore;
  }

  // 检查并更新波次
  checkAndUpdateWave(): void {
    // 根据当前分数找到对应的波次
    for (let i = WAVE_CONFIGS.length - 1; i >= 0; i--) {
      const waveConfig = WAVE_CONFIGS[i];
      if (this.currentScore >= waveConfig.scoreThreshold) {
        // 如果进入了新波次
        if (waveConfig.waveNumber !== this.currentWave) {
          this.currentWave = waveConfig.waveNumber;
          this.currentWaveConfig = waveConfig;
          this.enemySpawnInterval = waveConfig.spawnInterval;

          // 调整飞弹生成间隔（波次越高间隔越短）
          // 第2波: 8秒, 第3波: 7秒, 第4波: 6秒, ..., 最终: 3秒
          if (this.currentWave >= 2) {
            this.missileSpawnInterval = Math.max(
              3000,
              9000 - this.currentWave * 1000,
            );
          }

          // 显示波次提示
          this.waveNotification = new WaveNotification(waveConfig.name);

          console.log(
            `[TankGame] 进入${waveConfig.name}，速度倍率：${waveConfig.speedMultiplier}，生成间隔：${waveConfig.spawnInterval}ms，飞弹间隔：${this.missileSpawnInterval}ms`,
          );
        }
        break;
      }
    }
  }

  // 坦克死亡
  tankDie(): void {
    this.saveHighScore(); // 异步调用，不等待完成
    this.currentScore = 0;

    // 重置波次到第一波
    this.currentWave = 1;
    this.currentWaveConfig = WAVE_CONFIGS[0];
    this.enemySpawnInterval = WAVE_CONFIGS[0].spawnInterval;

    // 重置飞弹计时器
    this.missileSpawnInterval = 8000;
    this.lastMissileSpawnTime = 0;

    // 显示第一波提示
    this.waveNotification = new WaveNotification(WAVE_CONFIGS[0].name);

    // 创建爆炸效果（在坦克当前位置）
    if (this.tank) {
      const explosion = new Explosion(
        this.tank.x + this.tank.width / 2,
        this.tank.y + this.tank.height / 2,
      );
      this.explosions.push(explosion);

      // 重置坦克到初始位置
      this.tank.reset();

      // 设置游戏开始提示时间
      this.gameStartTime = performance.now();
    }
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    // 清空画布
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 清空所有游戏对象
    this.bullets = [];
    this.enemies = [];
    this.explosions = [];
    this.powerUpTexts = [];
    this.waveNotification = null;

    // 重置坦克到初始位置
    if (this.tank) {
      this.tank.reset();
    }

    console.log("[TankGame] 游戏已停止");
  }

  destroy(): void {
    this.stop();

    // 移除事件监听
    this.unbindEvents();

    // 移除 Canvas
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    // 清空所有对象
    this.canvas = null;
    this.ctx = null;
    this.tank = null;
    this.bullets = [];
    this.enemies = [];
    this.explosions = [];

    console.log("[TankGame] 游戏已销毁 ♻️");
  }

  private createCanvas(): void {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "tank-game-canvas";

    // 高 DPI 适配
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999;
      touch-action: none;
    `;

    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    // 缩放上下文以匹配 DPI
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  private createTank(): void {
    const x = window.innerWidth / 2 - 25;
    const y = window.innerHeight - 100;
    this.tank = new Tank(x, y);
  }

  private bindEvents(): void {
    this.isMobile = isTouchDevice();

    window.addEventListener("resize", this.handleResize);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    // 鼠标事件（桌面端）
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("mouseup", this.handleMouseUp);

    // 触摸事件（移动端）- 绑定到 document 以避免 canvas pointer-events 拦截页面交互
    document.addEventListener("touchstart", this.handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", this.handleTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", this.handleTouchEnd, {
      passive: false,
    });
    document.addEventListener("touchcancel", this.handleTouchEnd, {
      passive: false,
    });

    // 页面可见性变化监听（性能优化）
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  private unbindEvents(): void {
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mouseup", this.handleMouseUp);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);

    document.removeEventListener("touchstart", this.handleTouchStart);
    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchEnd);
    document.removeEventListener("touchcancel", this.handleTouchEnd);

    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
  }

  private handleVisibilityChange = (): void => {
    this.isPageVisible = !document.hidden;
    if (document.hidden) {
      console.log("[TankGame] 页面不可见，游戏已暂停");
    } else {
      console.log("[TankGame] 页面可见，游戏已恢复");
      // 重置时间以避免大的deltaTime跳跃
      this.lastTime = performance.now();
      this.lastFrameTime = performance.now();
    }
  };

  private handleResize = (): void => {
    if (this.canvas) {
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;

      // 重新设置缩放
      if (this.ctx) {
        this.ctx.scale(dpr, dpr);
      }
    }
  };

  private handleMouseMove = (e: MouseEvent): void => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    if (this.tank) {
      this.tank.drag(
        this.mouseX,
        this.mouseY,
        window.innerWidth,
        window.innerHeight,
      );

      // 桌面端：动态设置 pointer-events（移动端始终开启）
      if (!this.isMobile && this.canvas) {
        const isOnTank = this.tank.contains(this.mouseX, this.mouseY);
        if (isOnTank || this.tank.isDragging) {
          this.canvas.style.pointerEvents = "auto";
          this.canvas.style.cursor = "move";
        } else {
          this.canvas.style.pointerEvents = "none";
          this.canvas.style.cursor = "default";
        }
      }
    }
  };

  private handleMouseDown = (e: MouseEvent): void => {
    if (this.tank) {
      // 开始拖拽
      if (this.tank.contains(e.clientX, e.clientY)) {
        e.preventDefault();
        this.tank.startDrag(e.clientX, e.clientY);
      }
    }
  };

  private handleMouseUp = (): void => {
    if (this.tank) {
      this.tank.stopDrag();
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    const key = e.key;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
      e.preventDefault();
      this.keysPressed.add(key);
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keysPressed.delete(e.key);
  };

  // ---- 触摸事件处理（移动端） ----

  private getTouchPos(touch: Touch): { x: number; y: number } {
    // canvas 是全屏 fixed 定位（top:0, left:0），clientX/Y 即为 canvas 坐标
    return { x: touch.clientX, y: touch.clientY };
  }

  private handleTouchStart = (e: TouchEvent): void => {
    if (!this.tank) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const pos = this.getTouchPos(touch);

      // 扩大触摸热区（移动端手指比鼠标大）
      const hitPadding = 20;
      const isOnTank =
        pos.x >= this.tank.x - hitPadding &&
        pos.x <= this.tank.x + this.tank.width + hitPadding &&
        pos.y >= this.tank.y - hitPadding &&
        pos.y <= this.tank.y + this.tank.height + hitPadding;

      if (isOnTank && this.activeTouchId === null) {
        e.preventDefault();
        this.activeTouchId = touch.identifier;
        this.tank.startDrag(pos.x, pos.y);
        return;
      }
    }
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (!this.tank || this.activeTouchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.activeTouchId) {
        e.preventDefault();
        const pos = this.getTouchPos(touch);
        this.tank.drag(pos.x, pos.y, window.innerWidth, window.innerHeight);
        return;
      }
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    if (!this.tank || this.activeTouchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.activeTouchId) {
        this.activeTouchId = null;
        this.tank.stopDrag();
        return;
      }
    }
  };

  private gameLoop = (currentTime: number): void => {
    if (!this.isRunning) return;

    // 帧率限制：只有达到目标帧间隔才更新和渲染
    const timeSinceLastFrame = currentTime - this.lastFrameTime;
    if (timeSinceLastFrame < this.frameInterval) {
      requestAnimationFrame(this.gameLoop);
      return;
    }

    // 页面不可见时暂停游戏逻辑（但保持循环）
    if (!this.isPageVisible) {
      requestAnimationFrame(this.gameLoop);
      return;
    }

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.lastFrameTime =
      currentTime - (timeSinceLastFrame % this.frameInterval);

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // 更新坦克
    if (this.tank) {
      this.tank.update(deltaTime);

      // 键盘控制坦克移动
      if (this.keysPressed.has("ArrowUp")) {
        this.tank.moveByKeyboard(
          "up",
          deltaTime,
          window.innerWidth,
          window.innerHeight,
        );
      }
      if (this.keysPressed.has("ArrowDown")) {
        this.tank.moveByKeyboard(
          "down",
          deltaTime,
          window.innerWidth,
          window.innerHeight,
        );
      }
      if (this.keysPressed.has("ArrowLeft")) {
        this.tank.moveByKeyboard(
          "left",
          deltaTime,
          window.innerWidth,
          window.innerHeight,
        );
      }
      if (this.keysPressed.has("ArrowRight")) {
        this.tank.moveByKeyboard(
          "right",
          deltaTime,
          window.innerWidth,
          window.innerHeight,
        );
      }
    }

    // 更新子弹（限制数量）
    this.bullets = this.bullets.filter((bullet) => {
      bullet.update(deltaTime);
      return bullet.active;
    });
    // 如果子弹过多，移除最老的
    if (this.bullets.length > this.maxBullets) {
      this.bullets.splice(0, this.bullets.length - this.maxBullets);
    }

    // 更新敌人（限制数量）
    this.enemies = this.enemies.filter((enemy) => {
      enemy.update(deltaTime);
      return enemy.active;
    });
    // 如果敌人过多，移除最老的（最上面的）
    if (this.enemies.length > this.maxEnemies) {
      const toRemove = this.enemies.length - this.maxEnemies;
      this.enemies.splice(0, toRemove);
    }

    // 更新爆炸效果
    this.explosions = this.explosions.filter((explosion) => {
      explosion.update(deltaTime);
      return explosion.active;
    });

    // 更新加成提示文字
    this.powerUpTexts = this.powerUpTexts.filter((text) => {
      text.update(deltaTime);
      return text.active;
    });

    // 更新波次提示
    if (this.waveNotification) {
      this.waveNotification.update(deltaTime);
      if (!this.waveNotification.active) {
        this.waveNotification = null;
      }
    }

    // 检查波次更新
    this.checkAndUpdateWave();

    // 生成敌人（检查数量上限）
    this.lastEnemySpawnTime += deltaTime;
    if (this.lastEnemySpawnTime >= this.enemySpawnInterval) {
      // 只有在敌人数量未达到上限时才生成
      if (this.enemies.length < this.maxEnemies) {
        this.spawnEnemy();
      }
      this.lastEnemySpawnTime = 0;
    }

    // 独立生成飞弹（第2波后开始，频率随波次增加）
    if (this.currentWave >= 2) {
      this.lastMissileSpawnTime += deltaTime;
      if (this.lastMissileSpawnTime >= this.missileSpawnInterval) {
        this.spawnMissile();
        this.lastMissileSpawnTime = 0;
      }
    }

    // 碰撞检测
    this.checkCollisions();
  }

  private render(): void {
    if (!this.ctx || !this.canvas) return;

    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 计算是否显示 GAME START
    const now = performance.now();
    const showGameStart =
      this.gameStartTime > 0 &&
      now - this.gameStartTime < this.showGameStartDuration;

    // 渲染所有对象
    if (this.tank) {
      this.tank.render(
        this.ctx,
        this.currentScore,
        this.imageLoader,
        showGameStart,
      );
    }

    this.bullets.forEach((bullet) => bullet.render(this.ctx!));
    this.enemies.forEach((enemy) => enemy.render(this.ctx!, this.imageLoader));
    this.explosions.forEach((explosion) =>
      explosion.render(this.ctx!, this.imageLoader),
    );
    this.powerUpTexts.forEach((text) => text.render(this.ctx!));

    // 渲染波次提示（最上层）
    if (this.waveNotification) {
      this.waveNotification.render(this.ctx);
    }
  }

  private spawnEnemy(): void {
    const x = Math.random() * (window.innerWidth - 40);

    // 根据波次动态调整资源箱和大飞机概率
    const resourceBoxMultiplier = this.currentWaveConfig.resourceBoxMultiplier;
    const currentWave = this.currentWave;

    // 重新计算概率分布（资源箱概率随波次增加，大飞机从第4波开始出现，飞弹从第3波开始极低概率出现）
    const adjustedConfigs = ENEMY_CONFIGS.map((config) => {
      if (config.imageKey === "resourceBox") {
        // 资源箱概率随波次倍率增加
        return {
          ...config,
          probability: config.probability * resourceBoxMultiplier,
        };
      } else if (config.isBoss) {
        // 大飞机从第4波开始出现，概率逐渐增加
        let bossProbability = 0;
        if (currentWave >= 4) {
          // 第4波: 2%, 第5波: 4%, 第6波: 6%, ..., 最终波: 20%
          bossProbability = Math.min(0.02 * (currentWave - 3), 0.2);
        }
        return {
          ...config,
          probability: bossProbability,
        };
      } else if (config.isMissile) {
        // 飞弹从第3波开始出现，极低概率（前两波100%不出现）
        let missileProbability = 0;
        if (currentWave >= 3) {
          // 第3波: 1%, 第4波: 1.5%, 第5波: 2%, ..., 最终波: 5%（极低概率）
          missileProbability = Math.min(0.01 + 0.005 * (currentWave - 3), 0.05);
        }
        return {
          ...config,
          probability: missileProbability,
        };
      }
      return config;
    });

    // 归一化概率（使总和为1）
    const totalProb = adjustedConfigs.reduce(
      (sum, cfg) => sum + cfg.probability,
      0,
    );
    const normalizedConfigs = adjustedConfigs.map((cfg) => ({
      ...cfg,
      probability: cfg.probability / totalProb,
    }));

    // 根据调整后的概率选择敌人类型
    const rand = Math.random();
    let cumulativeProbability = 0;
    let selectedConfig = normalizedConfigs[0];

    for (const config of normalizedConfigs) {
      cumulativeProbability += config.probability;
      if (rand < cumulativeProbability) {
        selectedConfig = config;
        break;
      }
    }

    // 应用当前波次的速度倍率
    const adjustedConfig = {
      ...selectedConfig,
      speed: selectedConfig.speed * this.currentWaveConfig.speedMultiplier,
    };

    // 创建敌人，如果是飞弹则传递坦克位置用于追踪
    const enemy = adjustedConfig.isMissile
      ? new Enemy(
          x,
          adjustedConfig,
          this.tank.x + this.tank.width / 2,
          this.tank.y + this.tank.height / 2,
        )
      : new Enemy(x, adjustedConfig);

    this.enemies.push(enemy);
  }

  // 独立生成飞弹
  private spawnMissile(): void {
    const x = Math.random() * (window.innerWidth - 60);

    // 获取飞弹配置（ENEMY_CONFIGS 中索引3是飞弹）
    const missileConfig = ENEMY_CONFIGS.find((config) => config.isMissile);
    if (!missileConfig) return;

    // 应用当前波次的速度倍率
    const adjustedConfig = {
      ...missileConfig,
      speed: missileConfig.speed * this.currentWaveConfig.speedMultiplier,
    };

    // 创建飞弹，传递坦克当前位置用于追踪
    const missile = new Enemy(
      x,
      adjustedConfig,
      this.tank.x + this.tank.width / 2,
      this.tank.y + this.tank.height / 2,
    );

    this.enemies.push(missile);
    console.log(
      `[TankGame] 飞弹发射！目标位置：(${this.tank.x}, ${this.tank.y})`,
    );
  }

  private checkCollisions(): void {
    // 子弹与敌人的碰撞
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];

        // 矩形碰撞检测
        if (this.isColliding(bullet, enemy)) {
          // 敌人受伤
          const destroyed = enemy.takeDamage();

          // 移除子弹
          bullet.active = false;

          if (destroyed) {
            // 创建爆炸效果
            const explosion = new Explosion(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
            );
            this.explosions.push(explosion);

            // 增加积分
            this.currentScore += enemy.config.score;

            // 应用加成
            if (enemy.config.powerUp && this.tank) {
              const powerUp = enemy.config.powerUp;

              // 特殊处理积分宝箱
              if (powerUp.type === "scoreBonus") {
                // 随机生成 10-100 之间的积分
                const bonusScore = Math.floor(Math.random() * 91) + 10; // 10-100
                this.currentScore += bonusScore;

                // 显示积分提示文字
                if (enemy.config.imageKey === "resourceBox") {
                  const powerUpText = new PowerUpText(
                    enemy.x + enemy.width + 10,
                    enemy.y + enemy.height / 2,
                    "scoreBonus",
                    `+${bonusScore}`,
                  );
                  this.powerUpTexts.push(powerUpText);
                }
                console.log(`[Tank] 获得积分奖励：+${bonusScore}分`);
              } else {
                // 其他加成
                this.tank.applyPowerUp(powerUp);

                // 显示加成提示文字
                if (enemy.config.imageKey === "resourceBox") {
                  const powerUpText = new PowerUpText(
                    enemy.x + enemy.width + 10,
                    enemy.y + enemy.height / 2,
                    powerUp.type,
                  );
                  this.powerUpTexts.push(powerUpText);
                }
              }
            }

            // 移除敌人
            enemy.active = false;
          }

          break;
        }
      }
    }

    // 坦克与敌人的碰撞
    if (this.tank) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];

        if (this.isColliding(this.tank, enemy)) {
          // 敌人消失
          enemy.active = false;

          // 创建爆炸效果
          const explosion = new Explosion(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
          );
          this.explosions.push(explosion);

          // 飞弹特殊逻辑：一击必杀，清空所有加成（包括护盾）
          if (enemy.config.isMissile) {
            // 检查是否有任何加成
            if (
              this.tank.shieldCount > 0 ||
              this.tank.fireRateLevel > 0 ||
              this.tank.bulletCount > 1 ||
              this.tank.bulletSpeed > 300
            ) {
              // 清空所有加成（包括护盾）
              this.tank.shieldCount = 0;
              this.tank.clearPowerUps();
              console.log(`[Tank] 被飞弹击中！所有加成（包括护盾）已清空`);
            } else {
              // 无任何加成，直接死亡
              this.tankDie();
            }
          } else {
            // 普通敌人碰撞逻辑：
            // 1. 优先消耗护盾（每次-1层，护盾期间不消耗其他加成）
            // 2. 护盾用完后，如果有其他加成，一次性清空所有加成
            // 3. 无任何加成，则死亡
            if (this.tank.shieldCount > 0) {
              // 有护盾，消耗1层护盾，不清空其他加成
              this.tank.shieldCount--;
              console.log(
                `[Tank] 护盾抵挡攻击！剩余护盾：${this.tank.shieldCount}层`,
              );
            } else if (
              this.tank.fireRateLevel > 0 ||
              this.tank.bulletCount > 1 ||
              this.tank.bulletSpeed > 300
            ) {
              // 无护盾但有其他加成，清空所有加成（不含护盾）
              this.tank.clearPowerUps();
              console.log(`[Tank] 无护盾！所有加成已清空`);
            } else {
              // 无任何加成，死亡
              this.tankDie();
            }
          }

          break;
        }
      }
    }
  }

  private isColliding(obj1: GameObject, obj2: GameObject): boolean {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  addBullet(bullet: Bullet): void {
    this.bullets.push(bullet);
  }
}

// 全局暴露
declare global {
  interface Window {
    __tankGame__: {
      start: () => void;
      stop: () => void;
      destroy: () => void;
      addBullet: (bullet: Bullet) => void;
      getHighScore: () => number;
    };
  }
}

// 初始化游戏实例
const game = new TankGame();

window.__tankGame__ = {
  start: () => game.start(),
  stop: () => game.stop(),
  destroy: () => game.destroy(),
  addBullet: (bullet: Bullet) => game.addBullet(bullet),
  getHighScore: () => game.getHighScore(),
};

export default game;
