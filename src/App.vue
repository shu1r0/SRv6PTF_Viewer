<template>
  <header id="header">
    <h1 id="title">SRv6 PTF Viewer</h1>
    <div id="nav">
      <details>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <summary><span class="material-symbols-outlined">menu</span></summary>
        <ul>
          <li><router-link to="/">VIEWER</router-link ></li>
          <li><router-link to="/home">HOME</router-link ></li>
        </ul>
      </details>
    </div>
  </header>

  <div id="wrapper">
    <router-view v-slot="{ Component }" :client="remoteClient">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>

</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { WSClient } from "./scripts/remote/remoteClient";

//@ts-ignore
import config from "./assets/viewer_config.json";

// import PathView from "@/views/PathView.vue"

const WEBSOCKET_IPADDRESS = config.websocket.ip_address
const WEBSOCKET_PORT = config.websocket.port

export const viewConfig = {
  flowRepresentation: "thickness",
  flowThickness: 1,
}

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
  background-color: $white;
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
    border-bottom: 0.5rem solid $navy;

    display: grid;
    grid-template-columns: 1fr 2fr;

    h1{
      grid-column: 1;
      margin: 1rem 2rem;
      font-size: 2.5rem;
    }
    #nav{
      grid-column: 2;
      font-size: 1rem;
      text-align: right;
      details{
        display: block;
        summary{
          display: block;
        }
        ul{
          background-color: $white;
          // width: 10rem;
          li{
            list-style-type: none;
            font-size: 1.5rem;
          }
        }
      }
    }
    .material-symbols-outlined {
      font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 48
    } 
  }


  #wrapper{
    grid-area: wrapper;
    // background-color: #42b983;
  }

}

</style>
