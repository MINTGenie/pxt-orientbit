
/**
 * Use this file to define custom functions and blocks.
 * Read more at https://makecode.microbit.org/blocks/custom
 */

//% color="#4C97FF" icon="\uf0a4"
//% groups="['Wheel Encoder', 'Navigate', 'Color & Light', ' MPU9250 IMU', 'SMBus']"
namespace OrientBit {
    export enum wheelSide {
        left,
        right
    }

    class wheelEnc {
        is_enabled: boolean
        lpulse_cnt: number
        rpulse_cnt: number
        lrot_cnt: number
        rrot_cnt: number
        rot_cnt: number[]
        numSections: number
        circumf: number
        
        setup (lprt: DigitalPin, rprt: DigitalPin, nSect: number, circ: number): void {
            if(!this.is_enabled) {
                this.resetCnt()
                pins.setPull(lprt, PinPullMode.PullUp)
                pins.setPull(rprt, PinPullMode.PullUp)
                this.numSections = nSect
                this.is_enabled = true
                this.circumf = circ
            }
        }

        getCnt(): number[] {
            this.rot_cnt = [this.lrot_cnt, this.lpulse_cnt, this.rrot_cnt, this.rpulse_cnt]
            return this.rot_cnt
        }

        getLDist(): number {
            return ((this.lrot_cnt * 16) + this.lpulse_cnt) * this.circumf /this.numSections
        }

        getRDist(): number {
            return ((this.rrot_cnt * 16) + this.rpulse_cnt) * this.circumf /this.numSections
        }

        getLPulseCnt(): number {
            return (this.lrot_cnt * 16) + this.lpulse_cnt
        }

        getRPulseCnt(): number {
            return (this.rrot_cnt * 16) + this.rpulse_cnt
        }

        resetCnt(): void {
            this.lrot_cnt = 0
            this.rrot_cnt = 0
            this.lpulse_cnt = 0
            this.rpulse_cnt = 0
        }

        disableEncoder(): void {
            this.is_enabled = false
            this.resetCnt()
        }

    };

    let _wheelEnc: wheelEnc = new wheelEnc()

    /**
    * Reset the wheel encoder counter
    */    
    //% block="reset wheel rotation count"
    //% group="Wheel Encoder"
    export function resetWheelRotCnt (): void {
        _wheelEnc.resetCnt()
    }

    /**
    * Count the number of pulses from the wheel encoder - direction ignored
    * Enable before getting count
    * This function returns the total left pulse count
    */
    //% block="get $wheel encoder pulse counts"
    //% help="get the total number of pulses on Left or Right since reset"
    //% group="Wheel Encoder"
    export function getwheelPulseCount (wheel: wheelSide): number {
        if(wheel == 0 ) {
            return _wheelEnc.getLPulseCnt()
        } else {
            return _wheelEnc.getRPulseCnt()
        }
    }

    /**
    * Get the distance travelled by robot - direction ignored
    * Enable before getting distance
    * This function returns the total left/right distance travelled since reset
    */
    //% block="get $wheel wheel distance travelled"
    //% help="get the total distance travelled by Left or Right wheel since reset"
    //% group="Wheel Encoder"
    export function getwheelDist (wheel: wheelSide): number {
        if(wheel == 0 ) {
            return _wheelEnc.getLDist()
        } else {
            return _wheelEnc.getRDist()
        }
    }

    /**
    * Count the number of pulses from the wheel encoder - direction ignored
    * Enable before getting count
    * This function returns an array of 4 numbers which are:
    * left rotation count, left pulse count
    * right rotation count and right pulse count
    * The pulse count is the number of pulses before next full rotation is completed
    */ 
    //% block="get wheel rotation count"    
    //% help="returns an array containing the number of rotations and remaining pulses on both Left and Right since reset"
    //% group="Wheel Encoder"
    export function getRotationCount (): number[] {
        return _wheelEnc.getCnt()
 
    }

    /**
    * Disables the encoders - ports can be used for other functions
    */ 
    //% block="disable encoders"
    //% help="ports used for encoders can now be used for other sensors - disconnect cable"
    //% group="Wheel Encoder"    
    export function disableEncoders ():void {
        _wheelEnc.disableEncoder()
    }

