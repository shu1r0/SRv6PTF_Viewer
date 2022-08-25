<!-- 
  todo:
    * クラスにIDの情報を含める
    
 -->

<template>
  <div id="packet-list" class="packet-list">
    <input type="text" name="path-filter" id="path-filter" v-model="filter" style="width: 50%" placeholder="ex.) ipv6.src =='fc00::1:2'">
    <button @click="filteredPathsRequest(filter)">filter</button>
    
    <!-- render from ViewTable -->
    <table id="packet-list-table">
      <!-- Header -->
      <tr>
        <th
          v-for="(head, index) in viewTable.header"
          :key = "index"
          >
          {{ head }}
        </th>
      </tr>

      <!-- Contents -->
      <tr
          v-for="(content, index) in viewTable.contents"
          :key="'trace' + index"
          @click="emitClickPacketPath(viewTable.paths[index])"
          :class="[viewTable.classes[index]]">
        <td
          v-for="columnIndex in viewTable.columnNum"
          :key="columnIndex"
          >
          {{ content[columnIndex] }}
        </td>
      </tr>
    </table>

  </div>
</template>

<script lang="ts">
import { ViewPathTable, ViewTable } from '@/scripts/utils/path_view'
import { defineComponent, PropType, ref, watch, getCurrentInstance } from 'vue'

export default defineComponent({
  props: {
    srv6Paths: Object as PropType<any[]>
  },
  setup(props, ctx) {
    const viewTable = ref<ViewPathTable>(new ViewPathTable())
    const filter = ref<string>("")
    let emitedFilter = ""

    // const forceUpdate = () => {
    //   const instance = getCurrentInstance()
    //   instance?.proxy?.$forceUpdate()
    // }

    watch(() => props.srv6Paths, (newPaths, oldPaths) => {
      viewTable.value = new ViewPathTable()
      newPaths?.forEach(path => {
        let styleClass = ""
        if(emitedFilter){
          styleClass = "NoMark"
        }
        path.marks.forEach((mark: any) => {
          // parse mark
          if(mark.name == "FilteredMark"){
            styleClass = mark.name
          }
        });
        viewTable.value.addPath(path.packets, styleClass)
      })
    }, {deep: true})

    const emitClickPacketPath = (nodes: string[]) => {
      ctx.emit("clickPacketPath", nodes)
    }

    const filteredPathsRequest = (filter: string) => {
      ctx.emit("filteredPathsRequest", filter)
      emitedFilter = filter
    }

    return {
      viewTable,
      emitClickPacketPath,
      filteredPathsRequest,
      filter
    }
  },
})
</script>

<style lang="scss">
.packet-list{
  font-size: 1.5rem;
  border: 1px solid $black;
  border-collapse: collapse;
  z-index: 0;

  table, tr, th, td{
    border: 1px solid $black;
    border-collapse: collapse;
  }

  #packet-list-table{
    width: 100%;

    .NoMark{
      display: none;
    }
  }
}
</style>
