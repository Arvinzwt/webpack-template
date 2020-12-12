// const isClose = true;
const isClose = false;
// console.log = () => {};

enum LogColor {
    title = 'color: black;font-weight: 600; font-size: 20px;',
    info = 'font-weight: bold',
    warn = 'color: yellow;font-weight: 600;',
    erro = 'color: red;font-weight: 600;',
    str =  'background: rgba(100, 100, 219, .3); padding: 1px 5px; border: 1px solid rgba(0, 0, 0, 0.1)',
    obj = 'background: skyblue; padding: 1px 5px; border: 1px solid rgba(0, 0, 0, 0.1)',
}

enum LogType {
    title = 'title',
    info = 'info',
    warn = 'warn',
    erro = 'erro',
    str = 'str',
    obj = 'obj',
}

class MyConsole {
    public info(outport = '', type: LogType = LogType.str, close = isClose) {
        if (close) { return; }

        let arr:any = [];

        if (typeof outport === 'string') {
            let shuchu = type === 'obj' ? '%c' + '/*** ' + outport + ' ***/' : '%c' + outport;
            arr = [shuchu, LogColor[type]];
          } else {
            arr = [outport];
        }

        console.log(...arr);
    }
}

export default MyConsole;
