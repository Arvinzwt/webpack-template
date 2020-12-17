<template>
    <div class="home">
        <button @click="fn">连接</button>
    </div>
</template>

<script>

export default {
    methods: {
        fn() {
            this.$socket.login()
        }
    }
}
</script>
