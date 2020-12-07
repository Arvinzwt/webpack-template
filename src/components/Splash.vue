<template>
    <!--闪屏-->
    <div class="splash"
         v-if="!completed">
        <div class="icon"></div>
        <div class="splash-view icon"></div>
        <div class="splash-view" :style="style">
            <div class="loadRoad">
                <span class="loading"
                      :style="{width: percenWidth}"></span>
                <span class="loadtip">{{text}}</span>
                <span class="loadpercen">{{percen}}%</span>
            </div>
        </div>
    </div>
    <!--//闪屏-->
</template>

<script>
export default {
    name: "Splash",
    props: ['icon'],
    data () {
        return {
            step: 0,
            total: 1,
            text: "loading",
            show: false,
            completed: false
        };
    },
    computed: {
        percen () {
            return Math.round((this.step / this.total) * 100);
        },
        percenWidth () {
            return (this.step / this.total) * 100 + "%";
        },
        style () {
            return "background: url(" + this.$t('splash') + ") 20px center no-repeat";
        }
    },
    methods: {
        init: function (total) {
            this.completed = false;
            this.total = total;
            this.progress(1, "loading...");
        },
        reset: function (text) {
            this.completed = false;
            this.step = 1;
            this.text = text || "reload...";
        },
        progress: function (step, text) {
            this.step += step;
            this.text = text || "";
        },
        complete: function (text) {
            this.text = text;
            this.step = this.total;
            this.completed = true;
        }
    },
    created () {
        this.splash.on("init", this.init);
        this.splash.on("reset", this.reset);
        this.splash.on("progress", this.progress);
        this.splash.on("complete", this.complete);
        this.splash.init(30);
    }
};
</script>

<style lang="scss" scoped>
.splash {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(118, 180, 247, 1) 0%, rgba(78, 131, 229, 1) 100%);

    .splash-view {
        position: absolute;
        width: 600px;
        height: 510px;
        left: 50%;
        top: 40%;
        margin-left: -300px;
        margin-top: -230px;
        text-align: center;
    }

    .loadRoad,
    .loading {
        width: 1px;
        max-width: 500px;
        height: 10px;
        border-radius: 4px;
        background: #fff;
        text-align: center;
        position: absolute;
    }

    .loadRoad {
        width: 500px;
        top: 570px;
        left: 50%;
        margin-left: -250px;
    }

    .loading {
        background: rgb(217, 55, 48);
        width: 0px;
        top: 0px;
        display: block;
        transition: width 0.5s;
    }

    .loadtip,
    .loadpercen {
        position: relative;
        display: inline-block;
        top: -25px;
        width: 100%;
        text-align: left;
        font-size: 14px;
        color: #ffffff;
    }

    .loadpercen {
        top: -40px;
        font-size: 10px;
        text-align: right;
    }
}
</style>

