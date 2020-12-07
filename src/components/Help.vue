<template>
    <div>
        <h1>{{ msg }}</h1>

        <h3>本项目已经配置</h3>
        <ul>
            <li> router </li>
            <li> vuex </li>
            <li> i18n(network) </li>
            <li> typescript </li>
            <li> reset.css </li>
            <li> element-ui </li>
            <li> vue-socket.io </li>
            <li> axios </li>
            <li> agora sdk </li>
        </ul>

        <h3>Ecosystem</h3>
        <ul>
            <li>
                <a href="https://router.vuejs.org"
                   target="_blank"
                   rel="noopener">vue-router</a>
            </li>
            <li>
                <a href="https://vuex.vuejs.org"
                   target="_blank"
                   rel="noopener">vuex</a>
            </li>
            <li>
                <a href="https://github.com/vuejs/vue-devtools#vue-devtools"
                   target="_blank"
                   rel="noopener">vue-devtools</a>
            </li>
            <li>
                <a href="https://vue-loader.vuejs.org"
                   target="_blank"
                   rel="noopener">vue-loader</a>
            </li>
            <li>
                <a href="https://github.com/vuejs/awesome-vue"
                   target="_blank"
                   rel="noopener">awesome-vue</a>
            </li>
        </ul>

        <h3>代码片段</h3>
        <p>vscode/Preferences/vue.json</p>
        <pre style="text-align:left; font-size:12">
&quot;template-ts&quot;: {
  &quot;prefix&quot;: &quot;template-ts&quot;,
  &quot;body&quot;: [
      &quot;&lt;template&gt;&quot;,
      &quot;\t\t&lt;div&gt;&lt;/div&gt;&quot;,
      &quot;&lt;/template&gt;&quot;,
      &quot;&lt;script lang=&#x27;ts&#x27;&gt;&quot;,
      &quot;import { Component, Vue } from &#x27;vue-property-decorator&#x27;&quot;,
      &quot;@Component({ name: &#x27;$1&#x27; })&quot;,
      &quot;export default class $1 extends Vue {&quot;,
      &quot;\t\t$2&quot;,
      &quot;}&quot;,
      &quot;&lt;/script&gt;&quot;,
      &quot;&lt;style lang=&#x27;scss&#x27; scoped&gt;&quot;,
      &quot;&lt;/style&gt;&quot;
  ],
  &quot;description&quot;: &quot;Vue file template&quot;
}
        </pre>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
    name: "Help"
})
export default class HelloWorld extends Vue {
    @Prop() private msg!: string;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
div {
    width: 540px;
    margin: 0 auto;
    h3 {
        margin: 60px 0 20px;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }
    li {
        display: inline-block;
        margin: 10px;
    }
    a {
        color: #42b983;
    }
    pre {
        text-align: left;
        font-size: 15px;
        font-family: "Courier New", Courier, monospace;
        padding: 10px;
        line-height: 20px;
    }
}
</style>
