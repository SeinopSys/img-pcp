import Command, { flags } from '@oclif/command';
import Jimp from 'jimp';

export class PickCommonPixelsCommand extends Command {
  static availableModes: { [key: string]: (pixel1: number, pixel2: number) => number } = {
    /**
     * Preserve pixels that match in both images
     */
    and: (pixel1: number, pixel2: number) => {
      return pixel1 === pixel2 ? pixel1 : 0;
    },
    /**
     * Preserve pixels of first image that differ from the second
     */
    sub: (pixel1: number, pixel2: number) => {
      return pixel1 !== pixel2 ? pixel1 : 0;
    },
  };

  static description =
    'Takes two input files and outputs an image to the specified ' +
    'output that contains only the identical pixels';

  static args = [
    {
      name: 'firstImagePath',
      required: true,
    },
    {
      name: 'secondImagePath',
      required: true,
    },
    {
      name: 'outputImagePath',
      required: true,
    },
  ];

  static flags = {
    mode: flags.string({
      char: 'm',
      description: 'Switch between different modes',
      options: Object.keys(PickCommonPixelsCommand.availableModes),
      default: 'and',
      required: false,
    }),
  };

  async run() {
    const { args, flags } = this.parse(PickCommonPixelsCommand);
    const { firstImagePath, secondImagePath, outputImagePath } = args;
    this.log(args);

    let firstImage: Jimp | null = null;
    let secondImage: Jimp | null = null;
    let error;
    try {
      firstImage = await Jimp.read(firstImagePath);
      secondImage = await Jimp.read(secondImagePath);
    } catch (e) {
      error = e;
    }

    if (error || firstImage === null || secondImage === null) {
      this.error(error);
      return this.exit(1);
    }

    const [firstImageWidth, firstImageHeight] = [firstImage.getWidth(), firstImage.getHeight()];
    const [secondImageWidth, secondImageHeight] = [secondImage.getWidth(), secondImage.getHeight()];
    const [outputImageWidth, outputImageHeight] = [Math.max(firstImageWidth, secondImageWidth), Math.max(firstImageHeight, secondImageHeight)];
    if (firstImageWidth !== secondImageWidth || firstImageHeight !== secondImageHeight) {
      this.log(`The provided images re not of the same resolution (got ${firstImageWidth}x${firstImageHeight} and ${secondImageWidth}x${secondImageHeight})`);
      return this.exit(1);
    }

    let outputImage: Jimp = new Jimp(outputImageWidth, outputImageHeight, 0, err => {
      if (err) {
        error = err;
      }
    });

    if (error) {
      this.error(error);
      return this.exit(1);
    }
    const outputImageIter = outputImage.scanIterator(
      0,
      0,
      firstImage.bitmap.width,
      firstImage.bitmap.height
    );
    for (const { x, y } of outputImageIter) {
      const firstImagePixel = firstImage.getPixelColor(x, y) || 0;
      const secondImagePixel = secondImage.getPixelColor(x, y) || 0;
      outputImage.setPixelColor(PickCommonPixelsCommand.availableModes[flags.mode](firstImagePixel, secondImagePixel), x, y);
    }

    try {
      await outputImage.writeAsync(outputImagePath);
    } catch (e) {
      this.error('Failed to write image');
      this.error(e);
      return this.exit(1);
    }
    this.log(`Image written to ${outputImagePath}`);
  }
}
