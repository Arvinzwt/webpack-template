<template>
    <div class="home">
        <el-row>
            <img class="logo"
                 :src="$t('logo')" />
        </el-row>
        <help :msg="$t('message')"></help>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
// @ is an alias to /src
import Help from "./../components/Help.vue";
@Component({
    name: "Home",
    components: { Help },
})
export default class Home extends Vue {

}
</script>
<style lang="scss" scoped>
.home {
    text-align: center;
}
</style>
