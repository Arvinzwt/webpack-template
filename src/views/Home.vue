<template>
    <div class="jr-home">
        <el-header class="jr-home-header" height="50px">
            <router-link to="/">{{ $t('home') }}</router-link>
            <span class="p-1">|</span>
            <router-link to="/about">{{ $t('about') }}</router-link>
            <span class="p-1">|</span>
            <router-link to="/1v1">1v1</router-link>
            <span class="p-1">|</span>
            <router-link to="/1v4">1v4</router-link>
            <debugger-popover class="right" @locale="localeChangeHandler"></debugger-popover>
        </el-header>
        <el-row>
            <img class="logo" :src="$t('logo')" alt="logo"/>
        </el-row>
        <help-template :msg="$t('message')"></help-template>
    </div>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import HelpTemplate from "./../components/Help.vue";
import DebuggerPopover from '@/components/DebuggerPopover.vue';


@Component({
    name: "Home",
    components: {HelpTemplate,DebuggerPopover},
})

export default class Home extends Vue {
    /**
     * @desc 判定当前语言
     * @param lang[any]
     */
    private localeChangeHandler(lang: any) {
        if (this.$i18n) {
            this.$i18n.locale = lang || process.env.VUE_APP_I18N_LOCALE;
        }
    }
}
</script>
<style lang="scss" scoped>
.jr-home {
    flex: 1;
    text-align: center;

    .jr-home-header{
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        a{
            color: #fafafa;
        }

        .right{
            position: absolute;
            right: 0;
            top: 50%;
            margin-top: -20px;
        }
    }
}
</style>
