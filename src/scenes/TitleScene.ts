import Phaser from 'phaser';
import { SoundManager } from '../audio/SoundManager';

/** Original fork entry screen. Gameplay remains inherited during migration. */
export class TitleScene extends Phaser.Scene {
  private layout?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0b0d16');
    this.drawLayout();
    this.scale.on('resize', this.drawLayout, this);
    const play = () => this.openScene('GameScene');
    this.input.keyboard?.on('keydown-ENTER', play);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off('resize', this.drawLayout, this);
      this.input.keyboard?.off('keydown-ENTER', play);
      this.layout = undefined;
    });
  }

  private openScene(key: string): void {
    SoundManager.playClick();
    this.scene.start(key, key === 'GameScene' ? {
      starterKey: 'charmander',
      stageId: 'phase1',
      tileThemeId: 'emerald',
      difficulty: 'hard',
      debugMode: false,
    } : undefined);
  }

  private drawLayout(): void {
    this.layout?.destroy(true);
    const { width, height } = this.scale;
    const scale = Math.min(width / 1040, height / 700);
    const root = this.add.container(width / 2, height / 2).setScale(scale);
    this.layout = root;
    const text = (x: number, y: number, value: string, size: number, color = '#f4f3ff') => {
      const label = this.add.text(x, y, value, {
        fontFamily: 'Arial, sans-serif', fontSize: `${size}px`, color,
      });
      root.add(label);
      return label;
    };
    const g = this.add.graphics();
    root.add(g);
    g.lineStyle(1, 0x252a40, 0.6);
    for (let x = -500; x <= 500; x += 40) g.lineBetween(x, -330, x, 330);
    for (let y = -330; y <= 330; y += 40) g.lineBetween(-500, y, 500, y);
    g.fillStyle(0x0b0d16, 0.9).fillRect(-500, -330, 1000, 660);
    g.fillStyle(0x9d78ff).fillRoundedRect(-460, -285, 32, 32, 8);
    g.lineStyle(3, 0xffffff).strokeRect(-452, -277, 16, 12);
    text(-414, -281, 'TWITCH SURVIVORS', 19).setFontStyle('bold');
    text(260, -277, 'FOUNDATION BUILD  /  01', 12, '#a3a7ba');
    g.lineStyle(1, 0x292c40).lineBetween(-460, -226, 460, -226);

    text(-460, -181, 'SURVIVE TOGETHER.', 13, '#b89cff').setLetterSpacing(3);
    text(-464, -142, 'ONE STREAM.\nA WHOLE ARMY.', 53).setFontStyle('bold').setLineSpacing(0);
    text(-460, 0, 'Your chat becomes your build.', 23, '#b5b8cc');
    text(-460, 43, 'The survivor foundation is ready to explore.\nAudience participation is coming next.', 16, '#858ba4').setLineSpacing(7);

    const button = (y: number, label: string, target: string, primary: boolean) => {
      const bg = this.add.rectangle(-271, y, 378, 54, primary ? 0x9d78ff : 0x171b2a)
        .setStrokeStyle(1, primary ? 0xb99fff : 0x353a50)
        .setInteractive({ useHandCursor: true });
      root.add(bg);
      text(-438, y - 11, label, 17, primary ? '#0b0d16' : '#d0d3e4').setFontStyle('bold');
      text(-115, y - 11, '→', 18, primary ? '#0b0d16' : '#b89cff');
      bg.on('pointerover', () => bg.setFillStyle(primary ? 0xb89cff : 0x252b41));
      bg.on('pointerout', () => bg.setFillStyle(primary ? 0x9d78ff : 0x171b2a));
      bg.on('pointerdown', () => this.openScene(target));
    };
    button(141, 'PLAY THE BASE GAME', 'GameScene', true);
    button(209, 'EXPLORE MAP EDITOR', 'MapEditorScene', false);
    text(-460, 251, 'WASD / ARROWS TO MOVE     •     ENTER TO PLAY', 11, '#858ba4');

    // Original geometric preview, independent of all inherited artwork.
    g.fillStyle(0x121725).fillRoundedRect(22, -180, 438, 418, 20);
    g.lineStyle(1, 0x30374f).strokeRoundedRect(22, -180, 438, 418, 20);
    text(47, -154, 'THE VISION', 12, '#b89cff').setLetterSpacing(2);
    text(47, -125, 'Every viewer has a role.', 23).setFontStyle('bold');
    g.lineStyle(1, 0x39425d, 0.8);
    g.strokeCircle(240, 47, 113).strokeCircle(240, 47, 76);
    g.lineBetween(127, 47, 353, 47).lineBetween(240, -66, 240, 160);
    g.lineStyle(2, 0x9d78ff, 0.6);
    g.lineBetween(240, 47, 143, 0).lineBetween(240, 47, 342, 76);
    g.fillStyle(0x9d78ff).fillRoundedRect(220, 27, 40, 40, 10);
    g.fillStyle(0xffffff).fillRect(229, 39, 6, 5).fillRect(245, 39, 6, 5);
    g.fillStyle(0xffb463).fillCircle(143, 0, 14);
    g.fillStyle(0xffe8be).fillCircle(147, -4, 6);
    g.fillStyle(0x77e0c4).fillTriangle(342, 56, 359, 80, 342, 94);
    g.fillStyle(0x4da992).fillTriangle(342, 56, 325, 80, 342, 94);
    text(105, -35, 'FIREBALL', 11, '#ffb463');
    text(315, 104, 'KNIGHT', 11, '#77e0c4');
    text(202, 81, 'STREAMER', 11, '#c7b5ff');
    text(47, 194, '!join → a named skill or companion', 14, '#a3a7ba');

    g.lineStyle(1, 0x292c40).lineBetween(-460, 292, 460, 292);
    text(-460, 308, 'LOCAL MIGRATION • Base game still contains inherited Pokémon art and UI.', 12, '#858ba4');
    text(309, 308, 'BUILT WITH CODEX', 12, '#b89cff');
  }
}
