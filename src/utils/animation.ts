/**
 * 动画调用
 */
export default {
    // 砖石动画
    diamond() {
        return new Promise((resolve, reject) => {
            let main: any = document.querySelector('.courseware');
            let ani = document.createElement('div');
            ani.setAttribute('class', 'courseware-animation');
            main.appendChild(ani)
            setTimeout(() => {
                main.removeChild(ani);
                resolve()
            }, 3000)
            resolve();
        })
    },

    // 激励动画
    heart(name: string) {
        return new Promise((resolve, reject) => {
            let main: any = document.querySelector('.courseware');
            let ani = document.createElement('div');
            ani.setAttribute('class', 'courseware-test');
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