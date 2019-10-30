img-pcp
=======

Takes two images as input and outputs a 3rd image that contains only the identical pixels from the two images (or the pixels that are different depending on the `-m` flag). Not tested with two images that have different sizes.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/SeinopSys/img-pcp/blob/master/package.json)

# Usage

 * `img-pcp file1.png file2.png output.png`<br>
   Copy matching pixels to `output.png`

 * `img-pcp file1.png file2.png output.png -m sub`<br>
   Copy pixels of `file1.png` that do not match `file2.png` onto `output.png` 
