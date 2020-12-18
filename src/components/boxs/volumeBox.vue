<template>
    <div class="jr-local-video_wrap">
        <!--声音状态-->
        <ul class="video-item-icon icon4">
            <li v-for="(item, idx) in 10" :key="idx" :class="{'active': idx < level }"></li>
        </ul>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
@Component({
    name: 'Volume'
})
export default class Volume extends Vue {
    private level: number = 5;
    private intervalId:any
    


    private mounted() {
        this.bind();
    }

    private bind() {
        this.$videoStream.on('localAudioLevel', (res:any) => {
            this.level = res;
        })
    }

    private init(stream:any) {
        if(!stream) return;
        clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
            this.level = Math.round(stream.getAudioLevel() * 10);
        }, 100);
    }
}
</script>
<style lang="scss">

</style>