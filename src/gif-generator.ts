import fs from 'fs';
import path from 'path';
import GIFEncoder from 'gifencoder';
import { createCanvas } from 'canvas';
import moment, { Moment, Duration } from 'moment';

export default class GifGenerator {
  private width: number;
  private height: number;
  private frames: number;
  private bg: string;
  private textColor: string;
  private name: string;
  private halfWidth: number;
  private halfHeight: number;
  private encoder: GIFEncoder;
  private canvas:  any;
  private ctx:  any;

  constructor() {
    this.width = 200;
    this.height = 200;
    this.frames = 30;
    this.bg = '#000000';
    this.textColor = '#ffffff';
    this.name = 'default';
    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;
    this.encoder = new GIFEncoder(this.width, this.height);
    this.canvas = createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext('2d');
  }

  /**
   * Initialize the GIF generation
   */
  public init(
    time: string,
    width: number | undefined = 200,
    height: number = 200,
    color: string = 'ffffff',
    bg: string = '000000',
    name: string = 'default',
    frames: number = 30,
    cb: () => void
  ) {
    this.width = this.clamp(width, 150, 500);
    this.height = this.clamp(height, 150, 500);
    this.frames = this.clamp(frames, 1, 90);
    this.bg = '#' + bg;
    this.textColor = '#' + color;
    this.name = name;
    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;
    this.encoder = new GIFEncoder(this.width, this.height);
    this.canvas = createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext('2d');

    const timeResult = this.calculateTimeDifference(time);
    this.encode(timeResult, cb);
  }

  /**
   * Limit a value between a min / max
   */
  private clamp(number: number, min: number, max: number): number {
    return Math.max(min, Math.min(number, max));
  }

  /**
   * Calculate the difference between timeString and current time
   */
  private calculateTimeDifference(timeString: string): string | Duration {
    const target = moment(timeString);
    const current = moment();
    const difference = target.diff(current);

    if (difference <= 0) {
      return 'Date has passed!';
    } else {
      return moment.duration(difference);
    }
  }

  /**
   * Encode the GIF with the information provided by the time function
   */
  private encode(timeResult: string | Duration, cb: () => void): void {
    const tmpDir = path.join(process.cwd(), 'tmp');

    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }

    const filePath = path.join(tmpDir, `${this.name}.gif`);
    const imageStream = this.encoder
      .createReadStream()
      .pipe(fs.createWriteStream(filePath));

    imageStream.on('finish', () => {
      if (typeof cb === 'function') cb();
    });

    const fontSize = `${Math.floor(this.width / 12)}px`;
    const fontFamily = 'Courier New';

    this.ctx.font = `${fontSize} ${fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    this.encoder.start();
    this.encoder.setRepeat(0);
    this.encoder.setDelay(1000);
    this.encoder.setQuality(10);

    if (typeof timeResult === 'object') {
      for (let i = 0; i < this.frames; i++) {
        const days = this.padNumber(Math.floor(timeResult.asDays()));
        const hours = this.padNumber(Math.floor(timeResult.asHours()) % 24);
        const minutes = this.padNumber(Math.floor(timeResult.asMinutes()) % 60);
        const seconds = this.padNumber(Math.floor(timeResult.asSeconds()) % 60);

        const timeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        this.drawFrame(timeString);
        this.encoder.addFrame(this.ctx);

        timeResult.subtract(1, 'seconds');
      }
    } else {
      this.drawFrame(timeResult);
      this.encoder.addFrame(this.ctx);
    }

    this.encoder.finish();
  }

  /**
   * Pad a number with leading zeros if necessary
   */
  private padNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }

  /**
   * Draw a single frame
   */
  private drawFrame(text: string): void {
    this.ctx.fillStyle = this.bg;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this.textColor;
    this.ctx.fillText(text, this.halfWidth, this.halfHeight);
  }
}
