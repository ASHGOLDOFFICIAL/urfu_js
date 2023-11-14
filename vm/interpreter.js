const readline = require('readline');

function readInput() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(
        resolve => rl.question("", answer => {
            rl.close();
            resolve(answer);
        }
    ))
}


class Registers {
    constructor() {
        this.ax = 0;
        this.bx = 0;
        this.cx = 0;
        this.dx = 0;

        this.ex = 0;
        this.fx = 0;
        this.gx = 0;
        this.hx = 0;

        this.pc = 0;
        this.fgs = {
            zf: 0,
        };
        Object.seal(this.fls);
    }
}


class Interpreter {
    instructions = {
        exit() { // stop execution
            this.on = false;
        },


        async in_int() { // wait for user input, store in register
            this.regs.pc += 2;
            const reg = this.mem[this.regs.pc - 1];
            this.putInReg.call(this,
                reg, + await readInput()
            );
        },
        mov() { // move value of one register to another
            this.regs.pc += 3;
            const reg = this.mem[this.regs.pc - 2];
            const val = this.getValue.call(this,
                this.mem[this.regs.pc - 1]
            );
            this.putInReg.call(this,
                reg, val
            );
        },
        cat() { // output content of register
            this.regs.pc += 2;
            const reg = this.mem[this.regs.pc - 1];
            console.log(this.getValue.call(
                this, reg
            ));
        },


        add() { // add value of one register to another
            this.regs.pc += 3;
            const reg1 = this.mem[this.regs.pc - 2];
            const reg2 = this.mem[this.regs.pc - 1];

            this.putInReg.call(this,
                reg1, this.getValue.call(this, reg1) +
                      this.getValue.call(this, reg2)
            )
        },
        sub() { // substract value of one register from another
            this.regs.pc += 3;
            const reg1 = this.mem[this.regs.pc - 2];
            const reg2 = this.mem[this.regs.pc - 1];

            this.putInReg.call(this,
                reg1, this.getValue.call(this, reg1) -
                      this.getValue.call(this, reg2)
            )
        },
        mul() { // mul value of one register to another
            this.regs.pc += 3;
            const reg1 = this.mem[this.regs.pc - 2];
            const reg2 = this.mem[this.regs.pc - 1];

            this.putInReg.call(this,
                reg1, this.getValue.call(this, reg1) *
                      this.getValue.call(this, reg2)
            )
        },
        mod() { // get modulus
            this.regs.pc += 3;
            const reg1 = this.mem[this.regs.pc - 2];
            const reg2 = this.mem[this.regs.pc - 1];

            this.putInReg.call(this,
                reg1, this.getValue.call(this, reg1) %
                      this.getValue.call(this, reg2)
            )

        },
        inc() { // increment value of register
            this.regs.pc += 2;
            const reg = this.mem[this.regs.pc - 1];
            this.putInReg.call(this,
                reg, this.getValue.call(this, reg) + 1
            );
        },
        dec() { // decrement value of register
            this.regs.pc += 2;
            const reg = this.mem[this.regs.pc - 1];
            this.putInReg.call(this,
                reg, this.getValue.call(this, reg) - 1
            );
        },
        min() { // store in register smaller value
            this.regs.pc += 3;
            const reg1 = this.mem[this.regs.pc - 2];
            const reg2 = this.mem[this.regs.pc - 1];

            this.putInReg.call(this,
                reg1, Math.min(
                    this.getValue.call(this, reg1),
                    this.getValue.call(this, reg2)
                )
            )
        },
        max() {
            this.regs.pc += 3;
            const reg1 = this.mem[this.regs.pc - 2];
            const reg2 = this.mem[this.regs.pc - 1];

            this.putInReg.call(this,
                reg1, Math.max(
                    this.getValue.call(this, reg1),
                    this.getValue.call(this, reg2)
                )
            )
        },

        
        cmp() { // compare values in registers, put 1 in pws.zf if equal
            this.regs.pc += 3;
            const reg1 = this.mem[this.regs.pc - 2];
            const reg2 = this.mem[this.regs.pc - 1];
            this.regs.fgs.zf = + (
                this.getValue.call(this, reg1) ===
                this.getValue.call(this, reg2)
            );
        },
        pass() { // do nothing
            this.regs.pc += 1;
        },
        jmp() { // jump to label
            this.regs.pc = + this.mem[this.regs.pc + 1];
        },
        jeq() { // jump if equal
            this.regs.pc += 2;
            if (this.regs.fgs.zf !== 0)
                this.regs.pc = + this.mem[this.regs.pc - 1];
        },
        jne() { // jump if not equal
            this.regs.pc += 2;
            if (this.regs.fgs.zf === 0)
                this.regs.pc = + this.mem[this.regs.pc - 1];
        },
    }

    constructor(mem) {
        this.regs = new Registers();
        this.mem = mem;
        this.on = false;
        Object.seal(this.regs);
    }

    getValue(arg) {
        if (arg.charAt(0) === '%')
            return this.regs[arg.slice(1)]
        return + arg;
    }

    putInReg(reg, val) {
        this.regs[reg.slice(1)] = val;
    }

    async run() {
        this.on = true;
        while (this.on) {
            const valueInMem = this.mem[ this.regs.pc ];
            //console.log(this.regs, valueInMem);
            const command = this.instructions[ valueInMem ];
            await command.call(this);
        }
    }
}


module.exports = { Interpreter };