    /**
    * Ports are now dedicated for encoder when enabled
    * @param lPort pin connected to left, eg: DigitalPin.P1
    * @param rPort pin connected to right, eg: DigitalPin.P2
    */ 
    //% block="setup encoder port %lPort %rPort sections %sections wheel circumference %circ cms"
    //% group="Wheel Encoder"
    //% lPort.defl=DigitalPin.P0
    //% rPort.defl=DigitalPin.P1
    //% sections.defl=16
    //% circ.defl=14
    //% help="Enables the wheel encoders on left and right with the number of white sections on the disc"
    export function enableEncoder (lPort: DigitalPin, rPort: DigitalPin, sections: number, circ: number):void {
        _wheelEnc.setup(lPort, rPort, sections, circ)
        pins.onPulsed(rPort, PulseValue.High, () => {
            if(_wheelEnc.is_enabled ){
                _wheelEnc.rpulse_cnt += 1
                
                if (_wheelEnc.rpulse_cnt >= _wheelEnc.numSections) {
                    _wheelEnc.rpulse_cnt = 0
                    _wheelEnc.rrot_cnt += 1
                }
            }
        });
        
        pins.onPulsed(lPort, PulseValue.High, () => {
            if(_wheelEnc.is_enabled ){
                _wheelEnc.lpulse_cnt += 1
            
                if (_wheelEnc.lpulse_cnt >= _wheelEnc.numSections) {
                    _wheelEnc.lpulse_cnt = 0
                    _wheelEnc.lrot_cnt += 1
                }
            }
        });
    }

    /**
    * Orient in the direction of the value specified and move forward..
    * @param is the preferred_heading angle to orient to.
    * This function returns an array of 2 numbers which are speeds for left and right motor
    */
    //% block="set heading direction to %preferred_heading degrees at speed %fwd_speed"
    //% group="Navigate"
    //% preferred_heading.min=0 preferred_heading.max=359
    //% preferred_heading.defl=90
    //% fwd_speed.min=28 fwd_speed.max=100
    //% fwd_speed.defl=35
    //% help="returns an array of 2 numbers which are speeds for left and right motor and then keeps moving forward"

    export function course_correct (preferred_heading: number, fwd_speed: number): number[] {
        big_diff_speed = 30
        correction_speed_low = 28
        correction_speed_high = 35
        fwd_speed_norm = fwd_speed
        small_err_bounds = 1
        big_err_bounds = 15
        while (!(ready)) {
            basic.pause(2)
        }
        get_reading = current_heading
        if (Math.abs(get_reading - preferred_heading) > big_err_bounds) {
            if (get_reading <= preferred_heading) {
                Left_motor_speed = big_diff_speed
                Right_motor_speed = 0
            } else if (get_reading >= preferred_heading) {
                Left_motor_speed = 0
                Right_motor_speed = big_diff_speed
            }
        } else {
            if (get_reading <= preferred_heading - small_err_bounds) {
                Left_motor_speed = correction_speed_high
                Right_motor_speed = correction_speed_low
            } else if (get_reading >= preferred_heading + small_err_bounds) {
                Left_motor_speed = correction_speed_low
                Right_motor_speed = correction_speed_high
            } else {
                Left_motor_speed = fwd_speed_norm
                Right_motor_speed = fwd_speed_norm
            }
        }
        motor_speed_l_r = [Left_motor_speed, Right_motor_speed]
        return motor_speed_l_r
    }
    let sampler = 0
    let motor_speed_l_r: number[] = []
    let Right_motor_speed = 0
    let Left_motor_speed = 0
    let current_heading = 0
    let get_reading = 0
    let ready = false
    let big_err_bounds = 0
    let small_err_bounds = 0
    let fwd_speed_norm = 0
    let correction_speed_high = 0
    let correction_speed_low = 0
    let big_diff_speed = 0

    control.inBackground(function () {
        while (true) {
            for (let index = 0; index <= 4; index++) {
                sampler += input.compassHeading()
                basic.pause(2)
            }
            current_heading = sampler / 5
            sampler = 0
            ready = true
        }
    })
    
    class mpu9250 {
        is_setup: boolean
        addr: number

        constructor(addr: number) {
            this.is_setup = false
            this.addr = addr
        }

        identify(): number {
            let result: number = smbus_readNumber(this.addr, 0x75, pins.sizeOf(NumberFormat.UInt8LE), true)
            return result
        }
        
