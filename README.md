
> Open this page at [https://mintgenie.github.io/pxt-orientbit/](https://mintgenie.github.io/pxt-orientbit/)

![image](https://user-images.githubusercontent.com/66748747/110723615-9e328580-8214-11eb-8e94-2296814e6245.png)
![image](https://user-images.githubusercontent.com/66748747/118565288-377c9b80-b772-11eb-8f18-6f28a4b105be.png)

Here is the OrientBit - used to change the orientation of MicroBit on certain Robots so that the built-in Compass can be used.
It can also be used to add a I2C OLED Display (SSD1306), 2 Wheel encoders, a TCS34725 color sensor and MPU9250 IMU.

Use this extension along with [https://github.com/fizban99/microbit_ssd1306](https://github.com/fizban99/microbit_ssd1306) for OLED

Usage Example 1:
    Here is an example implementation of reading out the Number of Rotations of wheel from the Encoder and displaying it on the
    OLED Display -
    ![image](https://user-images.githubusercontent.com/66748747/118565075-d6ed5e80-b771-11eb-8672-9f8f9566ecde.png)

Usage Example 2:
    Here is an example of using the Maqueen extension and with the onboard Compass to orient the Maqueen to a particular direction -
    ![image](https://user-images.githubusercontent.com/66748747/118570149-d063e480-b77b-11eb-851e-4766f541ea60.png)
    link: [https://makecode.microbit.org/_fuP0f2UTicXt](https://makecode.microbit.org/_fuP0f2UTicXt)
    The course correct block returns 2 values as an array which are each the speeds of left and right motors.

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/mintgenie/pxt-orientbit** and import

## Edit this project ![Build status badge](https://github.com/mintgenie/pxt-orientbit/workflows/MakeCode/badge.svg)

To edit this repository in MakeCode.

* open [https://makecode.microbit.org/](https://makecode.microbit.org/)
* click on **Import** then click on **Import URL**
* paste **https://github.com/mintgenie/pxt-orientbit** and click import

## Blocks preview

This image shows the blocks code from the last commit in master.
This image may take a few minutes to refresh.

![A rendered view of the blocks](https://github.com/mintgenie/pxt-orientbit/raw/master/.github/makecode/blocks.png)

#### Metadata (used for search, rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
