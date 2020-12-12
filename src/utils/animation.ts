/**
 * 动画调用
 */
export default {
    // 砖石动画
    diamond() {
        return new Promise((resolve, reject) => {
            let main: any = document.querySelector('.jr-courseware');
            let ani = document.createElement('img');
            ani.setAttribute('class', 'jr-courseware-animation');
            ani.setAttribute('src', '/image/zh_CH_dia-large.png');
            main.appendChild(ani)
            setTimeout(() => {
                main.removeChild(ani);
                resolve()
            }, 1000)
        })
    },

    // 激励动画
    heart(name: string) {
        return new Promise((resolve, reject) => {
            let main: any = document.querySelector('.jr-courseware');
            let ani = document.createElement('div');
            ani.setAttribute('class', 'jr-courseware-test');
            ani.innerHTML = name;
            main.appendChild(ani)
            setTimeout(() => {
                main.removeChild(ani);
                resolve()
            }, 3000)
            resolve();
        })
    }
}