        getRegAddr(regAddr: number): number {
            let result: number = smbus_readNumber(this.addr, regAddr, pins.sizeOf(NumberFormat.UInt8LE), true)
            return result
        }

        setup(): void {
            if (this.is_setup) return
            this.is_setup = true

            this.identify()
            
            smbus_writeByte(this.addr, 0x6B, 0x80)
            smbus_writeByte(this.addr, 0x6B, 0x0)
            smbus_writeByte(this.addr, 0x1B, 0x3 << 3)           
            smbus_writeByte(this.addr, 0x1A, 0x0 << 6)
            smbus_writeByte(this.addr, 0x6C, 0x00)
           /* smbus_writeByte(this.addr, 0x23, 0x70)
            smbus_writeByte(this.addr, 0x6A, 0x40)*/

        }


        light(): number {
            return this.raw()[0]
        }

        xyz(): number[] {
            let result: number[] = this.raw()
            /*for (let x: number = 0; x < result.length; x++) {
                result[x] = result[x] * 255
            }*/
            return result
        }

        raw(): number[] {
            this.setup()
            let result: Buffer = smbus_readBuffer(this.addr, 0x43, pins.sizeOf(NumberFormat.UInt16LE) * 3, true)
            return smbus_unpack("bbb", result)
        }
    };
    let _mpu9250: mpu9250 = new mpu9250(0x68)

    //% blockId=MINTGenieBit_get_regVal
    //% block="get Reg Val at %regAddr"
    //% group="MPU9250 IMU"
    //% help="Reads and returns the register value at the address"
    //% subcategory="Expert"
    export function getVal(regAddr: number): number {
        return (_mpu9250.getRegAddr(regAddr))
    }

    //% blockId=MINTGenieBit_get_identity
    //% block="get ident"
    //% group="MPU9250 IMU"
    //% help="returns the identity"
    export function getident(): number {
        return (_mpu9250.identify())
    }
    
    /**
     * Get the amount of red the colour sensor sees
     */
    //% blockId=MINTGenieBit_getGyroX
    //% block="get GyroX"
    //% group="MPU9250 IMU"
    export function getGyroX(): number {
        return (_mpu9250.xyz()[0])
    }

    /**
     * Get the amount of green the colour sensor sees
     */
    //% blockId=MINTGenieBit_getGyroY
    //% block="get GyroY"
    //% group="MPU9250 IMU"
    export function getGyroY(): number {
        return (_mpu9250.xyz()[1])
    }

    /**
     * Get the amount of blue the colour sensor sees
     */
    //% blockId=MINTGenieBit_get_GyroZ
    //% block="get GyroZ"
    //% group="MPU9250 IMU"
    export function getGyroZ(): number {
        return (_mpu9250.xyz()[2])
    }

    class tcs34725 {
        is_setup: boolean
        addr: number

        constructor(addr: number) {
            this.is_setup = false
            this.addr = addr
        }

        setup(): void {
            if (this.is_setup) return
            this.is_setup = true
            smbus_writeByte(this.addr, 0x80, 0x03)
            smbus_writeByte(this.addr, 0x81, 0x2b)
        }

        setIntegrationTime(time: number): void {
            this.setup()
            time = Math.clamp(0, 255, time * 10 / 24)
            smbus_writeByte(this.addr, 0x81, 255 - time)
        }

        light(): number {
            return this.raw()[0]
        }

        rgb(): number[] {
            let result: number[] = this.raw()
            let clear: number = result.shift()
            for (let x: number = 0; x < result.length; x++) {
                result[x] = result[x] * 255 / clear
            }
            return result
        }

        raw(): number[] {
            this.setup()
            let result: Buffer = smbus_readBuffer(this.addr, 0xb4, pins.sizeOf(NumberFormat.UInt16LE) * 4, false)
            return smbus_unpack("HHHH", result)
        }
    }
    let _tcs34725: tcs34725 = new tcs34725(0x29)

    /**
     * Get the light level
     */
    //% blockId=MINTGenieBit_get_light_clear
    //% block="get light"
    //% help="get level of light"
    //% group="Colour & Light"
    export function getLight(): number {
        return Math.round(_tcs34725.light())
    }

    /**
     * Get the amount of red the colour sensor sees
     */
    //% blockId=MINTGenieBit_get_light_red
    //% block="get red"
    //% help="get level of red color"
    //% group="Colour & Light"
    export function getRed(): number {
        return Math.round(_tcs34725.rgb()[0])
    }

