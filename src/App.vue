<template>
  <header id="header">
    <h1>SRv6 PTF Viewer</h1>
  </header>

   <div id="wrapper">
     <router-view 
     :client="remoteClient"/>
   </div>
 
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { WSClient } from "./scripts/remote/remoteClient";

// import PathView from "@/views/PathView.vue"

const WEBSOCKET_IPADDRESS = "127.0.0.1"
const WEBSOCKET_PORT = "8888"

export default defineComponent({
  name: "App",
  setup(){
    /**
     * document title
     */
    document.title = "SRv6 PTF Viewer"

    /**
     * remote client and set client to vnet
     */
    const remoteClient = new WSClient(WEBSOCKET_IPADDRESS, WEBSOCKET_PORT)

    onMounted(() => {
      /**
       * connection to remote client
       */
      // remoteClient.connect()
    })

    return {
      remoteClient
    }
  }
})
</script>

<style lang="scss">

html {
  font-size: 62.5%;  /* 1rem -> 10px */
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: $black;

  display: grid;
  grid-template-areas: 
    " header "
    " wrapper ";
  grid-auto-rows: 
    6rem
    minmax(50rem, auto);
  grid-auto-columns: 
    auto;
  grid-gap: 1rem;
  
  #header{
    grid-area: header;
    // background-color: #f0f0f9;
    border-bottom: 0.5rem solid $navy;
    // padding: 1.5rem;
    h1{
      margin: 1rem 2rem;
      font-size: 2.5rem;
    }
  }

  // #nav {
  //   grid-area: nav;
  //   border-right: 1px solid $navy;
  //   background-color: $white;
  //   word-break : break-all;  // refrain
  //   font-size: 1.3rem;
  //   // padding: 30px;

  //   .nav-item{
  //     display: grid;
  //     background-color: $white;
  //     width: 5rem;
  //     height: 5rem;
  //     justify-items: center;

  //     a {
  //       font-weight: bold;
  //       color: $navy;
  //       border: 1px solid $navy;
  //     }
  //     a.router-link-exact-active {
  //       color: $white;
  //       background-color: $navy;
  //       border: 2px solid $navy;
  //     }
  //   }
  // }

  #wrapper{
    grid-area: wrapper;
    // background-color: #42b983;
  }

}

</style>