    /**
     * Get the amount of green the colour sensor sees
     */
    //% blockId=MINTGenieBit_get_light_green
    //% block="get green"
    //% help="get level of green color"
    //% group="Colour & Light"
    export function getGreen(): number {
        return Math.round(_tcs34725.rgb()[1])
    }

    /**
     * Set the integration time of the colour sensor in ms
     */
    //% blockId=MINTGenieBit_set_integration_time
    //% block="set colour integration time %time ms"
    //% time.min=0 time.max=612 value.defl=500
    //% group="Colour & Light"
    //% subcategory="Expert"
    //% weight=90
    export function setColourIntegrationTime(time: number): void {
        return _tcs34725.setIntegrationTime(time)
    }

    /**
     * Get the amount of blue the colour sensor sees
     */
    //% blockId=MINTGenieBit_get_light_blue
    //% block="get blue"
    //% group="Colour & Light"
    //% help="get level of blue color"
    export function getBlue(): number {
        return Math.round(_tcs34725.rgb()[2])
    }

    /**
     * SMBus functions
     */
    
    //% block="create Buffer of size %size"
    //% group="SMBus"
    //% subcategory="Expert"
    //% weight=80
    export function createBuf(sz: number):Buffer {
        let temp = pins.createBuffer(sz + 1);
        return temp
    }

    //% block="write to Device addr %addr at Reg address %register a value %value"
    //% group="SMBus"
    //% subcategory="Expert"
    //% weight=40
    export function smbus_writeByte(addr: number, register: number, value: number): void {
        let temp = pins.createBuffer(2);
        temp[0] = register;
        temp[1] = value;
        pins.i2cWriteBuffer(addr, temp, false);
    }

    //% block="write to Device addr %addr at Reg address %register a buffer %value"
    //% group="SMBus"
    //% subcategory="Expert"
    //% weight=30
    export function smbus_writeBuffer(addr: number, register: number, value: Buffer): void {
        let temp = pins.createBuffer(value.length + 1);
        temp[0] = register;
        for (let x = 0; x < value.length; x++) {
            temp[x + 1] = value[x];
        }
        pins.i2cWriteBuffer(addr, temp, false);
    }
    
    //% block="read buffer from Device addr %addr at Reg address %register with length %fmt - using repeat start %repeat_start"
    //% repeat_start.defl=true
    //% group="SMBus"
    //% subcategory="Expert"
    //% weight=20
    export function smbus_readBuffer(addr: number, register: number, len: number, repeat_start: boolean): Buffer {
        let temp = pins.createBuffer(1);
        temp[0] = register;
        pins.i2cWriteBuffer(addr, temp, repeat_start);
        return pins.i2cReadBuffer(addr, len, false);
    }

    //% block="read value from Device addr %addr at Reg address %register in format %fmt - using repeat start %repeat_start"
    //% repeat_start.defl=true
    //% group="SMBus"
    //% subcategory="Expert"
    //% weight=10
    export function smbus_readNumber(addr: number, register: number, fmt: NumberFormat = NumberFormat.UInt8LE, repeat_start: boolean): number {
        let temp = pins.createBuffer(1);
        temp[0] = register;
        pins.i2cWriteBuffer(addr, temp, repeat_start);
        return pins.i2cReadNumber(addr, fmt, false);
    }
    
    function smbus_unpack(fmt: string, buf: Buffer): number[] {
        let le: boolean = true;
        let offset: number = 0;
        let result: number[] = [];
        let num_format: NumberFormat = 0;
        for (let c = 0; c < fmt.length; c++) {
            switch (fmt.charAt(c)) {
                case '<':
                    le = true;
                    continue;
                case '>':
                    le = false;
                    continue;
                case 'c':
                case 'B':
                    num_format = le ? NumberFormat.UInt8LE : NumberFormat.UInt8BE; break;
                case 'b':
                    num_format = le ? NumberFormat.Int8LE : NumberFormat.Int8BE; break;
                case 'H':
                    num_format = le ? NumberFormat.UInt16LE : NumberFormat.UInt16BE; break;
                case 'h':
                    num_format = le ? NumberFormat.Int16LE : NumberFormat.Int16BE; break;
            }
            result.push(buf.getNumber(num_format, offset));
            offset += pins.sizeOf(num_format);
        }
        return result;
    }
}